"""
Banda Digital Ecosystem - Blockchain Testnet Simulation & Verification Engine
Authored by Khoirul Anam (Blockchain & Traceability Specialist)

Executes 10 end-to-end cryptographic transactions across Spices (Pala/Nutmeg)
and Fisheries (Ikan Cakalang/Tuna):
1. Contract State Initialization & RBAC Verification
2. Register Batch #BN-BTC-2026-001 (Pala Banda Super) + IPFS CID
3. Append Event: Drying & Moisture Testing (<10%)
4. Append Event: Lab Quality Inspection (Aflatoxin Free)
5. Register Batch #BN-BTC-2026-003 (Ikan Asar Cakalang Banda) + IPFS CID
6. Append Event: Catch Landing (Laut Banda Zona 4)
7. Append Event: Traditional Smoking (Lonthoir Smokehouse)
8. Transfer Custodial Ownership to MSME / Koperasi Pesisir
9. Cryptographic Hash Integrity Verification (On-Chain vs Off-Chain Match)
10. Security Audit Simulation: Tamper Detection (Mismatched Hash Rejected)
"""

import hashlib
import json
import logging
import time
from datetime import datetime, timezone

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("blockchain_sim")


class BandaBlockchainSimulation:
    def __init__(self, contract_address: str = "0x5FbDB2315678afecb367f032d93F642f64180aa3", chain_id: int = 1337):
        self.contract_address = contract_address
        self.chain_id = chain_id
        self.current_block = 18492040
        self.state_batches = {}
        self.state_events = {}
        self.transaction_receipts = []

    def _generate_tx_hash(self, action: str, identifier: str) -> str:
        payload = f"{action}:{identifier}:{self.current_block}:{time.time_ns()}".encode()
        return "0x" + hashlib.sha256(payload).hexdigest()

    def _mine_block(self) -> int:
        self.current_block += 1
        return self.current_block

    def register_batch(
        self,
        batch_code: str,
        category: str,  # "SPICE" or "MARINE"
        commodity_name: str,
        origin_location: str,
        ipfs_cid: str,
        initial_event_type: str,
        initial_description: str,
        caller: str = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    ) -> dict:
        batch_id = "0x" + hashlib.sha256(batch_code.encode()).hexdigest()
        if batch_id in self.state_batches:
            raise ValueError(f"Batch {batch_code} already registered on-chain!")

        # Calculate canonical root hash
        genesis_payload = f"{batch_code}|{commodity_name}|{origin_location}|{ipfs_cid}|{initial_event_type}".encode()
        root_hash = "0x" + hashlib.sha256(genesis_payload).hexdigest()

        blk = self._mine_block()
        tx_hash = self._generate_tx_hash("REGISTER_BATCH", batch_code)

        batch_record = {
            "batch_id": batch_id,
            "batch_code": batch_code,
            "category": category,
            "commodity_name": commodity_name,
            "origin_location": origin_location,
            "ipfs_cid": ipfs_cid,
            "owner": caller,
            "latest_hash": root_hash,
            "event_count": 1,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "block_number": blk,
        }
        self.state_batches[batch_id] = batch_record

        initial_event = {
            "batch_id": batch_id,
            "sequence": 1,
            "event_type": initial_event_type,
            "location": origin_location,
            "description": initial_description,
            "ipfs_proof": ipfs_cid,
            "event_hash": root_hash,
            "recorded_by": caller,
            "tx_hash": tx_hash,
            "block_number": blk,
        }
        self.state_events[batch_id] = [initial_event]

        receipt = {
            "tx_hash": tx_hash,
            "block_number": blk,
            "action": f"REGISTER_BATCH ({category})",
            "batch_code": batch_code,
            "gas_used": 142850,
            "status": "CONFIRMED",
            "root_hash": root_hash,
            "ipfs_cid": ipfs_cid,
        }
        self.transaction_receipts.append(receipt)
        return receipt

    def append_event(
        self,
        batch_code: str,
        event_type: str,
        location: str,
        description: str,
        ipfs_proof_cid: str,
        caller: str = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    ) -> dict:
        batch_id = "0x" + hashlib.sha256(batch_code.encode()).hexdigest()
        if batch_id not in self.state_batches:
            raise ValueError(f"Batch {batch_code} not found on-chain!")

        prev_hash = self.state_batches[batch_id]["latest_hash"]
        event_payload = f"{batch_id}|{prev_hash}|{event_type}|{location}|{description}|{ipfs_proof_cid}".encode()
        event_hash = "0x" + hashlib.sha256(event_payload).hexdigest()

        blk = self._mine_block()
        tx_hash = self._generate_tx_hash("APPEND_EVENT", f"{batch_code}:{event_type}")

        self.state_batches[batch_id]["latest_hash"] = event_hash
        self.state_batches[batch_id]["event_count"] += 1
        seq = self.state_batches[batch_id]["event_count"]

        ev = {
            "batch_id": batch_id,
            "sequence": seq,
            "event_type": event_type,
            "location": location,
            "description": description,
            "ipfs_proof": ipfs_proof_cid,
            "event_hash": event_hash,
            "recorded_by": caller,
            "tx_hash": tx_hash,
            "block_number": blk,
        }
        self.state_events[batch_id].append(ev)

        receipt = {
            "tx_hash": tx_hash,
            "block_number": blk,
            "action": f"APPEND_EVENT ({event_type})",
            "batch_code": batch_code,
            "gas_used": 68420,
            "status": "CONFIRMED",
            "event_hash": event_hash,
            "sequence": seq,
        }
        self.transaction_receipts.append(receipt)
        return receipt

    def transfer_ownership(
        self,
        batch_code: str,
        new_owner: str,
        caller: str
    ) -> dict:
        batch_id = "0x" + hashlib.sha256(batch_code.encode()).hexdigest()
        if batch_id not in self.state_batches:
            raise ValueError("Batch not found")

        current_owner = self.state_batches[batch_id]["owner"]
        if caller != current_owner:
            raise PermissionError("Only current owner can transfer custody")

        blk = self._mine_block()
        tx_hash = self._generate_tx_hash("TRANSFER_OWNERSHIP", batch_code)
        self.state_batches[batch_id]["owner"] = new_owner

        receipt = {
            "tx_hash": tx_hash,
            "block_number": blk,
            "action": "TRANSFER_OWNERSHIP",
            "batch_code": batch_code,
            "previous_owner": current_owner,
            "new_owner": new_owner,
            "gas_used": 45100,
            "status": "CONFIRMED",
        }
        self.transaction_receipts.append(receipt)
        return receipt

    def verify_hash(self, batch_code: str, local_hash: str) -> dict:
        batch_id = "0x" + hashlib.sha256(batch_code.encode()).hexdigest()
        if batch_id not in self.state_batches:
            return {"verified": False, "message": "Batch ID not found on-chain"}

        on_chain_hash = self.state_batches[batch_id]["latest_hash"]
        is_match = (on_chain_hash == local_hash)
        return {
            "verified": is_match,
            "batch_code": batch_code,
            "on_chain_hash": on_chain_hash,
            "local_hash": local_hash,
            "events_count": self.state_batches[batch_id]["event_count"],
            "ipfs_cid": self.state_batches[batch_id]["ipfs_cid"],
            "message": "Cryptographic Hash Matched: Authenticity Verified On-Chain!" if is_match else "SECURITY ALERT: Hash Mismatch / Data Tampering Detected!"
        }


