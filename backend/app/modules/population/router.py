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
from backend.app.modules.population.models import AdministrativeRequest, Resident, ResidentMutation
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
    ResidentMutationApproveRequest,
    ResidentMutationCreate,
    ResidentMutationListResponse,
    ResidentMutationRejectRequest,
    ResidentMutationResponse,
    ResidentReportDeathRequest,
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
    residence_status: Optional[str] = Query(None, alias="residence_status"),
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
    if residence_status:
        query = query.where(Resident.residence_status == residence_status)
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


@router.post("/residents/{id}/report-death", response_model=ResidentResponse)
async def report_resident_death(
    id: uuid.UUID,
    death_in: ResidentReportDeathRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(OFFICER_ROLES),
):
    stmt = select(Resident).where(Resident.id == id)
    resident = (await db.execute(stmt)).scalar_one_or_none()
    if not resident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data warga tidak ditemukan.",
        )

    user_role_names = {r.name for r in current_user.roles}
    is_admin = current_user.is_superuser or ROLE_ADMIN in user_role_names
    if not is_admin and current_user.village and resident.village.lower() != current_user.village.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Anda hanya berwenang mencatat peristiwa kematian untuk warga Desa {current_user.village}."
        )

    resident.residence_status = "deceased"
    resident.death_date = death_in.death_date
    resident.death_place = death_in.death_place
    resident.death_cause = death_in.death_cause
    resident.death_certificate_no = death_in.death_certificate_no
    resident.death_notes = death_in.death_notes
    resident.reported_death_at = datetime.now(timezone.utc)
    resident.reported_death_by = current_user.id

    # Nonaktifkan akun pengguna portal warga jika ada
    user_stmt = select(User).where(User.username == resident.nik)
    linked_user = (await db.execute(user_stmt)).scalar_one_or_none()
    if linked_user:
        linked_user.is_active = False

    await log_audit_event(
        db=db,
        action="REPORT_RESIDENT_DEATH",
        entity_name="residents",
        entity_id=resident.id,
        user_id=current_user.id,
        changes={
            "nik": resident.nik,
            "death_date": str(death_in.death_date),
            "death_place": death_in.death_place,
            "death_certificate_no": death_in.death_certificate_no,
            "account_deactivated": bool(linked_user),
        },
    )

    await db.commit()
    await db.refresh(resident)
    return resident


@router.post("/residents/{id}/revoke-death", response_model=ResidentResponse)
async def revoke_resident_death(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(OFFICER_ROLES),
):
    stmt = select(Resident).where(Resident.id == id)
    resident = (await db.execute(stmt)).scalar_one_or_none()
    if not resident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data warga tidak ditemukan.",
        )

    user_role_names = {r.name for r in current_user.roles}
    is_admin = current_user.is_superuser or ROLE_ADMIN in user_role_names
    if not is_admin and current_user.village and resident.village.lower() != current_user.village.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Anda hanya berwenang membatalkan status kematian warga Desa {current_user.village}."
        )

    resident.residence_status = "active"
    resident.death_date = None
    resident.death_place = None
    resident.death_cause = None
    resident.death_certificate_no = None
    resident.death_notes = None
    resident.reported_death_at = None
    resident.reported_death_by = None

    # Reaktifkan akun pengguna portal warga jika ada
    user_stmt = select(User).where(User.username == resident.nik)
    linked_user = (await db.execute(user_stmt)).scalar_one_or_none()
    if linked_user:
        linked_user.is_active = True

    await log_audit_event(
        db=db,
        action="REVOKE_RESIDENT_DEATH",
        entity_name="residents",
        entity_id=resident.id,
        user_id=current_user.id,
        changes={"nik": resident.nik, "reverted_to": "active"},
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
    user_role_names = {r.name for r in current_user.roles}
    is_officer_or_admin = bool(current_user.is_superuser or user_role_names.intersection({ROLE_ADMIN, ROLE_VILLAGE_OFFICER}))

    resident = None
    if request_in.resident_id:
        res_stmt = select(Resident).where(Resident.id == request_in.resident_id)
        resident = (await db.execute(res_stmt)).scalar_one_or_none()
        if not resident:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Data kependudukan tidak ditemukan",
            )
        # Proteksi BOLA/IDOR (SEC-003): Warga biasa hanya boleh membuat permohonan untuk dirinya sendiri
        if not is_officer_or_admin and resident.nik != current_user.username:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Anda hanya berwenang membuat permohonan surat administratif atas nama diri sendiri.",
            )
    else:
        # Cari profil warga berdasarkan NIK (username) atau nama lengkap pengguna aktif
        res_stmt = select(Resident).where(
            or_(
                Resident.nik == current_user.username,
                Resident.full_name == current_user.full_name,
            )
        )
        resident = (await db.execute(res_stmt)).scalar_one_or_none()

        if not resident:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Profil kependudukan tidak ditemukan untuk akun Anda. Silakan hubungi petugas desa.",
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


