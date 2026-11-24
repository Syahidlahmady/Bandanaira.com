from datetime import datetime, timezone
import random
from typing import Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.encoders import jsonable_encoder
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.permissions import (
    ROLE_ADMIN,
    ROLE_FARMER_GROUP_ADMIN,
    ROLE_RESIDENT,
    ROLE_VILLAGE_OFFICER,
    get_current_active_user,
    require_roles,
)
from backend.app.core.security import hash_password
from backend.app.database.session import get_db
from backend.app.modules.audit.service import log_audit_event
from backend.app.modules.auth.models import Role, User
from backend.app.modules.population.models import AdministrativeRequest, Resident
from backend.app.modules.population.schemas import (
    AdministrativeRequestCreate,
    AdministrativeRequestDetailResponse,
    AdministrativeRequestListResponse,
    AdministrativeRequestResponse,
    AdministrativeRequestStatusUpdate,
    PopulationStatisticsResponse,
    ResidentCreate,
    ResidentCredentialResponse,
    ResidentListResponse,
    ResidentResetPinRequest,
    ResidentResponse,
    ResidentUpdate,
    ResidentVerificationUpdate,
)

router = APIRouter(prefix="/population", tags=["Population Management"])

OFFICER_ROLES = require_roles(ROLE_ADMIN, ROLE_VILLAGE_OFFICER)
POPULATION_READ_ROLES = require_roles(ROLE_ADMIN, ROLE_VILLAGE_OFFICER, ROLE_FARMER_GROUP_ADMIN)