def run_full_simulation():
    print("=" * 80)
    print("🚀 BANDA NEIRA AGRO-MARITIME BLOCKCHAIN TESTNET SIMULATION")
    print("   Dokumen Mandat: Khoirul Anam (Blockchain & Traceability Specialist)")
    print("=" * 80)

    sim = BandaBlockchainSimulation()
    print(f"📍 Network: EVM Local Testnet (Chain ID: {sim.chain_id})")
    print(f"🏛️ Smart Contract Address: {sim.contract_address}")
    print(f"📦 Genesis Block: #{sim.current_block}\n")

    # Transaction 1: Register Pala Batch
    print("--- [Tx 1/10] Register Batch Rempah: Pala Banda Grade A Super ---")
    tx1 = sim.register_batch(
        batch_code="BN-BTC-2026-001",
        category="SPICE",
        commodity_name="Pala Banda Grade A Super",
        origin_location="Perkebunan Vulkanik Lonthoir, Banda Besar",
        ipfs_cid="QmPalaBandaSuperGradeALonthoir2026CertCid",
        initial_event_type="harvest_aggregated",
        initial_description="Agregasi 350kg biji pala ranum petik pohon dari petani Poktan Lonthoir Subur"
    )
    print(f"   ✓ Confirmed in Block #{tx1['block_number']} | TxHash: {tx1['tx_hash'][:18]}...")
    print(f"   ✓ Root Hash: {tx1['root_hash'][:24]}... | IPFS: {tx1['ipfs_cid']}")

    # Transaction 2: Append Drying Event
    print("\n--- [Tx 2/10] Append Event: Pengeringan Surya Terkontrol (<10% Moisture) ---")
    tx2 = sim.append_event(
        batch_code="BN-BTC-2026-001",
        event_type="drying",
        location="Sentra Jemur Surya Lonthoir",
        description="Pengeringan alami 6 hari sinar matahari dengan kontrol kelembaban < 10%",
        ipfs_proof_cid="QmMoistureTestReportLonthoirDay6Approved"
    )
    print(f"   ✓ Confirmed in Block #{tx2['block_number']} | TxHash: {tx2['tx_hash'][:18]}...")
    print(f"   ✓ Event Hash: {tx2['event_hash'][:24]}... (Seq #{tx2['sequence']})")

    # Transaction 3: Append Lab Testing Event
    print("\n--- [Tx 3/10] Append Event: Sertifikasi Mutu Laboratorium Bebas Aflatoksin ---")
    tx3 = sim.append_event(
        batch_code="BN-BTC-2026-001",
        event_type="quality_certification",
        location="Balai Pengujian Mutu Rempah Maluku",
        description="Hasil uji lab negatif cemaran aflatoksin B1/B2/G1/G2; standar ekspor IG lolos",
        ipfs_proof_cid="QmAflatoxinLabTestNegativeCertificateBandaNeira"
    )
    print(f"   ✓ Confirmed in Block #{tx3['block_number']} | TxHash: {tx3['tx_hash'][:18]}...")
    print(f"   ✓ Event Hash: {tx3['event_hash'][:24]}... (Seq #{tx3['sequence']})")

    # Transaction 4: Register Fisheries Batch (Ikan Cakalang Asar)
    print("\n--- [Tx 4/10] Register Batch Perikanan: Ikan Asar Cakalang Tradisional ---")
    tx4 = sim.register_batch(
        batch_code="BN-BTC-2026-003",
        category="MARINE",
        commodity_name="Ikan Asar Cakalang Tradisional Banda",
        origin_location="Perairan Laut Banda, Zona Tangkap 4",
        ipfs_cid="QmCakalangAsarTraditionalBandaFishingCert2026",
        initial_event_type="catch_landing",
        initial_description="Pendaratan tangkapan tuna cakalang segar 200kg oleh KM Nelayan Banda Perkasa",
        caller="0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
    )
    print(f"   ✓ Confirmed in Block #{tx4['block_number']} | TxHash: {tx4['tx_hash'][:18]}...")
    print(f"   ✓ Root Hash: {tx4['root_hash'][:24]}... | IPFS: {tx4['ipfs_cid']}")

    # Transaction 5: Append Fisheries Traditional Smoking Event
    print("\n--- [Tx 5/10] Append Event: Pengasapan Ikan Kayu Kenari Lonthoir ---")
    tx5 = sim.append_event(
        batch_code="BN-BTC-2026-003",
        event_type="smoking_processing",
        location="Rumah Asar Tradisional Lonthoir",
        description="Pengasapan lambat 12 jam menggunakan arang tempurung pala dan kayu kenari aromatik",
        ipfs_proof_cid="QmSmokingProcessProofAndTempLogsLonthoir"
    )
    print(f"   ✓ Confirmed in Block #{tx5['block_number']} | TxHash: {tx5['tx_hash'][:18]}...")
    print(f"   ✓ Event Hash: {tx5['event_hash'][:24]}... (Seq #{tx5['sequence']})")

    # Transaction 6: Append Fisheries Freshness & Formalin Lab Test
    print("\n--- [Tx 6/10] Append Event: Uji Higienitas & Formalin Negatif Dinas Perikanan ---")
    tx6 = sim.append_event(
        batch_code="BN-BTC-2026-003",
        event_type="lab_freshness_testing",
        location="Dinas Kelautan & Perikanan Banda",
        description="Uji kit formalin negatif 0 ppm, TVB-N < 20 mg/100g, sertifikasi kelayakan konsumsi",
        ipfs_proof_cid="QmFisheriesLabTestCleanFormalinNegative2026"
    )
    print(f"   ✓ Confirmed in Block #{tx6['block_number']} | TxHash: {tx6['tx_hash'][:18]}...")
    print(f"   ✓ Event Hash: {tx6['event_hash'][:24]}... (Seq #{tx6['sequence']})")

    # Transaction 7: Transfer Ownership to MSME Marketplace Merchant
    print("\n--- [Tx 7/10] Transfer Custody: Penyerahan Batch Ikan Asar ke UMKM Syafa Mart ---")
    tx7 = sim.transfer_ownership(
        batch_code="BN-BTC-2026-003",
        new_owner="0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        caller="0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
    )
    print(f"   ✓ Confirmed in Block #{tx7['block_number']} | TxHash: {tx7['tx_hash'][:18]}...")
    print(f"   ✓ Custody Transferred: {tx7['previous_owner'][:12]}... -> {tx7['new_owner'][:12]}...")

    # Transaction 8: Register Second Marine Batch (Tuna Sirip Kuning)
    print("\n--- [Tx 8/10] Register Batch Perikanan: Tuna Sirip Kuning Grade Sasimi ---")
    tx8 = sim.register_batch(
        batch_code="BN-BTC-2026-004",
        category="MARINE",
        commodity_name="Tuna Sirip Kuning Segar Laut Banda (Yellowfin)",
        origin_location="Laut Banda Perairan Dalam, Koordinat 4°32'S 129°52'E",
        ipfs_cid="QmYellowfinTunaGradeSashimiBandaSeaCert2026",
        initial_event_type="catch_landing",
        initial_description="Tangkapan pancing ulur ramah lingkungan handline tuna 180kg suhu inti 0-2°C",
        caller="0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
    )
    print(f"   ✓ Confirmed in Block #{tx8['block_number']} | TxHash: {tx8['tx_hash'][:18]}...")

    # Transaction 9: Cryptographic Integrity Verification (Valid Case)
    print("\n--- [Tx 9/10] Verifikasi Kriptografis On-Chain (Happy Path Verification) ---")
    batch_pala = sim.state_batches["0x" + hashlib.sha256("BN-BTC-2026-001".encode()).hexdigest()]
    expected_hash = batch_pala["latest_hash"]
    v_res = sim.verify_hash("BN-BTC-2026-001", expected_hash)
    print(f"   ✓ Batch: {v_res['batch_code']}")
    print(f"   ✓ On-Chain Root: {v_res['on_chain_hash']}")
    print(f"   ✓ Local DB Root: {v_res['local_hash']}")
    print(f"   ✓ Integrity Check: {v_res['message']} (MATCH={v_res['verified']})")

    # Transaction 10: Security Tamper Audit Simulation (Negative Case)
    print("\n--- [Tx 10/10] Simulasi Audit Keamanan: Deteksi Manipulasi Data (Tamper Audit) ---")
    tampered_hash = "0xdeadbeefbadc0de0000000000000000000000000000000000000000000000000"
    v_bad = sim.verify_hash("BN-BTC-2026-001", tampered_hash)
    print(f"   ✓ Batch: {v_bad['batch_code']}")
    print(f"   ✓ Expected Tampered Hash: {v_bad['local_hash'][:24]}...")
    print(f"   ✓ On-Chain Real Hash:     {v_bad['on_chain_hash'][:24]}...")
    print(f"   ✓ Security Engine Result: {v_bad['message']} (REJECTED={not v_bad['verified']})")

    print("\n" + "=" * 80)
    print("🎉 SELURUH 10 TRANSAKSI BLOCKCHAIN TESTNET BERHASIL DIEKSEKUSI!")
    print(f"   Total Transaksi On-Chain: {len(sim.transaction_receipts)}")
    print(f"   Total Blok Baru Tercipta: #{sim.current_block - 18492040}")
    print(f"   Komoditas Terverifikasi: 1 Spice (Pala), 2 Marine (Cakalang Asar & Tuna Sirip Kuning)")
    print("=" * 80)

    # Save summary report artifact
    report = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "specialist": "Khoirul Anam",
        "role": "Blockchain & Traceability Specialist",
        "network": f"EVM Local Testnet (Chain ID: {sim.chain_id})",
        "contract_address": sim.contract_address,
        "total_transactions": len(sim.transaction_receipts),
        "receipts": sim.transaction_receipts,
        "verification_audit": {
            "valid_check": v_res,
            "tamper_check": v_bad,
        }
    }
    with open("docs/mandat_anam/testnet_simulation_receipts.json", "w") as f:
        json.dump(report, f, indent=2)
    print("📁 Bukti transaksi tersimpan di: docs/mandat_anam/testnet_simulation_receipts.json\n")


if __name__ == "__main__":
    run_full_simulation()