# ---------------------------------------------------------------------------
# RESIDENT MUTATION WORKFLOW (DUAL-VILLAGE VERIFICATION)
# ---------------------------------------------------------------------------

@router.post("/mutations", response_model=ResidentMutationResponse, status_code=status.HTTP_201_CREATED)
async def create_resident_mutation(
    mutation_in: ResidentMutationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(OFFICER_ROLES),
):
    """Inisiasi permohonan mutasi domisili warga antar desa (bisa diajukan desa asal atau desa tujuan)."""
    stmt = select(Resident).where(Resident.id == mutation_in.resident_id)
    resident = (await db.execute(stmt)).scalar_one_or_none()
    if not resident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data warga tidak ditemukan.",
        )

    if resident.residence_status == "deceased":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tidak dapat mengajukan mutasi untuk warga yang berstatus meninggal dunia.",
        )

    origin_village = resident.village.strip()
    dest_village = mutation_in.destination_village.strip()
    if origin_village.lower() == dest_village.lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Desa asal dan desa tujuan mutasi tidak boleh sama.",
        )

    # Cek apakah sedang ada proses mutasi yang aktif untuk warga ini
    active_mut_stmt = select(ResidentMutation).where(
        ResidentMutation.resident_id == resident.id,
        ResidentMutation.status.in_(["pending_destination", "pending_origin"]),
    )
    existing_active = (await db.execute(active_mut_stmt)).scalar_one_or_none()
    if existing_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Warga ini sudah memiliki permohonan mutasi yang sedang berjalan (Status: {existing_active.status}).",
        )

    user_role_names = {r.name for r in current_user.roles}
    is_admin = current_user.is_superuser or ROLE_ADMIN in user_role_names

    is_origin = bool(current_user.village and current_user.village.lower() == origin_village.lower())
    is_destination = bool(current_user.village and current_user.village.lower() == dest_village.lower())

    if not is_admin and not is_origin and not is_destination:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Anda hanya berwenang mengajukan mutasi dari atau ke Desa {current_user.village}."
        )

    now = datetime.now(timezone.utc)
    if is_admin or is_origin:
        # Inisiasi dari Desa Asal (Pindah Keluar): desa asal langsung approve, status menunggu verifikasi desa tujuan
        status_val = "pending_destination"
        origin_approved_by = current_user.id
        origin_approved_at = now
        dest_approved_by = None
        dest_approved_at = None
        initiated_by_village = origin_village
    else:
        # Inisiasi dari Desa Tujuan (Pindah Datang): diajukan desa tujuan, status menunggu persetujuan pelepasan desa asal
        status_val = "pending_origin"
        origin_approved_by = None
        origin_approved_at = None
        dest_approved_by = current_user.id
        dest_approved_at = now
        initiated_by_village = dest_village

    mutation = ResidentMutation(
        resident_id=resident.id,
        origin_village=origin_village,
        destination_village=dest_village,
        new_address=mutation_in.new_address,
        new_rt=mutation_in.new_rt,
        new_rw=mutation_in.new_rw,
        reason=mutation_in.reason,
        skpwni_number=mutation_in.skpwni_number,
        status=status_val,
        initiated_by_village=initiated_by_village,
        origin_approved_by=origin_approved_by,
        origin_approved_at=origin_approved_at,
        destination_approved_by=dest_approved_by,
        destination_approved_at=dest_approved_at,
    )
    db.add(mutation)
    resident.residence_status = "moving"
    await db.flush()

    await log_audit_event(
        db=db,
        action="INITIATE_RESIDENT_MUTATION",
        entity_name="resident_mutations",
        entity_id=mutation.id,
        user_id=current_user.id,
        changes={
            "resident_nik": resident.nik,
            "origin_village": origin_village,
            "destination_village": dest_village,
            "status": status_val,
        },
    )

    await db.commit()
    await db.refresh(mutation)

    resp = ResidentMutationResponse.model_validate(mutation)
    resp.resident_nik = resident.nik
    resp.resident_name = resident.full_name
    return resp