@router.get("/residents", response_model=ResidentListResponse)
async def list_residents(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    rt: Optional[str] = None,
    rw: Optional[str] = None,
    occupation: Optional[str] = None,
    village: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(POPULATION_READ_ROLES),
):
    query = select(Resident)
    user_role_names = {r.name for r in current_user.roles}
    is_admin = current_user.is_superuser or ROLE_ADMIN in user_role_names

    if not is_admin and current_user.village:
        query = query.where(Resident.village.ilike(f"%{current_user.village}%"))
    elif village:
        query = query.where(Resident.village.ilike(f"%{village}%"))

    if search:
        search_fmt = f"%{search}%"
        query = query.where(
            or_(
                Resident.full_name.ilike(search_fmt),
                Resident.nik.ilike(search_fmt),
                Resident.occupation.ilike(search_fmt),
            )
        )
    if status_filter:
        query = query.where(Resident.verification_status == status_filter)
    if occupation:
        query = query.where(Resident.occupation.ilike(f"%{occupation}%"))
    if rt:
        query = query.where(Resident.rt == rt)
    if rw:
        query = query.where(Resident.rw == rw)

    # Total count query
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar_one()

    # Pagination
    offset = (page - 1) * limit
    paginated_query = query.order_by(Resident.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(paginated_query)
    residents = result.scalars().all()

    return ResidentListResponse(
        items=[ResidentResponse.model_validate(r) for r in residents],
        total=total,
        page=page,
        limit=limit,
    )


@router.get("/residents/check-nik")
async def check_nik_availability(
    nik: str = Query(..., min_length=16, max_length=16, pattern=r"^\d{16}$"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(OFFICER_ROLES),
):
    """Memeriksa ketersediaan NIK di seluruh desa Kepulauan Banda (NIK harus unik nasional)."""
    stmt = select(Resident).where(Resident.nik == nik)
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        return {
            "available": False,
            "nik": nik,
            "village": existing.village,
            "full_name": existing.full_name,
            "message": f"NIK {nik} sudah terdaftar di Desa {existing.village}. NIK bersifat tunggal nasional dan tidak boleh sama di desa manapun.",
        }
    return {
        "available": True,
        "nik": nik,
        "message": "NIK valid dan belum terdaftar di desa manapun.",
    }


@router.post("/residents", response_model=ResidentResponse, status_code=status.HTTP_201_CREATED)
async def create_resident(
    resident_in: ResidentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(OFFICER_ROLES),
):
    user_role_names = {r.name for r in current_user.roles}
    is_admin = current_user.is_superuser or ROLE_ADMIN in user_role_names

    data = resident_in.model_dump()
    access_pin = data.pop("access_pin", None)
    raw_pin = access_pin.strip() if access_pin and access_pin.strip() else f"{random.randint(100000, 999999)}"

    if not is_admin and current_user.village:
        if resident_in.village and resident_in.village.lower() != current_user.village.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Anda hanya berwenang mendaftarkan warga untuk Desa {current_user.village}."
            )
        data["village"] = current_user.village

    # Check duplicate NIK across ALL villages (universal uniqueness enforcement)
    stmt = select(Resident).where(Resident.nik == resident_in.nik)
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"NIK {resident_in.nik} already exists (sudah terdaftar di Desa {existing.village}). NIK bersifat tunggal nasional dan tidak boleh sama di desa manapun.",
        )

    resident = Resident(**data)
    resident.sync_crypto_nik()
    db.add(resident)
    await db.flush()

    # Automatically provision User account for resident (username = NIK, role = resident)
    u_stmt = select(User).where(User.username == resident.nik)
    existing_u = (await db.execute(u_stmt)).scalar_one_or_none()
    if not existing_u:
        role_stmt = select(Role).where(Role.name == ROLE_RESIDENT)
        res_role = (await db.execute(role_stmt)).scalar_one_or_none()
        if not res_role:
            res_role = Role(name=ROLE_RESIDENT, description="Village resident accessing civil services and water quotas")
            db.add(res_role)
            await db.flush()

        new_user = User(
            email=f"{resident.nik}@warga.bandadigital.id",
            username=resident.nik,
            password_hash=hash_password(raw_pin),
            full_name=resident.full_name,
            is_active=True,
            is_superuser=False,
            village=resident.village,
            roles=[res_role],
        )
        db.add(new_user)

    # Log audit event
    await log_audit_event(
        db=db,
        action="CREATE_RESIDENT",
        entity_name="residents",
        entity_id=resident.id,
        user_id=current_user.id,
        changes={**jsonable_encoder(data), "account_created": True},
    )

    await db.commit()
    await db.refresh(resident)
    setattr(resident, "access_pin", raw_pin)
    setattr(resident, "account_username", resident.nik)
    return resident


@router.post("/residents/{id}/reset-pin", response_model=ResidentCredentialResponse)
async def reset_resident_pin(
    id: uuid.UUID,
    req: ResidentResetPinRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(OFFICER_ROLES),
):
    user_role_names = {r.name for r in current_user.roles}
    is_admin = current_user.is_superuser or ROLE_ADMIN in user_role_names

    stmt = select(Resident).where(Resident.id == id)
    resident = (await db.execute(stmt)).scalar_one_or_none()
    if not resident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data penduduk tidak ditemukan",
        )

    if not is_admin and current_user.village:
        if resident.village and resident.village.lower() != current_user.village.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Anda hanya berwenang mengatur akun warga Desa {current_user.village}."
            )

    new_pin = req.pin.strip() if req.pin and req.pin.strip() else f"{random.randint(100000, 999999)}"

    # Find or provision user by username == resident.nik
    u_stmt = select(User).where(User.username == resident.nik)
    user_obj = (await db.execute(u_stmt)).scalar_one_or_none()
    if not user_obj:
        role_stmt = select(Role).where(Role.name == ROLE_RESIDENT)
        res_role = (await db.execute(role_stmt)).scalar_one_or_none()
        if not res_role:
            res_role = Role(name=ROLE_RESIDENT, description="Village resident accessing civil services and water quotas")
            db.add(res_role)
            await db.flush()

        user_obj = User(
            email=f"{resident.nik}@warga.bandadigital.id",
            username=resident.nik,
            password_hash=hash_password(new_pin),
            full_name=resident.full_name,
            is_active=True,
            is_superuser=False,
            village=resident.village,
            roles=[res_role],
        )
        db.add(user_obj)
    else:
        user_obj.password_hash = hash_password(new_pin)
        db.add(user_obj)

    await log_audit_event(
        db=db,
        action="RESET_RESIDENT_PIN",
        entity_name="residents",
        entity_id=resident.id,
        user_id=current_user.id,
        changes={"nik": resident.nik, "reset_by": current_user.username},
    )

    await db.commit()
    return ResidentCredentialResponse(
        resident_id=resident.id,
        nik=resident.nik,
        full_name=resident.full_name,
        username=resident.nik,
        access_pin=new_pin,
        message="PIN akses akun warga berhasil diatur ulang."
    )


