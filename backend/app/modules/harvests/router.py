from typing import Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.permissions import get_current_active_user
from backend.app.database.session import get_db
from backend.app.modules.audit.service import log_audit_event
from backend.app.modules.auth.models import User
from backend.app.modules.farmers.models import Farmer
from backend.app.modules.farms.models import Farm
from backend.app.modules.harvests.models import Harvest
from backend.app.modules.harvests.schemas import (
    HarvestCreate,
    HarvestListResponse,
    HarvestResponse,
)

router = APIRouter(prefix="/harvests", tags=["Harvest Management"])


@router.get("", response_model=HarvestListResponse)
async def list_harvests(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    commodity: Optional[str] = None,
    farmer_id: Optional[uuid.UUID] = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    query = select(Harvest)
    if commodity:
        query = query.where(Harvest.commodity.ilike(f"%{commodity}%"))
    if farmer_id:
        query = query.where(Harvest.farmer_id == farmer_id)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar_one()

    offset = (page - 1) * limit
    paginated_query = query.order_by(Harvest.harvest_date.desc()).offset(offset).limit(limit)
    harvests = (await db.execute(paginated_query)).scalars().all()

    return HarvestListResponse(
        items=[HarvestResponse.model_validate(h) for h in harvests],
        total=total,
        page=page,
        limit=limit,
    )


@router.post("", response_model=HarvestResponse, status_code=status.HTTP_201_CREATED)
async def create_harvest(
    harvest_in: HarvestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    # Verify farm exists
    farm = (await db.execute(select(Farm).where(Farm.id == harvest_in.farm_id))).scalar_one_or_none()
    if not farm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found")

    # Verify farmer exists
    farmer = (await db.execute(select(Farmer).where(Farmer.id == harvest_in.farmer_id))).scalar_one_or_none()
    if not farmer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farmer not found")

    # Check unique harvest_code
    existing = (
        await db.execute(select(Harvest).where(Harvest.harvest_code == harvest_in.harvest_code))
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A harvest with this code already exists",
        )

    harvest = Harvest(**harvest_in.model_dump())
    db.add(harvest)
    await db.flush()

    await log_audit_event(
        db=db,
        action="CREATE_HARVEST",
        entity_name="harvests",
        entity_id=harvest.id,
        user_id=current_user.id,
        changes=harvest_in.model_dump(mode="json"),
    )

    await db.commit()
    await db.refresh(harvest)
    return harvest


@router.get("/{id}", response_model=HarvestResponse)
async def get_harvest(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    harvest = (await db.execute(select(Harvest).where(Harvest.id == id))).scalar_one_or_none()
    if not harvest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Harvest not found")
    return harvest