@router.get("/mutations", response_model=ResidentMutationListResponse)
async def list_resident_mutations(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    mutation_type: Optional[str] = Query(None, description="'incoming' (pindah datang) atau 'outgoing' (pindah keluar)"),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(OFFICER_ROLES),
):
    """Mendapatkan daftar mutasi kependudukan (masuk/keluar) dengan filter hak akses desa."""
    query = select(ResidentMutation, Resident.nik, Resident.full_name).join(
        Resident, ResidentMutation.resident_id == Resident.id
    )
    user_role_names = {r.name for r in current_user.roles}
    is_admin = current_user.is_superuser or ROLE_ADMIN in user_role_names

    if not is_admin and current_user.village:
        v_name = current_user.village.lower()
        if mutation_type == "incoming":
            query = query.where(func.lower(ResidentMutation.destination_village) == v_name)
        elif mutation_type == "outgoing":
            query = query.where(func.lower(ResidentMutation.origin_village) == v_name)
        else:
            query = query.where(
                or_(
                    func.lower(ResidentMutation.origin_village) == v_name,
                    func.lower(ResidentMutation.destination_village) == v_name,
                )
            )
    elif mutation_type:
        if mutation_type == "incoming" and current_user.village:
            query = query.where(func.lower(ResidentMutation.destination_village) == current_user.village.lower())
        elif mutation_type == "outgoing" and current_user.village:
            query = query.where(func.lower(ResidentMutation.origin_village) == current_user.village.lower())

    if status_filter:
        query = query.where(ResidentMutation.status == status_filter)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar_one()

    offset = (page - 1) * limit
    paginated_query = query.order_by(ResidentMutation.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(paginated_query)
    rows = result.all()

    items = []
    for mutation, r_nik, r_name in rows:
        m_dict = ResidentMutationResponse.model_validate(mutation)
        m_dict.resident_nik = r_nik
        m_dict.resident_name = r_name
        items.append(m_dict)

    return ResidentMutationListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
    )


