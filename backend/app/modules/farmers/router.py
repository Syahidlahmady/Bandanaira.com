from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
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
from backend.app.modules.farmers.schemas import (
    FarmerCreate,
    FarmerGroupCreate,
    FarmerGroupResponse,
    FarmerListResponse,
    FarmerResponse,
    FarmerUpdate,
)
from backend.app.modules.population.models import Resident

router = APIRouter(prefix="/farmers", tags=["Farmers Management"])

FARMER_MANAGERS = require_roles(ROLE_ADMIN, ROLE_VILLAGE_OFFICER, ROLE_FARMER_GROUP_ADMIN)

_DEFAULT_GROUPS = [
    ("Kelompok Tani Pala Lonthoir Subur", "Daud Walalayo", "Lonthoir", "081234000001"),
    ("Kelompok Tani Rempah Banda Neira Makmur", "Ibrahim Baadilla", "Banda Neira", "081234000002"),
    ("Kelompok Tani Selamon Bersatu", "Hasan Latarissa", "Selamon", "081234000003"),
]

_DEFAULT_FARMERS = [
    ("BN-PKT-001", "Usman Alkatiri", "081240111222", "Kelompok Tani Pala Lonthoir Subur"),
    ("BN-PKT-002", "Daud Walalayo", "081240111333", "Kelompok Tani Pala Lonthoir Subur"),
    ("BN-PKT-003", "Fatimah Patty", "081240111444", "Kelompok Tani Rempah Banda Neira Makmur"),
    ("BN-PKT-004", "Ali Renuat", "081240111555", "Kelompok Tani Selamon Bersatu"),
]


async def ensure_default_farmers_seeded(db: AsyncSession) -> None:
    """Pastikan kelompok tani & daftar petani awal tersedia serta tersinkron dengan data warga petani."""
    changed = False

    # 1. Seed kelompok tani bawaan jika belum ada
    existing_groups = {
        g.name: g for g in (await db.execute(select(FarmerGroup))).scalars().all()
    }
    if not existing_groups:
        for gname, leader, village, contact in _DEFAULT_GROUPS:
            if gname not in existing_groups:
                grp = FarmerGroup(
                    name=gname,
                    leader_name=leader,
                    village=village,
                    contact_number=contact,
                )
                db.add(grp)
                existing_groups[gname] = grp
                changed = True
        if changed:
            await db.flush()

    default_group = next(iter(existing_groups.values()), None)

    # 2. Seed petani bawaan jika tabel petani masih kosong
    total_farmers = (await db.execute(select(func.count(Farmer.id)))).scalar_one()
    if total_farmers == 0:
        for fcode, fname, phone, gname in _DEFAULT_FARMERS:
            target_group = existing_groups.get(gname) or default_group
            db.add(
                Farmer(
                    farmer_code=fcode,
                    name=fname,
                    phone=phone,
                    status="active",
                    farmer_group_id=target_group.id if target_group else None,
                )
            )
            changed = True

    # 3. Sinkronkan warga berprofesi Petani / Pekebun yang belum masuk tabel farmers
    farmer_residents = (
        await db.execute(
            select(Resident).where(
                or_(
                    Resident.occupation.ilike("%petani%"),
                    Resident.occupation.ilike("%pekebun%"),
                )
            )
        )
    ).scalars().all()

    if farmer_residents:
        existing_resident_ids = set(
            (await db.execute(select(Farmer.resident_id).where(Farmer.resident_id.is_not(None)))).scalars().all()
        )
        existing_codes = set((await db.execute(select(Farmer.farmer_code))).scalars().all())
        for res in farmer_residents:
            if res.id in existing_resident_ids:
                continue
            code = f"BN-WGA-{str(res.id).replace('-', '')[:6].upper()}"
            if code in existing_codes:
                continue
            village_lower = (res.village or "").lower()
            matched_group = default_group
            for grp in existing_groups.values():
                if grp.village.lower() in village_lower or village_lower in grp.village.lower():
                    matched_group = grp
                    break
            db.add(
                Farmer(
                    farmer_code=code,
                    name=res.full_name,
                    phone=res.phone_number,
                    status="active",
                    resident_id=res.id,
                    farmer_group_id=matched_group.id if matched_group else None,
                )
            )
            existing_codes.add(code)
            existing_resident_ids.add(res.id)
            changed = True

    if changed:
        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()


# --- Farmer Groups ---
@router.get("/groups", response_model=List[FarmerGroupResponse])
async def list_farmer_groups(
    village: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    await ensure_default_farmers_seeded(db)
    stmt = select(FarmerGroup)
    user_role_names = {r.name for r in current_user.roles}
    is_admin = current_user.is_superuser or ROLE_ADMIN in user_role_names

    if not is_admin and current_user.village:
        stmt = stmt.where(FarmerGroup.village.ilike(f"%{current_user.village}%"))
    elif village:
        stmt = stmt.where(FarmerGroup.village.ilike(f"%{village}%"))

    stmt = stmt.order_by(FarmerGroup.name)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/groups", response_model=FarmerGroupResponse, status_code=status.HTTP_201_CREATED)
async def create_farmer_group(
    group_in: FarmerGroupCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(FARMER_MANAGERS),
):
    user_role_names = {r.name for r in current_user.roles}
    is_admin = current_user.is_superuser or ROLE_ADMIN in user_role_names

    if not is_admin and current_user.village:
        if group_in.village.lower() != current_user.village.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Anda hanya berwenang membuat kelompok tani untuk Desa {current_user.village}."
            )

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
    village: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    await ensure_default_farmers_seeded(db)
    query = select(Farmer)
    user_role_names = {r.name for r in current_user.roles}
    is_admin = current_user.is_superuser or ROLE_ADMIN in user_role_names

    if not is_admin and current_user.village:
        query = query.join(FarmerGroup, Farmer.farmer_group_id == FarmerGroup.id, isouter=True).where(
            or_(FarmerGroup.village.ilike(f"%{current_user.village}%"), FarmerGroup.village.is_(None))
        )
    elif village:
        query = query.join(FarmerGroup, Farmer.farmer_group_id == FarmerGroup.id, isouter=True).where(
            FarmerGroup.village.ilike(f"%{village}%")
        )

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
    user_role_names = {r.name for r in current_user.roles}
    is_admin = current_user.is_superuser or ROLE_ADMIN in user_role_names

    if not is_admin and current_user.village and farmer_in.farmer_group_id:
        grp_stmt = select(FarmerGroup).where(FarmerGroup.id == farmer_in.farmer_group_id)
        grp = (await db.execute(grp_stmt)).scalar_one_or_none()
        if grp and grp.village.lower() != current_user.village.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Kelompok tani '{grp.name}' berada di Desa {grp.village}. Anda hanya berwenang mengelola petani di Desa {current_user.village}."
            )

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