@router.get("/residents/{id}", response_model=ResidentResponse)
async def get_resident(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(POPULATION_READ_ROLES),
):
    stmt = select(Resident).where(Resident.id == id)
    resident = (await db.execute(stmt)).scalar_one_or_none()
    if not resident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resident record not found",
        )
    user_role_names = {r.name for r in current_user.roles}
    is_admin = current_user.is_superuser or ROLE_ADMIN in user_role_names
    if not is_admin and current_user.village and resident.village.lower() != current_user.village.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Anda hanya berwenang mengakses data warga Desa {current_user.village}."
        )
    return resident


@router.put("/residents/{id}", response_model=ResidentResponse)
async def update_resident(
    id: uuid.UUID,
    update_in: ResidentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(OFFICER_ROLES),
):
    stmt = select(Resident).where(Resident.id == id)
    resident = (await db.execute(stmt)).scalar_one_or_none()
    if not resident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resident record not found",
        )
    user_role_names = {r.name for r in current_user.roles}
    is_admin = current_user.is_superuser or ROLE_ADMIN in user_role_names
    if not is_admin and current_user.village and resident.village.lower() != current_user.village.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Anda hanya berwenang mengubah data warga Desa {current_user.village}."
        )

    update_data = update_in.model_dump(exclude_unset=True)
    if not is_admin and current_user.village and "village" in update_data:
        if update_data["village"] and update_data["village"].lower() != current_user.village.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Anda tidak dapat memindahkan domisili ke luar Desa {current_user.village}."
            )

    for field, value in update_data.items():
        setattr(resident, field, value)

    # Log audit event
    await log_audit_event(
        db=db,
        action="UPDATE_RESIDENT",
        entity_name="residents",
        entity_id=resident.id,
        user_id=current_user.id,
        changes=update_in.model_dump(mode="json", exclude_unset=True),
    )

    await db.commit()
    await db.refresh(resident)
    return resident


@router.post("/residents/{id}/verify", response_model=ResidentResponse)
async def verify_resident(
    id: uuid.UUID,
    verification: ResidentVerificationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(OFFICER_ROLES),
):
    stmt = select(Resident).where(Resident.id == id)
    resident = (await db.execute(stmt)).scalar_one_or_none()
    if not resident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resident record not found",
        )

    user_role_names = {r.name for r in current_user.roles}
    is_admin = current_user.is_superuser or ROLE_ADMIN in user_role_names
    if not is_admin and current_user.village and resident.village.lower() != current_user.village.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Anda hanya berwenang memverifikasi data warga Desa {current_user.village}."
        )

    previous_status = resident.verification_status
    resident.verification_status = verification.verification_status
    resident.verified_by = current_user.id
    resident.verified_at = datetime.now(timezone.utc)

    # Log audit event
    await log_audit_event(
        db=db,
        action="VERIFY_RESIDENT",
        entity_name="residents",
        entity_id=resident.id,
        user_id=current_user.id,
        changes={
            "previous_status": previous_status,
            "new_status": verification.verification_status,
            "notes": verification.notes,
        },
    )

    await db.commit()
    await db.refresh(resident)
    return resident
    if not resident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resident record not found",
        )

    previous_status = resident.verification_status
    resident.verification_status = verification.verification_status
    resident.verified_by = current_user.id
    resident.verified_at = datetime.now(timezone.utc)

    # Log audit event
    await log_audit_event(
        db=db,
        action="VERIFY_RESIDENT",
        entity_name="residents",
        entity_id=resident.id,
        user_id=current_user.id,
        changes={
            "previous_status": previous_status,
            "new_status": verification.verification_status,
            "notes": verification.notes,
        },
    )

    await db.commit()
    await db.refresh(resident)
    return resident


