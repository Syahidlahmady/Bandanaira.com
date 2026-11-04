from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.permissions import (
    ROLE_ADMIN,
    ROLE_FARMER_GROUP_ADMIN,
    ROLE_VILLAGE_OFFICER,
    require_roles,
)
from backend.app.database.session import get_db
from backend.app.modules.audit.service import log_audit_event
from backend.app.modules.auth.models import User
from backend.app.modules.farmers.models import Farmer, FarmerGroup
from backend.app.modules.farmers.schemas import (
    FarmerCreate,
    FarmerGroupCreate,
    FarmerGroupResponse,
    FarmerListResponse,
    FarmerResponse,
    FarmerUpdate,
)

router = APIRouter(prefix="/farmers", tags=["Farmers Management"])

FARMER_MANAGERS = require_roles(ROLE_ADMIN, ROLE_VILLAGE_OFFICER, ROLE_FARMER_GROUP_ADMIN)


# --- Farmer Groups ---
@router.get("/groups", response_model=List[FarmerGroupResponse])
async def list_farmer_groups(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(FARMER_MANAGERS),
):
    stmt = select(FarmerGroup).order_by(FarmerGroup.name)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/groups", response_model=FarmerGroupResponse, status_code=status.HTTP_201_CREATED)
async def create_farmer_group(
    group_in: FarmerGroupCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(FARMER_MANAGERS),
):
    check_stmt = select(FarmerGroup).where(FarmerGroup.name == group_in.name)
    existing = (await db.execute(check_stmt)).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A farmer group with this name already exists",
        )

    group = FarmerGroup(**group_in.model_dump())
    db.add(group)
    await db.flush()

    await log_audit_event(
        db=db,
        action="CREATE_FARMER_GROUP",
        entity_name="farmer_groups",
        entity_id=group.id,
        user_id=current_user.id,
        changes=group_in.model_dump(mode="json"),
    )

    await db.commit()
    await db.refresh(group)
    return group


# --- Farmers ---
@router.get("", response_model=FarmerListResponse)
async def list_farmers(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    group_id: Optional[uuid.UUID] = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(FARMER_MANAGERS),
):
    query = select(Farmer)
    if search:
        search_fmt = f"%{search}%"
        query = query.where(
            or_(Farmer.name.ilike(search_fmt), Farmer.farmer_code.ilike(search_fmt))
        )
    if group_id:
        query = query.where(Farmer.farmer_group_id == group_id)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar_one()

    offset = (page - 1) * limit
    paginated_query = query.order_by(Farmer.created_at.desc()).offset(offset).limit(limit)
    farmers = (await db.execute(paginated_query)).scalars().all()

    return FarmerListResponse(
        items=[FarmerResponse.model_validate(f) for f in farmers],
        total=total,
        page=page,
        limit=limit,
    )


@router.post("", response_model=FarmerResponse, status_code=status.HTTP_201_CREATED)
async def create_farmer(
    farmer_in: FarmerCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(FARMER_MANAGERS),
):
    check_stmt = select(Farmer).where(Farmer.farmer_code == farmer_in.farmer_code)
    existing = (await db.execute(check_stmt)).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A farmer with this code already exists",
        )

    farmer = Farmer(**farmer_in.model_dump())
    db.add(farmer)
    await db.flush()

    await log_audit_event(
        db=db,
        action="CREATE_FARMER",
        entity_name="farmers",
        entity_id=farmer.id,
        user_id=current_user.id,
        changes=farmer_in.model_dump(mode="json"),
    )

    await db.commit()
    await db.refresh(farmer)
    return farmer


@router.get("/{id}", response_model=FarmerResponse)
async def get_farmer(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(FARMER_MANAGERS),
):
    stmt = select(Farmer).where(Farmer.id == id)
    farmer = (await db.execute(stmt)).scalar_one_or_none()
    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer not found",
        )
    return farmer
