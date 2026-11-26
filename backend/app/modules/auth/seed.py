import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.security import hash_password
from backend.app.modules.auth.models import Role, User
from backend.app.modules.population.models import Resident
from backend.app.modules.farmers.models import Farmer, FarmerGroup
from backend.app.modules.farms.models import Farm

logger = logging.getLogger(__name__)

INITIAL_ROLES = [
    ("admin", "System Administrator with full access"),
    ("village_officer", "Village officer managing population and administrative services"),
    ("farmer_group_admin", "Farmer group administrator managing members and collective batches"),
    ("farmer", "Spice farmer logging harvests and viewing farm records"),
    ("smart_tourism_admin", "Tourism administrator managing public catalog, heritage audio guides and routes"),
    ("resident", "Village resident accessing civil services and water quotas"),
    ("coop_manager", "Cooperative manager handling commodity cash register, plastic waste bank, and RO water"),
    ("homestay_operator", "Homestay and eco-stay operator managing accommodations and WhatsApp bookings"),
    ("field_surveyor", "Field surveyor and IoT operator collecting dynamic surveys and monitoring telemetry"),
]

# 1 Administrator Pusat (Hidden dari daftar demo publik, login khusus)
ADMIN_USER = {
    "username": "admin",
    "email": "admin@bandadigital.id",
    "password": "Admin123!",
    "full_name": "Administrator Pusat Banda Neira",
    "role": "admin",
    "is_superuser": True,
}

# 2 Kepala Desa (berbasis NIK 16 digit & PIN 6 digit)
VILLAGE_HEADS = [
    {
        "nik": "8171010101850001",
        "full_name": "Budi Santoso",
        "village": "Lonthoir",
        "gender": "L",
        "occupation": "Kepala Desa Lonthoir",
        "pin": "123456",
        "roles": ["resident", "village_officer"],
    },
    {
        "nik": "8171010101850002",
        "full_name": "Ahmad Baadilla",
        "village": "Dwiwarna",
        "gender": "L",
        "occupation": "Kepala Desa Dwiwarna",
        "pin": "123456",
        "roles": ["resident", "village_officer"],
    },
]

# 2 Poktan (Kelompok Tani) dengan Ketuanya masing-masing (berbasis NIK 16 digit & PIN 6 digit)
FARMER_GROUPS_SEED = [
    {
        "group_name": "Poktan Pala Lonthoir Mandiri",
        "village": "Lonthoir",
        "leader_nik": "8171010101800001",
        "leader_name": "Hasan Baadilla",
        "gender": "L",
        "occupation": "Ketua Kelompok Tani Pala",
        "contact": "081234560011",
        "pin": "123456",
        "roles": ["resident", "farmer_group_admin", "farmer"],
        "farmer_code": "PKT-LNT-001",
    },
    {
        "group_name": "Poktan Rempah Dwiwarna Sejahtera",
        "village": "Dwiwarna",
        "leader_nik": "8171010101800002",
        "leader_name": "Ibrahim Latarisa",
        "gender": "L",
        "occupation": "Ketua Kelompok Tani Rempah",
        "contact": "081234560012",
        "pin": "123456",
        "roles": ["resident", "farmer_group_admin", "farmer"],
        "farmer_code": "PKT-DWR-001",
    },
]

# 2 Petani Rempah (berbasis NIK 16 digit & PIN 6 digit)
FARMERS_SEED = [
    {
        "nik": "8171010101900001",
        "full_name": "Ali Wailissa",
        "village": "Lonthoir",
        "gender": "L",
        "occupation": "Petani Rempah Pala",
        "pin": "123456",
        "roles": ["resident", "farmer"],
        "group_name": "Poktan Pala Lonthoir Mandiri",
        "farmer_code": "PTR-LNT-001",
    },
    {
        "nik": "8171010101900002",
        "full_name": "Ruslan Rumra",
        "village": "Dwiwarna",
        "gender": "L",
        "occupation": "Petani Rempah Pala",
        "pin": "123456",
        "roles": ["resident", "farmer"],
        "group_name": "Poktan Rempah Dwiwarna Sejahtera",
        "farmer_code": "PTR-DWR-001",
    },
]

# 2 Warga Sipil (berbasis NIK 16 digit & PIN 6 digit)
CIVILIAN_RESIDENTS = [
    {
        "nik": "8171010101950001",
        "full_name": "Siti Rahma",
        "village": "Lonthoir",
        "gender": "P",
        "occupation": "Ibu Rumah Tangga",
        "pin": "123456",
        "roles": ["resident"],
    },
    {
        "nik": "8171010101950002",
        "full_name": "Halimah Tomagola",
        "village": "Dwiwarna",
        "gender": "P",
        "occupation": "Pedagang Pasar Tradisional",
        "pin": "123456",
        "roles": ["resident"],
    },
]