@router.post("/requests", response_model=AdministrativeRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_administrative_request(
    request_in: AdministrativeRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    resident = None
    if request_in.resident_id:
        res_stmt = select(Resident).where(Resident.id == request_in.resident_id)
        resident = (await db.execute(res_stmt)).scalar_one_or_none()
        if not resident:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resident not found",
            )
    else:
        # Match by full_name or fallback to first resident
        res_stmt = select(Resident).where(Resident.full_name == current_user.full_name)
        resident = (await db.execute(res_stmt)).scalar_one_or_none()
        if not resident:
            fallback_stmt = select(Resident).limit(1)
            resident = (await db.execute(fallback_stmt)).scalar_one_or_none()

        if not resident:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No resident profile available to associate with this request",
            )

    req_data = request_in.model_dump()
    req_data["resident_id"] = resident.id
    admin_req = AdministrativeRequest(**req_data)
    db.add(admin_req)
    await db.flush()

    audit_changes = {
        "resident_id": str(resident.id),
        "request_type": admin_req.request_type,
        "notes": admin_req.notes,
    }

    await log_audit_event(
        db=db,
        action="CREATE_ADMIN_REQUEST",
        entity_name="administrative_requests",
        entity_id=admin_req.id,
        user_id=current_user.id,
        changes=audit_changes,
    )

    await db.commit()
    await db.refresh(admin_req)
    return admin_req


@router.get("/requests", response_model=AdministrativeRequestListResponse)
async def list_administrative_requests(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    resident_id: Optional[uuid.UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(OFFICER_ROLES),
):
    query = (
        select(AdministrativeRequest, Resident)
        .join(Resident, AdministrativeRequest.resident_id == Resident.id)
    )
    count_query = select(func.count(AdministrativeRequest.id)).join(
        Resident, AdministrativeRequest.resident_id == Resident.id
    )

    user_role_names = {r.name for r in current_user.roles}
    is_admin = current_user.is_superuser or ROLE_ADMIN in user_role_names
    if not is_admin and current_user.village:
        query = query.where(Resident.village.ilike(f"%{current_user.village}%"))
        count_query = count_query.where(Resident.village.ilike(f"%{current_user.village}%"))

    if status_filter:
        query = query.where(AdministrativeRequest.status == status_filter)
        count_query = count_query.where(AdministrativeRequest.status == status_filter)
    if resident_id:
        query = query.where(AdministrativeRequest.resident_id == resident_id)
        count_query = count_query.where(AdministrativeRequest.resident_id == resident_id)

    total = (await db.execute(count_query)).scalar_one()

    offset = (page - 1) * limit
    query = query.order_by(AdministrativeRequest.created_at.desc()).offset(offset).limit(limit)
    rows = (await db.execute(query)).all()

    items = [
        AdministrativeRequestDetailResponse(
            id=req.id,
            resident_id=req.resident_id,
            resident_name=res.full_name,
            resident_nik=res.nik,
            resident_occupation=res.occupation,
            request_type=req.request_type,
            status=req.status,
            notes=req.notes,
            created_at=req.created_at,
            updated_at=req.updated_at,
        )
        for req, res in rows
    ]

    return AdministrativeRequestListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
    )


