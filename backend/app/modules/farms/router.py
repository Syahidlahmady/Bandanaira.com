from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.permissions import (
    ROLE_ADMIN,
    ROLE_FARMER_GROUP_ADMIN,
    ROLE_VILLAGE_OFFICER,
    get_current_active_user,
    require_roles,
)
from backend.app.database.session import get_db
from backend.app.modules.audit.service import log_audit_event
from backend.app.modules.auth.models import User
from backend.app.modules.farmers.models import Farmer, FarmerGroup
from backend.app.modules.farms.models import Farm
from backend.app.modules.farms.schemas import (
    FarmCreate,
    FarmListResponse,
    FarmResponse,
    FarmStatisticsResponse,
    FarmUpdate,
    FarmVerificationUpdate,
    GeoJSONFeature,
    GeoJSONFeatureCollection,
    GeoJSONGeometry,
)

router = APIRouter(prefix="/farms", tags=["Farms & Geospatial Mapping"])

VILLAGE_OFFICERS = require_roles(ROLE_ADMIN, ROLE_VILLAGE_OFFICER)
FARM_MANAGERS = require_roles(ROLE_ADMIN, ROLE_VILLAGE_OFFICER, ROLE_FARMER_GROUP_ADMIN)


@router.get("", response_model=FarmListResponse)
async def list_farms(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    commodity: Optional[str] = None,
    farmer_id: Optional[uuid.UUID] = None,
    verification_status: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    query = select(Farm)
    if commodity:
        query = query.where(Farm.primary_commodity.ilike(f"%{commodity}%"))
    if farmer_id:
        query = query.where(Farm.farmer_id == farmer_id)
    if verification_status:
        query = query.where(Farm.verification_status == verification_status)
    if search:
        search_fmt = f"%{search}%"
        query = query.where(
            or_(Farm.name.ilike(search_fmt), Farm.farm_code.ilike(search_fmt))
        )

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar_one()

    offset = (page - 1) * limit
    paginated_query = query.order_by(Farm.created_at.desc()).offset(offset).limit(limit)
    farms = (await db.execute(paginated_query)).scalars().all()

    return FarmListResponse(
        items=[FarmResponse.model_validate(f) for f in farms],
        total=total,
        page=page,
        limit=limit,
    )


@router.post("", response_model=FarmResponse, status_code=status.HTTP_201_CREATED)
async def create_farm(
    farm_in: FarmCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(FARM_MANAGERS),
):
    # Verify farmer exists
    farmer_stmt = select(Farmer).where(Farmer.id == farm_in.farmer_id)
    farmer = (await db.execute(farmer_stmt)).scalar_one_or_none()
    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer not found",
        )

    # Check unique farm_code
    code_stmt = select(Farm).where(Farm.farm_code == farm_in.farm_code)
    existing_code = (await db.execute(code_stmt)).scalar_one_or_none()
    if existing_code:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A farm with this code already exists",
        )

    user_role_names = {r.name for r in current_user.roles}
    is_officer_or_admin = current_user.is_superuser or bool(
        user_role_names.intersection({ROLE_ADMIN, ROLE_VILLAGE_OFFICER})
    )
    # Lahan yang didaftarkan kelompok tani (farmer_group_admin) berstatus 'pending' menunggu persetujuan desa
    # Pendaftaran langsung oleh petugas desa/admin otomatis 'verified'
    init_status = "verified" if is_officer_or_admin else "pending"

    farm = Farm(**farm_in.model_dump(), verification_status=init_status)
    db.add(farm)
    await db.flush()

    await log_audit_event(
        db=db,
        action="CREATE_FARM",
        entity_name="farms",
        entity_id=farm.id,
        user_id=current_user.id,
        changes={**farm_in.model_dump(mode="json"), "verification_status": init_status},
    )

    await db.commit()
    await db.refresh(farm)
    return farm


@router.get("/geojson/all", response_model=GeoJSONFeatureCollection)
async def get_farms_geojson(
    commodity: Optional[str] = None,
    verification_status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    query = select(Farm)
    if commodity:
        query = query.where(Farm.primary_commodity.ilike(f"%{commodity}%"))
    if verification_status:
        query = query.where(Farm.verification_status == verification_status)

    result = await db.execute(query)
    farms = result.scalars().all()

    features: List[GeoJSONFeature] = []
    for f in farms:
        feature = GeoJSONFeature(
            type="Feature",
            id=str(f.id),
            geometry=GeoJSONGeometry(
                type="Point",
                coordinates=[f.longitude, f.latitude],
            ),
            properties={
                "farm_code": f.farm_code,
                "name": f.name,
                "commodity": f.primary_commodity,
                "area_sqm": f.area_sqm,
                "farmer_id": str(f.farmer_id),
                "location_description": f.location_description,
                "verification_status": f.verification_status,
            },
        )
        features.append(feature)

    return GeoJSONFeatureCollection(type="FeatureCollection", features=features)


@router.get("/statistics/summary", response_model=FarmStatisticsResponse)
async def get_farm_statistics(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    total_farmers = (await db.execute(select(func.count(Farmer.id)))).scalar_one()
    total_groups = (await db.execute(select(func.count(FarmerGroup.id)))).scalar_one()
    total_farms = (await db.execute(select(func.count(Farm.id)))).scalar_one()
    total_area = (await db.execute(select(func.coalesce(func.sum(Farm.area_sqm), 0.0)))).scalar_one()
    verified_farms = (await db.execute(select(func.count(Farm.id)).where(Farm.verification_status == "verified"))).scalar_one()
    pending_farms = (await db.execute(select(func.count(Farm.id)).where(Farm.verification_status == "pending"))).scalar_one()

    # Commodity distribution
    comm_stmt = select(Farm.primary_commodity, func.count(Farm.id)).group_by(Farm.primary_commodity)
    comm_rows = (await db.execute(comm_stmt)).all()
    commodity_dist = {str(row[0]): int(row[1]) for row in comm_rows}

    return FarmStatisticsResponse(
        total_farmers=total_farmers,
        total_farmer_groups=total_groups,
        total_farms=total_farms,
        total_area_sqm=float(total_area),
        commodity_distribution=commodity_dist,
        verified_farms=verified_farms,
        pending_farms=pending_farms,
    )


@router.patch("/{id}/verification", response_model=FarmResponse)
async def verify_farm(
    id: uuid.UUID,
    verification_in: FarmVerificationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(VILLAGE_OFFICERS),
):
    stmt = select(Farm).where(Farm.id == id)
    farm = (await db.execute(stmt)).scalar_one_or_none()
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found",
        )

    old_status = farm.verification_status
    farm.verification_status = verification_in.verification_status
    await db.flush()

    await log_audit_event(
        db=db,
        action="VERIFY_FARM",
        entity_name="farms",
        entity_id=farm.id,
        user_id=current_user.id,
        changes={
            "old_status": old_status,
            "new_status": verification_in.verification_status,
            "notes": verification_in.notes,
        },
    )

    await db.commit()
    await db.refresh(farm)
    return farm


@router.get("/{id}", response_model=FarmResponse)
async def get_farm(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    stmt = select(Farm).where(Farm.id == id)
    farm = (await db.execute(stmt)).scalar_one_or_none()
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farm not found",
        )
    return farm
