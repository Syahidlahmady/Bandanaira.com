from datetime import datetime, timezone
import secrets
from typing import Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.permissions import get_current_active_user
from backend.app.database.session import get_db
from backend.app.modules.audit.service import log_audit_event
from backend.app.modules.auth.models import User
from backend.app.modules.harvests.models import Harvest
from backend.app.modules.qr.service import generate_qr_base64
from backend.app.modules.traceability.hashing import calculate_event_hash
from backend.app.modules.traceability.models import BatchEvent, BatchHarvest, ProductBatch
from backend.app.modules.traceability.schemas import (
    BatchEventCreate,
    BatchEventResponse,
    ProductBatchCreate,
    ProductBatchListResponse,
    ProductBatchResponse,
)

router = APIRouter(prefix="/batches", tags=["Product Batches & Traceability"])


@router.get("", response_model=ProductBatchListResponse)
async def list_batches(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    commodity: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    query = select(ProductBatch)
    if commodity:
        query = query.where(ProductBatch.commodity.ilike(f"%{commodity}%"))

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar_one()

    offset = (page - 1) * limit
    paginated_query = query.order_by(ProductBatch.created_at.desc()).offset(offset).limit(limit)
    batches = (await db.execute(paginated_query)).scalars().all()

    items = []
    for b in batches:
        b_res = ProductBatchResponse.model_validate(b)
        b_res.qr_code_base64 = generate_qr_base64(b.public_verification_token)
        items.append(b_res)

    return ProductBatchListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
    )


@router.post("", response_model=ProductBatchResponse, status_code=status.HTTP_201_CREATED)
async def create_batch(
    batch_in: ProductBatchCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    # Check duplicate batch_code
    existing = (
        await db.execute(select(ProductBatch).where(ProductBatch.batch_code == batch_in.batch_code))
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A batch with this code already exists",
        )

    # Calculate total quantity and verify harvests
    total_qty = 0.0
    for h_in in batch_in.harvests:
        harvest = (
            await db.execute(select(Harvest).where(Harvest.id == h_in.harvest_id))
        ).scalar_one_or_none()
        if not harvest:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Harvest record {h_in.harvest_id} not found",
            )
        total_qty += h_in.allocated_quantity_kg

    # Generate secure random token for QR code
    token = secrets.token_urlsafe(32)

    batch = ProductBatch(
        batch_code=batch_in.batch_code,
        commodity=batch_in.commodity,
        total_quantity_kg=total_qty,
        production_date=batch_in.production_date,
        public_verification_token=token,
        status="created",
        blockchain_status="pending",
    )
    db.add(batch)
    await db.flush()

    # Link harvests
    for h_in in batch_in.harvests:
        bh = BatchHarvest(
            batch_id=batch.id,
            harvest_id=h_in.harvest_id,
            allocated_quantity_kg=h_in.allocated_quantity_kg,
        )
        db.add(bh)

    # Create initial genesis event: harvest_aggregated
    now = datetime.now(timezone.utc)
    initial_hash = calculate_event_hash(
        batch_id=batch.id,
        event_type="harvest_aggregated",
        event_timestamp=now,
        metadata={"harvest_count": len(batch_in.harvests), "total_quantity_kg": total_qty},
        previous_event_hash=None,
    )

    genesis_event = BatchEvent(
        batch_id=batch.id,
        event_type="harvest_aggregated",
        event_timestamp=now,
        recorded_by_user_id=current_user.id,
        location="Banda Neira",
        description=f"Batch dibuat dari {len(batch_in.harvests)} catatan panen petani",
        metadata_json={"total_quantity_kg": total_qty},
        event_hash=initial_hash,
        previous_event_hash=None,
        created_at=now,
    )
    db.add(genesis_event)

    await log_audit_event(
        db=db,
        action="CREATE_BATCH",
        entity_name="product_batches",
        entity_id=batch.id,
        user_id=current_user.id,
        changes=batch_in.model_dump(mode="json"),
    )

    await db.commit()
    await db.refresh(batch)

    res = ProductBatchResponse.model_validate(batch)
    res.qr_code_base64 = generate_qr_base64(batch.public_verification_token)
    return res


@router.get("/{id}", response_model=ProductBatchResponse)
async def get_batch(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    batch = (
        await db.execute(select(ProductBatch).where(ProductBatch.id == id))
    ).scalar_one_or_none()
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")

    res = ProductBatchResponse.model_validate(batch)
    res.qr_code_base64 = generate_qr_base64(batch.public_verification_token)
    return res


@router.post("/{id}/events", response_model=BatchEventResponse, status_code=status.HTTP_201_CREATED)
async def append_batch_event(
    id: uuid.UUID,
    event_in: BatchEventCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    batch = (
        await db.execute(select(ProductBatch).where(ProductBatch.id == id))
    ).scalar_one_or_none()
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")

    # Get last event to link hash chain
    last_event_stmt = (
        select(BatchEvent)
        .where(BatchEvent.batch_id == id)
        .order_by(BatchEvent.event_timestamp.desc(), BatchEvent.created_at.desc())
        .limit(1)
    )
    last_event = (await db.execute(last_event_stmt)).scalar_one_or_none()
    prev_hash = last_event.event_hash if last_event else None

    now = datetime.now(timezone.utc)
    new_event_hash = calculate_event_hash(
        batch_id=batch.id,
        event_type=event_in.event_type,
        event_timestamp=now,
        metadata=event_in.metadata_json,
        previous_event_hash=prev_hash,
    )

    new_event = BatchEvent(
        batch_id=batch.id,
        event_type=event_in.event_type,
        event_timestamp=now,
        recorded_by_user_id=current_user.id,
        location=event_in.location or "Banda Neira",
        description=event_in.description,
        metadata_json=event_in.metadata_json,
        event_hash=new_event_hash,
        previous_event_hash=prev_hash,
        created_at=now,
    )
    db.add(new_event)
    await db.flush()

    # Update batch status accordingly
    if event_in.event_type in ["fermentation", "drying", "sorting"]:
        batch.status = "processing"
    elif event_in.event_type == "packaging":
        batch.status = "packaged"
    elif event_in.event_type == "transfer":
        batch.status = "distributed"

    await log_audit_event(
        db=db,
        action="APPEND_BATCH_EVENT",
        entity_name="batch_events",
        entity_id=new_event.id,
        user_id=current_user.id,
        changes=event_in.model_dump(mode="json"),
    )

    await db.commit()
    await db.refresh(new_event)
    return new_event
