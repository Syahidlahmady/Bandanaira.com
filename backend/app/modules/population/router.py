from datetime import datetime, timezone
from typing import Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.permissions import (
    ROLE_ADMIN,
    ROLE_VILLAGE_OFFICER,
    get_current_active_user,
    require_roles,
)
from backend.app.database.session import get_db
from backend.app.modules.audit.service import log_audit_event
from backend.app.modules.auth.models import User
from backend.app.modules.population.models import AdministrativeRequest, Resident
from backend.app.modules.population.schemas import (
    AdministrativeRequestCreate,
    AdministrativeRequestDetailResponse,
    AdministrativeRequestListResponse,
    AdministrativeRequestResponse,
    AdministrativeRequestStatusUpdate,
    PopulationStatisticsResponse,
    ResidentCreate,
    ResidentListResponse,
    ResidentResponse,
    ResidentUpdate,
    ResidentVerificationUpdate,
)

router = APIRouter(prefix="/population", tags=["Population Management"])

OFFICER_ROLES = require_roles(ROLE_ADMIN, ROLE_VILLAGE_OFFICER)


@router.get("/residents", response_model=ResidentListResponse)
async def list_residents(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    rt: Optional[str] = None,
    rw: Optional[str] = None,
    occupation: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(OFFICER_ROLES),
):
    query = select(Resident)

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


@router.post("/residents", response_model=ResidentResponse, status_code=status.HTTP_201_CREATED)
async def create_resident(
    resident_in: ResidentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(OFFICER_ROLES),
):
    # Check duplicate NIK
    stmt = select(Resident).where(Resident.nik == resident_in.nik)
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A resident with this NIK already exists",
        )

    resident = Resident(**resident_in.model_dump())
    db.add(resident)
    await db.flush()

    # Log audit event
    await log_audit_event(
        db=db,
        action="CREATE_RESIDENT",
        entity_name="residents",
        entity_id=resident.id,
        user_id=current_user.id,
        changes=resident_in.model_dump(mode="json"),
    )

    await db.commit()
    await db.refresh(resident)
    return resident


@router.get("/residents/{id}", response_model=ResidentResponse)
async def get_resident(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(OFFICER_ROLES),
):
    stmt = select(Resident).where(Resident.id == id)
    resident = (await db.execute(stmt)).scalar_one_or_none()
    if not resident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resident record not found",
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

    update_data = update_in.model_dump(exclude_unset=True)
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
    _: User = Depends(OFFICER_ROLES),
):
    query = (
        select(AdministrativeRequest, Resident)
        .join(Resident, AdministrativeRequest.resident_id == Resident.id)
    )
    count_query = select(func.count(AdministrativeRequest.id))

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
    stmt = select(AdministrativeRequest).where(AdministrativeRequest.id == request_id)
    admin_req = (await db.execute(stmt)).scalar_one_or_none()
    if not admin_req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Administrative request not found",
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
    db: AsyncSession = Depends(get_db),
    _: User = Depends(OFFICER_ROLES),
):
    # Total residents
    total = (await db.execute(select(func.count(Resident.id)))).scalar_one()

    # Status counts
    verified = (
        await db.execute(select(func.count(Resident.id)).where(Resident.verification_status == "verified"))
    ).scalar_one()
    pending = (
        await db.execute(select(func.count(Resident.id)).where(Resident.verification_status == "pending"))
    ).scalar_one()
    rejected = (
        await db.execute(select(func.count(Resident.id)).where(Resident.verification_status == "rejected"))
    ).scalar_one()

    # Gender distribution
    gender_stmt = select(Resident.gender, func.count(Resident.id)).group_by(Resident.gender)
    gender_rows = (await db.execute(gender_stmt)).all()
    gender_dist = {str(row[0]): int(row[1]) for row in gender_rows if row[0] is not None}

    # Top occupations
    occ_stmt = (
        select(Resident.occupation, func.count(Resident.id))
        .where(Resident.occupation.isnot(None))
        .group_by(Resident.occupation)
        .order_by(func.count(Resident.id).desc())
        .limit(10)
    )
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
