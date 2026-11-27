from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.encoders import jsonable_encoder
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.permissions import (
    ROLE_ADMIN,
    ROLE_FARMER,
    ROLE_FARMER_GROUP_ADMIN,
    ROLE_RESIDENT,
    ROLE_VILLAGE_OFFICER,
    get_current_active_user,
    require_roles,
)
from backend.app.database.session import get_db
from backend.app.modules.audit.service import log_audit_event
from backend.app.modules.auth.models import Role, User
from backend.app.modules.farmers.models import Farmer, FarmerGroup
from backend.app.modules.farmers.schemas import (
    CandidateResidentResponse,
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
    ("Poktan Pala Lonthoir Mandiri", "Hasan Baadilla", "Lonthoir", "081234560011"),
    ("Poktan Rempah Dwiwarna Sejahtera", "Ibrahim Latarisa", "Dwiwarna", "081234560012"),
]

_DEFAULT_FARMERS = [
    ("PTR-LNT-001", "Ali Wailissa", "081234560021", "Poktan Pala Lonthoir Mandiri"),
    ("PTR-DWR-001", "Ruslan Rumra", "081234560022", "Poktan Rempah Dwiwarna Sejahtera"),
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
            # Cari atau buat akun user warga untuk disinkronkan ke farmer
            u_stmt = select(User).where(User.username == res.nik)
            res_user = (await db.execute(u_stmt)).scalar_one_or_none()
            if res_user:
                f_role = (await db.execute(select(Role).where(Role.name == ROLE_FARMER))).scalar_one_or_none()
                if f_role and f_role not in res_user.roles:
                    res_user.roles.append(f_role)
                    db.add(res_user)

            db.add(
                Farmer(
                    farmer_code=code,
                    name=res.full_name,
                    phone=res.phone_number,
                    status="active",
                    resident_id=res.id,
                    user_id=res_user.id if res_user else None,
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


@router.get("/candidate-residents", response_model=List[CandidateResidentResponse])
async def list_candidate_residents(
    farmer_group_id: Optional[uuid.UUID] = None,
    village: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(FARMER_MANAGERS),
):
    await ensure_default_farmers_seeded(db)
    user_role_names = {r.name for r in current_user.roles}
    is_admin = current_user.is_superuser or ROLE_ADMIN in user_role_names

    target_village = None
    if not is_admin and current_user.village:
        target_village = current_user.village
    elif village:
        target_village = village
    elif farmer_group_id:
        grp = (await db.execute(select(FarmerGroup).where(FarmerGroup.id == farmer_group_id))).scalar_one_or_none()
        if grp:
            target_village = grp.village

    query = select(Resident).where(Resident.verification_status == "verified")

    if target_village:
        query = query.where(Resident.village.ilike(f"%{target_village}%"))

    if search:
        search_fmt = f"%{search}%"
        query = query.where(
            or_(
                Resident.full_name.ilike(search_fmt),
                Resident.nik.ilike(search_fmt),
                Resident.occupation.ilike(search_fmt),
            )
        )

    residents = (await db.execute(query.order_by(Resident.full_name.asc()))).scalars().all()

    existing_member_resident_ids = set()
    if farmer_group_id:
        existing_stmt = select(Farmer.resident_id).where(
            Farmer.farmer_group_id == farmer_group_id,
            Farmer.resident_id.is_not(None),
        )
        existing_member_resident_ids = set((await db.execute(existing_stmt)).scalars().all())

    items = []
    for r in residents:
        is_mem = r.id in existing_member_resident_ids
        items.append(
            CandidateResidentResponse(
                id=r.id,
                nik=r.nik,
                full_name=r.full_name,
                gender=r.gender,
                phone_number=r.phone_number,
                village=r.village,
                occupation=r.occupation,
                address=r.address,
                verification_status=r.verification_status,
                already_member=is_mem,
            )
        )

    items.sort(key=lambda x: (x.already_member, x.full_name.lower()))
    return items


@router.post("", response_model=FarmerResponse, status_code=status.HTTP_201_CREATED)
async def create_farmer(
    farmer_in: FarmerCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(FARMER_MANAGERS),
):
    user_role_names = {r.name for r in current_user.roles}
    is_admin = current_user.is_superuser or ROLE_ADMIN in user_role_names
    is_poktan = ROLE_FARMER_GROUP_ADMIN in user_role_names and not is_admin

    target_group = None
    if farmer_in.farmer_group_id:
        grp_stmt = select(FarmerGroup).where(FarmerGroup.id == farmer_in.farmer_group_id)
        target_group = (await db.execute(grp_stmt)).scalar_one_or_none()
        if not target_group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Kelompok tani yang dipilih tidak ditemukan.",
            )

    if not is_admin and current_user.village and target_group:
        if target_group.village.lower() != current_user.village.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Kelompok tani '{target_group.name}' berada di Desa {target_group.village}. Anda hanya berwenang mengelola petani di Desa {current_user.village}.",
            )

    # Poktan MUST register farmers from verified residents registered by Kepala Desa (or provide name in compat mode)
    if is_poktan and not farmer_in.resident_id and not farmer_in.name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ketua Kelompok Tani (Poktan) wajib memilih petani dari NIK warga yang sudah terdaftar dan terverifikasi oleh Desa.",
        )

    resident = None
    if farmer_in.resident_id:
        res_stmt = select(Resident).where(Resident.id == farmer_in.resident_id)
        resident = (await db.execute(res_stmt)).scalar_one_or_none()
        if not resident:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Data warga dengan ID tersebut tidak ditemukan.",
            )
        if resident.verification_status != "verified":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Warga '{resident.full_name}' berstatus '{resident.verification_status}'. Warga harus diverifikasi oleh Kepala Desa terlebih dahulu.",
            )
        if not is_admin and current_user.village and resident.village.lower() != current_user.village.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Warga '{resident.full_name}' terdaftar di Desa {resident.village}. Anda hanya berwenang menambahkan petani dari Desa {current_user.village}.",
            )
        if target_group and resident.village.lower() != target_group.village.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Desa domisili warga ({resident.village}) tidak sesuai dengan wilayah kelompok tani ({target_group.village}).",
            )
        if target_group:
            dup_member_stmt = select(Farmer).where(
                Farmer.resident_id == resident.id,
                Farmer.farmer_group_id == target_group.id,
            )
            dup_member = (await db.execute(dup_member_stmt)).scalar_one_or_none()
            if dup_member:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Warga '{resident.full_name}' (NIK: {resident.nik}) sudah terdaftar sebagai petani di '{target_group.name}'.",
                )

    farmer_name = farmer_in.name or (resident.full_name if resident else None)
    if not farmer_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nama petani tidak boleh kosong.",
        )

    farmer_phone = farmer_in.phone or (resident.phone_number if resident else None)

    farmer_code = farmer_in.farmer_code
    if not farmer_code:
        if resident:
            clean_nik = resident.nik[-4:]
            farmer_code = f"BN-PKT-{clean_nik}-{str(uuid.uuid4())[:4].upper()}"
        else:
            farmer_code = f"BN-FRM-{str(uuid.uuid4())[:8].upper()}"

    # Check duplicate farmer_code
    check_stmt = select(Farmer).where(Farmer.farmer_code == farmer_code)
    existing = (await db.execute(check_stmt)).scalar_one_or_none()
    if existing:
        if farmer_in.farmer_code:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A farmer with this code already exists",
            )
        farmer_code = f"{farmer_code}-{str(uuid.uuid4())[:3].upper()}"

    farmer_dict = farmer_in.model_dump()
    farmer_dict["farmer_code"] = farmer_code
    farmer_dict["name"] = farmer_name
    farmer_dict["phone"] = farmer_phone

    # Hubungkan akun User kependudukan warga & berikan peran ROLE_FARMER secara dinamis
    if resident:
        u_stmt = select(User).where(User.username == resident.nik)
        res_user = (await db.execute(u_stmt)).scalar_one_or_none()
        if not res_user:
            # Provision user akun warga jika belum ada
            r_stmt = select(Role).where(Role.name == ROLE_RESIDENT)
            res_role = (await db.execute(r_stmt)).scalar_one_or_none()
            if not res_role:
                res_role = Role(name=ROLE_RESIDENT, description="Warga Desa")
                db.add(res_role)
                await db.flush()

            from backend.app.core.security import hash_password
            res_user = User(
                email=f"{resident.nik}@warga.bandadigital.id",
                username=resident.nik,
                password_hash=hash_password("1234"),
                full_name=resident.full_name,
                is_active=True,
                is_superuser=False,
                village=resident.village,
                roles=[res_role],
            )
            db.add(res_user)
            await db.flush()

        # Sematkan peran ROLE_FARMER agar warga dapat login sebagai petani menggunakan NIK-nya
        f_role_stmt = select(Role).where(Role.name == ROLE_FARMER)
        farmer_role = (await db.execute(f_role_stmt)).scalar_one_or_none()
        if not farmer_role:
            farmer_role = Role(name=ROLE_FARMER, description="Petani Rempah & Komoditas Banda")
            db.add(farmer_role)
            await db.flush()

        if farmer_role not in res_user.roles:
            res_user.roles.append(farmer_role)
            db.add(res_user)

        farmer_dict["user_id"] = res_user.id
    elif farmer_dict.get("user_id"):
        # Jika user_id diberikan langsung, pastikan user memiliki peran farmer
        u_target = (await db.execute(select(User).where(User.id == farmer_dict["user_id"]))).scalar_one_or_none()
        if u_target:
            f_role_stmt = select(Role).where(Role.name == ROLE_FARMER)
            farmer_role = (await db.execute(f_role_stmt)).scalar_one_or_none()
            if not farmer_role:
                farmer_role = Role(name=ROLE_FARMER, description="Petani Rempah & Komoditas Banda")
                db.add(farmer_role)
                await db.flush()
            if farmer_role not in u_target.roles:
                u_target.roles.append(farmer_role)
                db.add(u_target)

    farmer = Farmer(**farmer_dict)
    db.add(farmer)
    await db.flush()

    await log_audit_event(
        db=db,
        action="CREATE_FARMER",
        entity_name="farmers",
        entity_id=farmer.id,
        user_id=current_user.id,
        changes=jsonable_encoder(farmer_dict),
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