@router.patch("/requests/{request_id}/status", response_model=AdministrativeRequestResponse)
async def update_administrative_request_status(
    request_id: uuid.UUID,
    update_in: AdministrativeRequestStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(OFFICER_ROLES),
):
    stmt = (
        select(AdministrativeRequest, Resident)
        .join(Resident, AdministrativeRequest.resident_id == Resident.id)
        .where(AdministrativeRequest.id == request_id)
    )
    row = (await db.execute(stmt)).first()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Administrative request not found",
        )
    admin_req, resident = row

    user_role_names = {r.name for r in current_user.roles}
    is_admin = current_user.is_superuser or ROLE_ADMIN in user_role_names
    if not is_admin and current_user.village and resident.village.lower() != current_user.village.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Anda hanya berwenang memproses permohonan warga Desa {current_user.village}."
        )

    old_status = admin_req.status
    admin_req.status = update_in.status
    if update_in.notes is not None:
        admin_req.notes = update_in.notes

    await log_audit_event(
        db=db,
        action="UPDATE_ADMIN_REQUEST_STATUS",
        entity_name="administrative_requests",
        entity_id=admin_req.id,
        user_id=current_user.id,
        changes={
            "previous_status": old_status,
            "new_status": update_in.status,
            "notes": update_in.notes,
        },
    )

    await db.commit()
    await db.refresh(admin_req)
    return admin_req


@router.get("/statistics", response_model=PopulationStatisticsResponse)
async def get_population_statistics(
    village: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(POPULATION_READ_ROLES),
):
    user_role_names = {r.name for r in current_user.roles}
    is_admin = current_user.is_superuser or ROLE_ADMIN in user_role_names

    base_filter = []
    if not is_admin and current_user.village:
        base_filter.append(Resident.village.ilike(f"%{current_user.village}%"))
    elif village:
        base_filter.append(Resident.village.ilike(f"%{village}%"))

    # Total residents
    total_query = select(func.count(Resident.id))
    if base_filter:
        total_query = total_query.where(*base_filter)
    total = (await db.execute(total_query)).scalar_one()

    # Status counts
    verified_query = select(func.count(Resident.id)).where(Resident.verification_status == "verified")
    pending_query = select(func.count(Resident.id)).where(Resident.verification_status == "pending")
    rejected_query = select(func.count(Resident.id)).where(Resident.verification_status == "rejected")
    if base_filter:
        verified_query = verified_query.where(*base_filter)
        pending_query = pending_query.where(*base_filter)
        rejected_query = rejected_query.where(*base_filter)

    verified = (await db.execute(verified_query)).scalar_one()
    pending = (await db.execute(pending_query)).scalar_one()
    rejected = (await db.execute(rejected_query)).scalar_one()

    # Gender distribution
    gender_stmt = select(Resident.gender, func.count(Resident.id))
    if base_filter:
        gender_stmt = gender_stmt.where(*base_filter)
    gender_stmt = gender_stmt.group_by(Resident.gender)
    gender_rows = (await db.execute(gender_stmt)).all()
    gender_dist = {str(row[0]): int(row[1]) for row in gender_rows if row[0] is not None}

    # Top occupations
    occ_stmt = (
        select(Resident.occupation, func.count(Resident.id))
        .where(Resident.occupation.isnot(None))
    )
    if base_filter:
        occ_stmt = occ_stmt.where(*base_filter)
    occ_stmt = occ_stmt.group_by(Resident.occupation).order_by(func.count(Resident.id).desc()).limit(10)
    occ_rows = (await db.execute(occ_stmt)).all()
    top_occupations = {str(row[0]): int(row[1]) for row in occ_rows}

    return PopulationStatisticsResponse(
        total_residents=total,
        total_verified=verified,
        total_pending=pending,
        total_rejected=rejected,
        gender_distribution=gender_dist,
        top_occupations=top_occupations,
    )
