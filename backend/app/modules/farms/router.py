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
    FarmBoundaryValidationRequest,
    FarmBoundaryValidationResponse,
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
from backend.app.modules.farms.spatial import (
    calculate_polygon_area_sqm,
    check_farm_within_village_boundary,
    find_overlapping_farm,
    load_village_boundary_from_file,
    validate_polygon_geojson,
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
    village: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = select(Farm)
    user_role_names = {r.name for r in current_user.roles}
    is_admin = current_user.is_superuser or ROLE_ADMIN in user_role_names

    # Pembatasan yurisdiksi: jika bukan admin dan akun memiliki desa binaan
    if not is_admin and current_user.village:
        query = query.where(Farm.village == current_user.village)
    elif village:
        query = query.where(Farm.village.ilike(f"%{village}%"))

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
    user_role_names = {r.name for r in current_user.roles}
    is_officer_or_admin = current_user.is_superuser or bool(
        user_role_names.intersection({ROLE_ADMIN, ROLE_VILLAGE_OFFICER})
    )
    is_admin = current_user.is_superuser or ROLE_ADMIN in user_role_names

    # Verify farmer exists
    farmer_stmt = select(Farmer).where(Farmer.id == farm_in.farmer_id)
    farmer = (await db.execute(farmer_stmt)).scalar_one_or_none()
    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer not found",
        )

    # Tentukan yurisdiksi desa
    farmer_group_village = farmer.group.village if farmer.group else None
    target_village = (farm_in.village or farmer_group_village or current_user.village or "Lonthoir").strip()

    # Validasi yurisdiksi: jika bukan admin dan akun memiliki desa, wajib sama dengan desanya
    if not is_admin and current_user.village:
        if target_village.lower() != current_user.village.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Anda hanya berwenang mendaftarkan lahan di wilayah Desa {current_user.village}. Tidak dapat memetakan untuk desa '{target_village}'.",
            )
        target_village = current_user.village

    # Check unique farm_code
    code_stmt = select(Farm).where(Farm.farm_code == farm_in.farm_code)
    existing_code = (await db.execute(code_stmt)).scalar_one_or_none()
    if existing_code:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A farm with this code already exists",
        )

    # Validasi spasial poligon batas kebun jika disertakan
    if farm_in.polygon_boundary_geojson:
        try:
            coords = validate_polygon_geojson(farm_in.polygon_boundary_geojson)
        except ValueError as err:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Batas poligon tidak valid: {str(err)}",
            )

        calc_area = calculate_polygon_area_sqm(coords)
        if farm_in.area_sqm <= 0:
            farm_in.area_sqm = calc_area

        # 1. Deteksi tumpang tindih (overlap) batas lahan dengan kebun yang sudah terdaftar
        farms_stmt = select(Farm).where(Farm.polygon_boundary_geojson.is_not(None))
        existing_farms = (await db.execute(farms_stmt)).scalars().all()
        overlapping = find_overlapping_farm(farm_in.polygon_boundary_geojson, existing_farms)
        if overlapping:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Batas poligon lahan bertubrukan (overlap) dengan kebun '{overlapping.name}' ({overlapping.farm_code}). Harap sesuaikan titik batas koordinat.",
            )

        # 2. Validasi batas wilayah administratif desa
        v_geom = load_village_boundary_from_file(target_village)
        if v_geom:
            is_in, v_err = check_farm_within_village_boundary(
                farm_in.polygon_boundary_geojson, v_geom, target_village
            )
            if not is_in:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=v_err or f"Batas poligon lahan berada di luar wilayah administratif Desa {target_village}.",
                )

    # Lahan yang didaftarkan kelompok tani (farmer_group_admin) berstatus 'pending' menunggu persetujuan desa
    # Pendaftaran langsung oleh petugas desa/admin otomatis 'verified'
    init_status = "verified" if is_officer_or_admin else "pending"

    farm_data = farm_in.model_dump()
    farm_data["village"] = target_village
    farm = Farm(**farm_data, verification_status=init_status)
    db.add(farm)
    await db.flush()

    await log_audit_event(
        db=db,
        action="CREATE_FARM",
        entity_name="farms",
        entity_id=farm.id,
        user_id=current_user.id,
        changes={**farm_in.model_dump(mode="json"), "village": target_village, "verification_status": init_status},
    )

    await db.commit()
    await db.refresh(farm)
    return farm


