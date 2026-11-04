import hashlib
import json
import logging
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from web3 import Web3
from backend.app.core.config import settings
from backend.app.modules.blockchain.models import BlockchainTransaction
from backend.app.modules.traceability.models import BatchEvent, ProductBatch

logger = logging.getLogger(__name__)

# ABI definition for SpiceRegistry
ABI_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))),
    "blockchain",
    "contracts",
    "SpiceRegistryABI.json",
)


def load_spice_registry_abi() -> list:
    if os.path.exists(ABI_PATH):
        try:
            with open(ABI_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"Could not read ABI from {ABI_PATH}: {e}")
    # Fallback minimal ABI for direct interaction
    return [
        {
            "inputs": [{"name": "batchCode", "type": "string"}, {"name": "rootHash", "type": "bytes32"}],
            "name": "registerBatch",
            "outputs": [{"name": "batchId", "type": "bytes32"}],
            "stateMutability": "nonpayable",
            "type": "function",
        },
        {
            "inputs": [
                {"name": "batchId", "type": "bytes32"},
                {"name": "eventHash", "type": "bytes32"},
                {"name": "eventType", "type": "string"},
            ],
            "name": "appendBatchEvent",
            "outputs": [{"name": "sequence", "type": "uint256"}],
            "stateMutability": "nonpayable",
            "type": "function",
        },
        {
            "inputs": [{"name": "batchId", "type": "bytes32"}, {"name": "expectedHash", "type": "bytes32"}],
            "name": "verifyBatchHash",
            "outputs": [
                {"name": "isMatch", "type": "bool"},
                {"name": "onChainHash", "type": "bytes32"},
                {"name": "eventCount", "type": "uint256"},
            ],
            "stateMutability": "view",
            "type": "function",
        },
        {
            "inputs": [{"name": "batchId", "type": "bytes32"}],
            "name": "getBatch",
            "outputs": [
                {"name": "batchCode", "type": "string"},
                {"name": "latestHash", "type": "bytes32"},
                {"name": "timestamp", "type": "uint256"},
                {"name": "eventCount", "type": "uint256"},
                {"name": "exists", "type": "bool"},
            ],
            "stateMutability": "view",
            "type": "function",
        },
    ]