# Universal Tourism Accounts (non-NIK, login khusus universal)
UNIVERSAL_TOURISM_ACCOUNTS = [
    {
        "username": "operator_homestay",
        "email": "homestay@bandadigital.id",
        "password": "Homestay123!",
        "full_name": "Rahmat Delfika (Admin Homestay Universal)",
        "role": "homestay_operator",
    },
    {
        "username": "admin_wisata",
        "email": "wisata@bandadigital.id",
        "password": "Wisata123!",
        "full_name": "Dewi Nusantara (Admin Wisata Universal)",
        "role": "smart_tourism_admin",
    },
]

# Akun Pendukung Operasional Sistem (Koperasi & Surveyor)
SUPPORT_ACCOUNTS = [
    {
        "username": "pengelola_koperasi",
        "email": "koperasi@bandadigital.id",
        "password": "Koperasi123!",
        "full_name": "Faisal Latarisa (Pengelola Koperasi Hatta)",
        "role": "coop_manager",
    },
    {
        "username": "surveyor",
        "email": "surveyor@bandadigital.id",
        "password": "Surveyor123!",
        "full_name": "Fauzan Arisanto (Surveyor Lapangan & IoT)",
        "role": "field_surveyor",
    },
]


async def _upsert_user_with_roles(
    db: AsyncSession,
    username: str,
    email: str,
    password: str,
    full_name: str,
    role_names: list[str],
    village: str | None = None,
    is_superuser: bool = False,
) -> User:
    user_stmt = select(User).where(User.username == username)
    user = (await db.execute(user_stmt)).scalar_one_or_none()

    # Query role objects
    roles_stmt = select(Role).where(Role.name.in_(role_names))
    role_objs = (await db.execute(roles_stmt)).scalars().all()

    if not user:
        user = User(
            username=username,
            email=email,
            password_hash=hash_password(password),
            full_name=full_name,
            is_active=True,
            is_superuser=is_superuser,
            village=village,
            roles=list(role_objs),
        )
        db.add(user)
        logger.info(f"User created: {username} ({', '.join(role_names)})")
    else:
        user.email = email
        user.full_name = full_name
        user.password_hash = hash_password(password)
        user.is_active = True
        user.is_superuser = is_superuser
        user.village = village
        user.roles = list(role_objs)
        logger.info(f"User updated: {username} ({', '.join(role_names)})")

    await db.flush()
    return user


async def _upsert_resident(
    db: AsyncSession,
    nik: str,
    full_name: str,
    gender: str,
    village: str,
    occupation: str,
    address: str = "Banda Neira",
) -> Resident:
    res_stmt = select(Resident).where(Resident.nik == nik)
    resident = (await db.execute(res_stmt)).scalar_one_or_none()

    if not resident:
        resident = Resident(
            nik=nik,
            full_name=full_name,
            gender=gender,
            village=village,
            address=address,
            occupation=occupation,
            verification_status="verified",
            residence_status="active",
        )
        resident.sync_crypto_nik()
        db.add(resident)
        logger.info(f"Resident created: {nik} - {full_name}")
    else:
        resident.full_name = full_name
        resident.gender = gender
        resident.village = village
        resident.occupation = occupation
        resident.verification_status = "verified"
        resident.residence_status = "active"
        resident.sync_crypto_nik()
        logger.info(f"Resident updated: {nik} - {full_name}")

    await db.flush()
    return resident


