from datetime import datetime, timezone
from typing import Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.permissions import ROLE_ADMIN, ROLE_VILLAGE_OFFICER, require_roles
from backend.app.database.session import get_db
from backend.app.modules.audit.service import log_audit_event
from backend.app.modules.auth.models import User
from backend.app.modules.population.models import AdministrativeRequest, Resident
from backend.app.modules.population.schemas import (
    AdministrativeRequestCreate,
    AdministrativeRequestResponse,
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
    current_user: User = Depends(OFFICER_ROLES),
):
    # Verify resident exists
    res_stmt = select(Resident).where(Resident.id == request_in.resident_id)
    resident = (await db.execute(res_stmt)).scalar_one_or_none()
    if not resident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resident not found",
        )

    admin_req = AdministrativeRequest(**request_in.model_dump())
    db.add(admin_req)
    await db.flush()

    await log_audit_event(
        db=db,
        action="CREATE_ADMIN_REQUEST",
        entity_name="administrative_requests",
        entity_id=admin_req.id,
        user_id=current_user.id,
        changes=request_in.model_dump(mode="json"),
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