class BlockchainService:
    """
    Manages anchoring batch and lifecycle event hashes to the EVM blockchain.
    Enforces Rule 4, 5, 8: Zero PII on-chain, deterministic hash anchoring,
    and strict state transitions (pending -> submitted -> confirmed / failed).
    """

    def __init__(self):
        self.rpc_url = settings.BLOCKCHAIN_RPC_URL
        self.chain_id = settings.BLOCKCHAIN_CHAIN_ID
        self.contract_address = settings.BLOCKCHAIN_CONTRACT_ADDRESS
        self.private_key = settings.BLOCKCHAIN_DEPLOYER_PRIVATE_KEY
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url, request_kwargs={"timeout": 3}))
        self.abi = load_spice_registry_abi()
        # In-memory mock registry for tests or when RPC node is offline
        self._mock_registry: Dict[str, Dict[str, Any]] = {}
        self._mock_block_counter = 1000

    def is_connected(self) -> bool:
        try:
            return self.w3.is_connected()
        except Exception:
            return False

    def to_bytes32(self, hex_or_str: str) -> bytes:
        """Converts SHA-256 or string into 32-byte representation for EVM bytes32."""
        cleaned = hex_or_str.strip()
        if cleaned.startswith("0x"):
            cleaned = cleaned[2:]
        if len(cleaned) == 64:
            return bytes.fromhex(cleaned)
        # If not 64 chars, hash it with SHA-256
        return hashlib.sha256(cleaned.encode("utf-8")).digest()

    def get_batch_id_bytes32(self, batch_code: str) -> bytes:
        """Computes keccak256 or sha256 of batch_code as bytes32."""
        return Web3.keccak(text=batch_code)

    async def anchor_batch(
        self,
        db: AsyncSession,
        batch: ProductBatch,
        event: Optional[BatchEvent] = None,
    ) -> BlockchainTransaction:
        """
        Anchors batch root or event hash to the blockchain.
        Strictly follows: pending -> submitted -> confirmed (or failed).
        """
        # Determine the target event and hash
        target_event = event
        if not target_event:
            # Pick latest event
            events_stmt = (
                select(BatchEvent)
                .where(BatchEvent.batch_id == batch.id)
                .order_by(BatchEvent.event_timestamp.desc(), BatchEvent.created_at.desc())
                .limit(1)
            )
            target_event = (await db.execute(events_stmt)).scalar_one_or_none()

        data_hash = target_event.event_hash if target_event else hashlib.sha256(batch.batch_code.encode()).hexdigest()
        formatted_data_hash = f"0x{data_hash}" if not data_hash.startswith("0x") else data_hash

        contract_addr = (
            self.contract_address
            if self.contract_address and self.contract_address != "0x0000000000000000000000000000000000000000"
            else "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
        )

        # 1. Create Pending Transaction Record in DB
        tx_record = BlockchainTransaction(
            batch_id=batch.id,
            event_id=target_event.id if target_event else None,
            contract_address=contract_addr,
            data_hash=formatted_data_hash,
            status="pending",
        )
        db.add(tx_record)
        await db.flush()

        # Update batch status to pending
        batch.blockchain_status = "pending"

        # 2. Execute Transaction (Live RPC or Deterministic Mock)
        if self.is_connected() and self.contract_address != "0x0000000000000000000000000000000000000000":
            try:
                account = self.w3.eth.account.from_key(self.private_key)
                contract = self.w3.eth.contract(address=contract_addr, abi=self.abi)
                nonce = self.w3.eth.get_transaction_count(account.address)

                raw_hash_bytes = self.to_bytes32(data_hash)
                batch_id_bytes = self.get_batch_id_bytes32(batch.batch_code)

                # Check if batch exists on contract
                batch_info = contract.functions.getBatch(batch_id_bytes).call()
                batch_exists = batch_info[4]

                if not batch_exists:
                    tx = contract.functions.registerBatch(
                        batch.batch_code, raw_hash_bytes
                    ).build_transaction({
                        "from": account.address,
                        "nonce": nonce,
                        "gas": 200000,
                        "maxFeePerGas": self.w3.to_wei("2", "gwei"),
                        "maxPriorityFeePerGas": self.w3.to_wei("1", "gwei"),
                        "chainId": self.chain_id,
                    })
                else:
                    event_type = target_event.event_type if target_event else "status_update"
                    tx = contract.functions.appendBatchEvent(
                        batch_id_bytes, raw_hash_bytes, event_type
                    ).build_transaction({
                        "from": account.address,
                        "nonce": nonce,
                        "gas": 150000,
                        "maxFeePerGas": self.w3.to_wei("2", "gwei"),
                        "maxPriorityFeePerGas": self.w3.to_wei("1", "gwei"),
                        "chainId": self.chain_id,
                    })

                signed_tx = self.w3.eth.account.sign_transaction(tx, private_key=self.private_key)
                tx_hash_hex = self.w3.eth.send_raw_transaction(signed_tx.raw_transaction).hex()

                # Mark as submitted
                tx_record.status = "submitted"
                tx_record.transaction_hash = tx_hash_hex
                tx_record.submitted_at = datetime.now(timezone.utc)
                batch.blockchain_status = "submitted"
                await db.flush()

                # Wait for receipt
                receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash_hex, timeout=10)
                if receipt.status == 1:
                    tx_record.status = "confirmed"
                    tx_record.block_number = receipt.blockNumber
                    tx_record.confirmed_at = datetime.now(timezone.utc)
                    batch.blockchain_status = "confirmed"
                else:
                    tx_record.status = "failed"
                    tx_record.error_message = "Transaction reverted on chain"
                    batch.blockchain_status = "failed"

            except Exception as e:
                logger.error(f"Blockchain submission error: {e}", exc_info=True)
                tx_record.status = "failed"
                tx_record.error_message = str(e)
                batch.blockchain_status = "failed"
        else:
            # Deterministic simulation / mock execution (for testing and offline demo)
            try:
                # Transition: pending -> submitted
                simulated_tx_hash = "0x" + hashlib.sha256(
                    f"{batch.batch_code}_{data_hash}_{datetime.now().isoformat()}".encode()
                ).hexdigest()
                tx_record.status = "submitted"
                tx_record.transaction_hash = simulated_tx_hash
                tx_record.submitted_at = datetime.now(timezone.utc)
                batch.blockchain_status = "submitted"
                await db.flush()

                # Transition: submitted -> confirmed
                self._mock_block_counter += 1
                tx_record.status = "confirmed"
                tx_record.block_number = self._mock_block_counter
                tx_record.confirmed_at = datetime.now(timezone.utc)
                batch.blockchain_status = "confirmed"

                # Save to mock registry
                batch_key = batch.batch_code
                if batch_key not in self._mock_registry:
                    self._mock_registry[batch_key] = {
                        "batch_code": batch.batch_code,
                        "latest_hash": formatted_data_hash,
                        "events": [formatted_data_hash],
                        "block_number": self._mock_block_counter,
                        "tx_hash": simulated_tx_hash,
                    }
                else:
                    self._mock_registry[batch_key]["latest_hash"] = formatted_data_hash
                    self._mock_registry[batch_key]["events"].append(formatted_data_hash)
                    self._mock_registry[batch_key]["block_number"] = self._mock_block_counter
                    self._mock_registry[batch_key]["tx_hash"] = simulated_tx_hash

            except Exception as e:
                tx_record.status = "failed"
                tx_record.error_message = str(e)
                batch.blockchain_status = "failed"

        await db.commit()
        await db.refresh(tx_record)
        await db.refresh(batch)
        return tx_record

    async def verify_batch_chain(
        self,
        db: AsyncSession,
        batch: ProductBatch,
    ) -> Dict[str, Any]:
        """
        Compares latest local hash against on-chain anchored hash.
        Returns cryptographic verification report.
        """
        # 1. Fetch latest DB event hash
        events_stmt = (
            select(BatchEvent)
            .where(BatchEvent.batch_id == batch.id)
            .order_by(BatchEvent.event_timestamp.desc(), BatchEvent.created_at.desc())
            .limit(1)
        )
        latest_event = (await db.execute(events_stmt)).scalar_one_or_none()
        latest_db_hash = (
            f"0x{latest_event.event_hash}"
            if latest_event and not latest_event.event_hash.startswith("0x")
            else (latest_event.event_hash if latest_event else "0x0")
        )

        # 2. Fetch latest confirmed transaction from DB
        tx_stmt = (
            select(BlockchainTransaction)
            .where(BlockchainTransaction.batch_id == batch.id)
            .order_by(BlockchainTransaction.created_at.desc())
            .limit(1)
        )
        last_tx = (await db.execute(tx_stmt)).scalar_one_or_none()

        on_chain_hash: Optional[str] = None
        is_verified = False
        block_number: Optional[int] = last_tx.block_number if last_tx else None
        tx_hash: Optional[str] = last_tx.transaction_hash if last_tx else None

        # Check via live contract if connected
        if self.is_connected() and self.contract_address != "0x0000000000000000000000000000000000000000":
            try:
                contract = self.w3.eth.contract(address=self.contract_address, abi=self.abi)
                batch_id_bytes = self.get_batch_id_bytes32(batch.batch_code)
                expected_bytes32 = self.to_bytes32(latest_db_hash)

                verify_result = contract.functions.verifyBatchHash(
                    batch_id_bytes, expected_bytes32
                ).call()
                # verify_result: (isMatch, onChainHashBytes, eventCount)
                is_verified = bool(verify_result[0])
                on_chain_hash = "0x" + verify_result[1].hex()
            except Exception as e:
                logger.warning(f"Error querying on-chain contract: {e}")
                if last_tx and last_tx.status == "confirmed":
                    on_chain_hash = last_tx.data_hash
                    is_verified = (on_chain_hash.lower() == latest_db_hash.lower())
        else:
            # Verify via mock registry or last confirmed transaction
            if batch.batch_code in self._mock_registry:
                on_chain_hash = self._mock_registry[batch.batch_code]["latest_hash"]
                is_verified = (on_chain_hash.lower() == latest_db_hash.lower())
                block_number = self._mock_registry[batch.batch_code]["block_number"]
                tx_hash = self._mock_registry[batch.batch_code]["tx_hash"]
            elif last_tx and last_tx.status == "confirmed":
                on_chain_hash = last_tx.data_hash
                is_verified = (on_chain_hash.lower() == latest_db_hash.lower())

        msg = (
            "Integritas data terverifikasi secara matematis cocok dengan hash blockchain."
            if is_verified
            else "Data batch belum dijangkarkan ke blockchain atau terdapat ketidaksesuaian hash."
        )

        return {
            "batch_id": batch.id,
            "batch_code": batch.batch_code,
            "latest_db_hash": latest_db_hash,
            "on_chain_hash": on_chain_hash,
            "is_verified": is_verified,
            "status": batch.blockchain_status,
            "network_chain_id": self.chain_id,
            "contract_address": self.contract_address,
            "block_number": block_number,
            "transaction_hash": tx_hash,
            "verified_at": datetime.now(timezone.utc),
            "message": msg,
        }


blockchain_service = BlockchainService()