@router.post("/mutations/{id}/approve", response_model=ResidentMutationResponse)
async def approve_resident_mutation(
    id: uuid.UUID,
    approve_in: ResidentMutationApproveRequest = ResidentMutationApproveRequest(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(OFFICER_ROLES),
):
    """Memverifikasi/menyetujui mutasi (oleh Desa Tujuan jika pending_destination, atau Desa Asal jika pending_origin)."""
    stmt = select(ResidentMutation, Resident).join(
        Resident, ResidentMutation.resident_id == Resident.id
    ).where(ResidentMutation.id == id)
    row = (await db.execute(stmt)).first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Data mutasi tidak ditemukan.")

    mutation, resident = row
    if mutation.status in ["completed", "rejected", "cancelled"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Permohonan mutasi sudah selesai atau ditutup (Status: {mutation.status}).",
        )

    user_role_names = {r.name for r in current_user.roles}
    is_admin = current_user.is_superuser or ROLE_ADMIN in user_role_names
    now = datetime.now(timezone.utc)

    if mutation.status == "pending_destination":
        # Menunggu verifikasi penerimaan dari Desa Tujuan
        if not is_admin and (not current_user.village or current_user.village.lower() != mutation.destination_village.lower()):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Hanya Kepala Desa / Perangkat Desa {mutation.destination_village} yang berwenang memverifikasi penerimaan warga.",
            )
        mutation.destination_approved_by = current_user.id
        mutation.destination_approved_at = now
        if approve_in.new_address:
            mutation.new_address = approve_in.new_address
        if approve_in.new_rt:
            mutation.new_rt = approve_in.new_rt
        if approve_in.new_rw:
            mutation.new_rw = approve_in.new_rw

    elif mutation.status == "pending_origin":
        # Menunggu persetujuan pelepasan dari Desa Asal
        if not is_admin and (not current_user.village or current_user.village.lower() != mutation.origin_village.lower()):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Hanya Kepala Desa / Perangkat Desa {mutation.origin_village} yang berwenang menyetujui pelepasan warga.",
            )
        mutation.origin_approved_by = current_user.id
        mutation.origin_approved_at = now

    # Kedua desa kini telah menyetujui mutasi, status menjadi completed!
    mutation.status = "completed"

    # Pindahkan domisili resident
    resident.village = mutation.destination_village
    if mutation.new_address:
        resident.address = mutation.new_address
    if mutation.new_rt:
        resident.rt = mutation.new_rt
    if mutation.new_rw:
        resident.rw = mutation.new_rw
    resident.residence_status = "active"

    # Perbarui scope village pada akun User (jika ada)
    user_stmt = select(User).where(User.username == resident.nik)
    linked_user = (await db.execute(user_stmt)).scalar_one_or_none()
    if linked_user:
        linked_user.village = mutation.destination_village

    await log_audit_event(
        db=db,
        action="COMPLETE_RESIDENT_MUTATION",
        entity_name="resident_mutations",
        entity_id=mutation.id,
        user_id=current_user.id,
        changes={
            "resident_nik": resident.nik,
            "origin_village": mutation.origin_village,
            "destination_village": mutation.destination_village,
            "status": "completed",
            "account_updated": bool(linked_user),
        },
    )

    await db.commit()
    await db.refresh(mutation)

    resp = ResidentMutationResponse.model_validate(mutation)
    resp.resident_nik = resident.nik
    resp.resident_name = resident.full_name
    return resp


@router.post("/mutations/{id}/reject", response_model=ResidentMutationResponse)
async def reject_resident_mutation(
    id: uuid.UUID,
    reject_in: ResidentMutationRejectRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(OFFICER_ROLES),
):
    """Menolak permohonan mutasi oleh salah satu desa terkait."""
    stmt = select(ResidentMutation, Resident).join(
        Resident, ResidentMutation.resident_id == Resident.id
    ).where(ResidentMutation.id == id)
    row = (await db.execute(stmt)).first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Data mutasi tidak ditemukan.")

    mutation, resident = row
    if mutation.status in ["completed", "rejected", "cancelled"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Permohonan mutasi sudah selesai atau ditutup (Status: {mutation.status}).",
        )

    user_role_names = {r.name for r in current_user.roles}
    is_admin = current_user.is_superuser or ROLE_ADMIN in user_role_names

    is_origin = bool(current_user.village and current_user.village.lower() == mutation.origin_village.lower())
    is_destination = bool(current_user.village and current_user.village.lower() == mutation.destination_village.lower())

    if not is_admin and not is_origin and not is_destination:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda tidak berwenang menolak mutasi ini karena bukan dari desa terkait.",
        )

    mutation.status = "rejected"
    mutation.rejection_reason = reject_in.reason
    mutation.rejected_by = current_user.id
    mutation.rejected_at = datetime.now(timezone.utc)

    # Kembalikan status residence resident menjadi active di desa asal
    resident.residence_status = "active"

    await log_audit_event(
        db=db,
        action="REJECT_RESIDENT_MUTATION",
        entity_name="resident_mutations",
        entity_id=mutation.id,
        user_id=current_user.id,
        changes={
            "resident_nik": resident.nik,
            "status": "rejected",
            "reason": reject_in.reason,
            "rejected_by_village": current_user.village or "Admin",
        },
    )

    await db.commit()
    await db.refresh(mutation)

    resp = ResidentMutationResponse.model_validate(mutation)
    resp.resident_nik = resident.nik
    resp.resident_name = resident.full_name
    return resp