async def seed_roles_and_admin(db: AsyncSession) -> None:
    """Melakukan penyegaran data seed sesuai pemetaan aktor Banda Digital Ecosystem."""
    # 1. Seed Roles
    for role_name, description in INITIAL_ROLES:
        stmt = select(Role).where(Role.name == role_name)
        existing_role = (await db.execute(stmt)).scalar_one_or_none()
        if not existing_role:
            role = Role(name=role_name, description=description)
            db.add(role)
    await db.commit()

    # 2. Seed 1 Super Administrator (Hidden)
    await _upsert_user_with_roles(
        db=db,
        username=ADMIN_USER["username"],
        email=ADMIN_USER["email"],
        password=ADMIN_USER["password"],
        full_name=ADMIN_USER["full_name"],
        role_names=[ADMIN_USER["role"]],
        is_superuser=ADMIN_USER["is_superuser"],
    )

    # 3. Seed 2 Kepala Desa (berbasis NIK & PIN 6 digit)
    for kades in VILLAGE_HEADS:
        res = await _upsert_resident(
            db=db,
            nik=kades["nik"],
            full_name=kades["full_name"],
            gender=kades["gender"],
            village=kades["village"],
            occupation=kades["occupation"],
        )
        await _upsert_user_with_roles(
            db=db,
            username=kades["nik"],
            email=f"{kades['nik']}@warga.bandadigital.id",
            password=kades["pin"],
            full_name=f"{kades['full_name']} ({kades['occupation']})",
            role_names=kades["roles"],
            village=kades["village"],
        )

    # 4. Seed 2 Poktan & 2 Ketua Poktan (berbasis NIK & PIN 6 digit)
    group_map = {}
    for grp in FARMER_GROUPS_SEED:
        # Kelompok Tani
        g_stmt = select(FarmerGroup).where(FarmerGroup.name == grp["group_name"])
        f_group = (await db.execute(g_stmt)).scalar_one_or_none()
        if not f_group:
            f_group = FarmerGroup(
                name=grp["group_name"],
                village=grp["village"],
                leader_name=grp["leader_name"],
                contact_number=grp["contact"],
            )
            db.add(f_group)
            await db.flush()
        else:
            f_group.village = grp["village"]
            f_group.leader_name = grp["leader_name"]
            f_group.contact_number = grp["contact"]
        group_map[grp["group_name"]] = f_group

        # Resident Ketua Poktan
        res = await _upsert_resident(
            db=db,
            nik=grp["leader_nik"],
            full_name=grp["leader_name"],
            gender=grp["gender"],
            village=grp["village"],
            occupation=grp["occupation"],
        )
        usr = await _upsert_user_with_roles(
            db=db,
            username=grp["leader_nik"],
            email=f"{grp['leader_nik']}@warga.bandadigital.id",
            password=grp["pin"],
            full_name=f"{grp['leader_name']} ({grp['occupation']})",
            role_names=grp["roles"],
            village=grp["village"],
        )

        # Farmer entry untuk Ketua Poktan
        f_stmt = select(Farmer).where(Farmer.farmer_code == grp["farmer_code"])
        f_rec = (await db.execute(f_stmt)).scalar_one_or_none()
        if not f_rec:
            f_rec = Farmer(
                farmer_code=grp["farmer_code"],
                name=grp["leader_name"],
                phone=grp["contact"],
                status="active",
                farmer_group_id=f_group.id,
                resident_id=res.id,
                user_id=usr.id,
            )
            db.add(f_rec)
        else:
            f_rec.name = grp["leader_name"]
            f_rec.farmer_group_id = f_group.id
            f_rec.resident_id = res.id
            f_rec.user_id = usr.id

    # 5. Seed 2 Petani Rempah (berbasis NIK & PIN 6 digit)
    for ptn in FARMERS_SEED:
        res = await _upsert_resident(
            db=db,
            nik=ptn["nik"],
            full_name=ptn["full_name"],
            gender=ptn["gender"],
            village=ptn["village"],
            occupation=ptn["occupation"],
        )
        usr = await _upsert_user_with_roles(
            db=db,
            username=ptn["nik"],
            email=f"{ptn['nik']}@warga.bandadigital.id",
            password=ptn["pin"],
            full_name=f"{ptn['full_name']} ({ptn['occupation']})",
            role_names=ptn["roles"],
            village=ptn["village"],
        )
        f_grp = group_map.get(ptn["group_name"])
        f_stmt = select(Farmer).where(Farmer.farmer_code == ptn["farmer_code"])
        f_rec = (await db.execute(f_stmt)).scalar_one_or_none()
        if not f_rec:
            f_rec = Farmer(
                farmer_code=ptn["farmer_code"],
                name=ptn["full_name"],
                phone="08123456002" + ptn["farmer_code"][-1],
                status="active",
                farmer_group_id=f_grp.id if f_grp else None,
                resident_id=res.id,
                user_id=usr.id,
            )
            db.add(f_rec)
        else:
            f_rec.name = ptn["full_name"]
            f_rec.farmer_group_id = f_grp.id if f_grp else None
            f_rec.resident_id = res.id
            f_rec.user_id = usr.id

    # 6. Seed 2 Warga Sipil (berbasis NIK & PIN 6 digit)
    for wga in CIVILIAN_RESIDENTS:
        res = await _upsert_resident(
            db=db,
            nik=wga["nik"],
            full_name=wga["full_name"],
            gender=wga["gender"],
            village=wga["village"],
            occupation=wga["occupation"],
        )
        await _upsert_user_with_roles(
            db=db,
            username=wga["nik"],
            email=f"{wga['nik']}@warga.bandadigital.id",
            password=wga["pin"],
            full_name=f"{wga['full_name']} (Warga Desa)",
            role_names=wga["roles"],
            village=wga["village"],
        )

    # 7. Seed 2 Universal Tourism Accounts (non-NIK)
    for univ in UNIVERSAL_TOURISM_ACCOUNTS:
        await _upsert_user_with_roles(
            db=db,
            username=univ["username"],
            email=univ["email"],
            password=univ["password"],
            full_name=univ["full_name"],
            role_names=[univ["role"]],
        )

    # 8. Seed Support Accounts (Koperasi & Surveyor)
    for supp in SUPPORT_ACCOUNTS:
        await _upsert_user_with_roles(
            db=db,
            username=supp["username"],
            email=supp["email"],
            password=supp["password"],
            full_name=supp["full_name"],
            role_names=[supp["role"]],
        )

    await db.commit()
    logger.info("✓ Pemetaan aktor Banda Neira berhasil disegarkan!")


if __name__ == "__main__":
    import asyncio
    from backend.app.database.session import AsyncSessionLocal

    async def main():
        async with AsyncSessionLocal() as session:
            await seed_roles_and_admin(session)
            print("✓ Seluruh data seed pemetaan aktor berhasil diterapkan.")

    asyncio.run(main())