@router.post("/validate-boundary", response_model=FarmBoundaryValidationResponse)
async def validate_boundary(
    req: FarmBoundaryValidationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Endpoint uji validasi batas poligon kebun, batas wilayah desa, dan deteksi tumpang tindih secara real-time.
    """
    try:
        coords = validate_polygon_geojson(req.polygon_boundary_geojson)
    except ValueError as err:
        return FarmBoundaryValidationResponse(
            is_valid=False,
            has_overlap=False,
            is_within_village=False,
            village=req.village,
            message=f"Format poligon tidak valid: {str(err)}",
        )

    calc_area = calculate_polygon_area_sqm(coords)
    farms_stmt = select(Farm).where(Farm.polygon_boundary_geojson.is_not(None))
    existing_farms = (await db.execute(farms_stmt)).scalars().all()
    overlapping = find_overlapping_farm(
        req.polygon_boundary_geojson, existing_farms, exclude_farm_id=req.exclude_farm_id
    )

    if overlapping:
        return FarmBoundaryValidationResponse(
            is_valid=True,
            has_overlap=True,
            is_within_village=True,
            village=req.village,
            overlapping_farm_id=str(overlapping.id),
            overlapping_farm_code=overlapping.farm_code,
            overlapping_farm_name=overlapping.name,
            calculated_area_sqm=calc_area,
            message=f"Batas poligon bertubrukan (overlap) dengan plot kebun '{overlapping.name}' ({overlapping.farm_code}).",
        )

    # Validasi batas wilayah administratif desa jika desa ditentukan
    target_village = (req.village or current_user.village or "").strip()
    if target_village:
        v_geom = load_village_boundary_from_file(target_village)
        if v_geom:
            is_in, v_err = check_farm_within_village_boundary(
                req.polygon_boundary_geojson, v_geom, target_village
            )
            if not is_in:
                return FarmBoundaryValidationResponse(
                    is_valid=False,
                    has_overlap=False,
                    is_within_village=False,
                    village=target_village,
                    calculated_area_sqm=calc_area,
                    message=v_err or f"Batas poligon berada di luar wilayah administratif Desa {target_village}.",
                )

    return FarmBoundaryValidationResponse(
        is_valid=True,
        has_overlap=False,
        is_within_village=True if target_village else None,
        village=target_village if target_village else None,
        calculated_area_sqm=calc_area,
        message=f"Batas poligon sah{f' di dalam wilayah Desa {target_village}' if target_village else ''} dan bebas tumpang tindih.",
    )


@router.get("/geojson/all", response_model=GeoJSONFeatureCollection)
async def get_farms_geojson(
    commodity: Optional[str] = None,
    verification_status: Optional[str] = None,
    village: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = select(Farm)
    user_role_names = {r.name for r in current_user.roles}
    is_admin = current_user.is_superuser or ROLE_ADMIN in user_role_names

    if not is_admin and current_user.village:
        query = query.where(Farm.village == current_user.village)
    elif village:
        query = query.where(Farm.village.ilike(f"%{village}%"))

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
                "village": f.village,
                "area_sqm": f.area_sqm,
                "farmer_id": str(f.farmer_id),
                "location_description": f.location_description,
                "verification_status": f.verification_status,
                "polygon_boundary_geojson": f.polygon_boundary_geojson,
            },
        )
        features.append(feature)

    return GeoJSONFeatureCollection(type="FeatureCollection", features=features)



@router.get("/statistics/summary", response_model=FarmStatisticsResponse)
async def get_farm_statistics(
    village: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    user_role_names = {r.name for r in current_user.roles}
    is_admin = current_user.is_superuser or ROLE_ADMIN in user_role_names

    f_query = select(Farm)
    if not is_admin and current_user.village:
        f_query = f_query.where(Farm.village == current_user.village)
    elif village:
        f_query = f_query.where(Farm.village.ilike(f"%{village}%"))

    total_farms = (await db.execute(select(func.count()).select_from(f_query.subquery()))).scalar_one()
    total_area = (await db.execute(select(func.coalesce(func.sum(Farm.area_sqm), 0.0)).select_from(f_query.subquery()))).scalar_one()
    
    verified_stmt = select(func.count()).select_from(f_query.where(Farm.verification_status == "verified").subquery())
    verified_farms = (await db.execute(verified_stmt)).scalar_one()

    pending_stmt = select(func.count()).select_from(f_query.where(Farm.verification_status == "pending").subquery())
    pending_farms = (await db.execute(pending_stmt)).scalar_one()

    # Petani & Poktan scoping
    grp_query = select(FarmerGroup)
    if not is_admin and current_user.village:
        grp_query = grp_query.where(FarmerGroup.village.ilike(f"%{current_user.village}%"))
    elif village:
        grp_query = grp_query.where(FarmerGroup.village.ilike(f"%{village}%"))
    total_groups = (await db.execute(select(func.count()).select_from(grp_query.subquery()))).scalar_one()

    farmer_query = select(Farmer)
    if not is_admin and current_user.village:
        farmer_query = farmer_query.join(FarmerGroup, Farmer.farmer_group_id == FarmerGroup.id, isouter=True).where(
            or_(FarmerGroup.village.ilike(f"%{current_user.village}%"), FarmerGroup.village.is_(None))
        )
    total_farmers = (await db.execute(select(func.count()).select_from(farmer_query.subquery()))).scalar_one()

    # Commodity distribution
    comm_stmt = select(Farm.primary_commodity, func.count(Farm.id)).select_from(f_query.subquery()).group_by(Farm.primary_commodity)
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

    user_role_names = {r.name for r in current_user.roles}
    is_admin = current_user.is_superuser or ROLE_ADMIN in user_role_names

    # Validasi wewenang desa petugas
    if not is_admin and current_user.village:
        if farm.village.lower() != current_user.village.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Petugas Desa {current_user.village} tidak berwenang memverifikasi lahan di Desa {farm.village}."
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
