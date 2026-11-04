import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.permissions import require_roles
from backend.app.database.session import get_db
from backend.app.modules.audit.service import log_audit_event
from backend.app.modules.auth.models import User
from backend.app.modules.blockchain.models import BlockchainTransaction
from backend.app.modules.blockchain.schemas import (
    BlockchainAnchorRequest,
    BlockchainTransactionResponse,
    BlockchainVerificationResponse,
)
from backend.app.modules.blockchain.service import blockchain_service
from backend.app.modules.traceability.models import BatchEvent, ProductBatch

router = APIRouter(prefix="/blockchain", tags=["Blockchain Verification"])


@router.post(
    "/batches/{id}/anchor",
    response_model=BlockchainTransactionResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles(["admin", "village_officer", "farmer_group_admin"]))],
)
async def anchor_batch_to_blockchain(
    id: uuid.UUID,
    payload: Optional[BlockchainAnchorRequest] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "village_officer", "farmer_group_admin"])),
):
    """
    Anchors batch root hash or specific event hash to the EVM smart contract.
    State progresses: pending -> submitted -> confirmed (or failed).
    """
    batch = (
        await db.execute(select(ProductBatch).where(ProductBatch.id == id))
    ).scalar_one_or_none()
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")

    target_event = None
    if payload and payload.event_id:
        target_event = (
            await db.execute(select(BatchEvent).where(BatchEvent.id == payload.event_id, BatchEvent.batch_id == id))
        ).scalar_one_or_none()
        if not target_event:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specified event not found in this batch")

    tx_record = await blockchain_service.anchor_batch(db=db, batch=batch, event=target_event)

    await log_audit_event(
        db=db,
        action="ANCHOR_BLOCKCHAIN",
        entity_name="blockchain_transactions",
        entity_id=tx_record.id,
        user_id=current_user.id,
        changes={
            "batch_code": batch.batch_code,
            "data_hash": tx_record.data_hash,
            "status": tx_record.status,
            "tx_hash": tx_record.transaction_hash,
            "block_number": tx_record.block_number,
        },
    )

    return tx_record


@router.get(
    "/batches/{id}/transactions",
    response_model=List[BlockchainTransactionResponse],
    dependencies=[Depends(require_roles(["admin", "village_officer", "farmer_group_admin", "farmer"]))],
)
async def get_batch_blockchain_transactions(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(["admin", "village_officer", "farmer_group_admin", "farmer"])),
):
    """
    Lists all blockchain transactions associated with this batch.
    """
    batch = (
        await db.execute(select(ProductBatch).where(ProductBatch.id == id))
    ).scalar_one_or_none()
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")

    stmt = (
        select(BlockchainTransaction)
        .where(BlockchainTransaction.batch_id == id)
        .order_by(BlockchainTransaction.created_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get(
    "/batches/{id}/verify",
    response_model=BlockchainVerificationResponse,
)
async def verify_batch_blockchain_integrity(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """
    Cryptographically verifies whether the latest local batch hash matches the on-chain hash.
    Open for public or authenticated verification. Exposes ZERO PII.
    """
    batch = (
        await db.execute(select(ProductBatch).where(ProductBatch.id == id))
    ).scalar_one_or_none()
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")

    verification_data = await blockchain_service.verify_batch_chain(db=db, batch=batch)
    return BlockchainVerificationResponse(**verification_data)
