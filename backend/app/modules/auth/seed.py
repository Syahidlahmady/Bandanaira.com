import logging
import uuid
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.security import hash_password
from backend.app.modules.auth.models import Role, User
from backend.app.modules.population.models import Resident
from backend.app.modules.farmers.models import Farmer, FarmerGroup
from backend.app.modules.farms.models import Farm
from backend.app.modules.tourism.models import TourGuide

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

# 1 Administrator Pusat (Hidden dari daftar demo publik, login khusus non-NIK)
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
        "farm": {
            "farm_code": "PLT-LNT-001",
            "name": "Kebun Pala Pala Purba Lonthoir",
            "commodity": "Pala Banda",
            "latitude": -4.5421,
            "longitude": 129.8974,
            "area_sqm": 7500.0,
            "village": "Lonthoir",
        },
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
        "farm": {
            "farm_code": "PLT-DWR-001",
            "name": "Kebun Cengkih & Pala Dwiwarna",
            "commodity": "Cengkih & Pala",
            "latitude": -4.5245,
            "longitude": 129.9032,
            "area_sqm": 5200.0,
            "village": "Dwiwarna",
        },
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

# 2 Universal Tourism Accounts (non-NIK, login khusus universal)
UNIVERSAL_TOURISM_ACCOUNTS = [
    {
        "username": "operator_homestay",
        "email": "homestay@bandadigital.id",
        "password": "Homestay123!",
        "full_name": "Rahmat Delfika",
        "role": "homestay_operator",
    },
    {
        "username": "admin_wisata",
        "email": "wisata@bandadigital.id",
        "password": "Wisata123!",
        "full_name": "Dewi Nusantara",
        "role": "smart_tourism_admin",
    },
]

# Akun Operasional Khusus Pendukung (non-NIK, login fungsional modul)
SUPPORT_ACCOUNTS = [
    {
        "username": "pengelola_koperasi",
        "email": "koperasi@bandadigital.id",
        "password": "Koperasi123!",
        "full_name": "Pengelola Koperasi Serba Usaha",
        "role": "coop_manager",
    },
    {
        "username": "surveyor",
        "email": "surveyor@bandadigital.id",
        "password": "Surveyor123!",
        "full_name": "Surveyor Lapangan & IoT",
        "role": "field_surveyor",
    },
]

# 2 Pemandu Wisata Berlisensi (Wajib terhubung ke NIK warga terdaftar)
TOUR_GUIDES_SEED = [
    {
        "resident_nik": "8171010101900001",  # Ali Wailissa (Lonthoir)
        "name": "Ali Wailissa",
        "license_number": "HPI-BANDA-001",
        "phone_whatsapp": "6281234560021",
        "specialties": "Trekking Kebun Pala Purba Lonthoir & Gastronomi Rempah Kenari",
        "languages": "Indonesia, English",
        "fee_per_day_rp": 350000.0,
        "photo_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
        "bio": "Putra asli Lonthoir yang memandu napak tilas perkebunan pala tertua abad ke-16 serta edukasi panen kenari dan pala organik.",
        "island_base": "Pulau Banda Besar",
        "is_verified": True,
        "is_active": True,
        "rating": 4.95,
        "trips_completed": 48,
    },
    {
        "resident_nik": "8171010101900002",  # Ruslan Rumra (Dwiwarna)
        "name": "Ruslan Rumra",
        "license_number": "HPI-BANDA-002",
        "phone_whatsapp": "6281234560022",
        "specialties": "Sejarah Benteng Belgica, Rumah Bung Hatta & Sutan Sjahrir",
        "languages": "Indonesia, English, Dutch",
        "fee_per_day_rp": 400000.0,
        "photo_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
        "bio": "Pemandu budaya berlisensi HPI dengan pengalaman menceritakan sejarah peradaban rempah dan diplomasi kolonial Banda Neira.",
        "island_base": "Pulau Neira",
        "is_verified": True,
        "is_active": True,
        "rating": 5.0,
        "trips_completed": 62,
    },
]


async def clean_stale_data(db: AsyncSession) -> None:
    """Membersihkan seluruh data mock-up lama yang tidak sesuai dari database sebelum seeding."""
    bind = db.bind
    dialect_name = bind.dialect.name if bind and hasattr(bind, "dialect") else ""
    tables_to_clean = [
        "batch_events",
        "batch_harvests",
        "product_batches",
        "blockchain_transactions",
        "raw_surveys",
        "iot_telemetry_logs",
        "audit_logs",
        "administrative_requests",
        "resident_mutations",
        "coop_transactions",
        "coop_accounts",
        "bookings",
        "tour_guides",
        "harvests",
        "farms",
        "farmers",
        "farmer_groups",
        "residents",
        "user_roles",
        "users",
    ]

    if "sqlite" in dialect_name.lower():
        logger.info("🧹 Membersihkan seluruh data test SQLite via DELETE FROM...")
        for tbl in tables_to_clean:
            try:
                await db.execute(text(f"DELETE FROM {tbl};"))
            except Exception:
                pass
        await db.commit()
        logger.info("✓ Pembersihan SQLite selesai.")
        return

    logger.info("🧹 Membersihkan seluruh data lama & akun dummy lama via TRUNCATE CASCADE...")
    truncate_sql = f"TRUNCATE TABLE {', '.join(tables_to_clean)} CASCADE;"
    await db.execute(text(truncate_sql))
    await db.commit()
    logger.info("✓ Pembersihan data lama selesai (TRUNCATE CASCADE sukses).")


async def _create_user_with_roles(
    db: AsyncSession,
    username: str,
    email: str,
    password: str,
    full_name: str,
    role_names: list[str],
    village: str | None = None,
    is_superuser: bool = False,
) -> User:
    roles_stmt = select(Role).where(Role.name.in_(role_names))
    role_objs = (await db.execute(roles_stmt)).scalars().all()

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
    await db.flush()
    return user


async def _create_resident(
    db: AsyncSession,
    nik: str,
    full_name: str,
    gender: str,
    village: str,
    occupation: str,
    address: str = "Kepulauan Banda",
) -> Resident:
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
    await db.flush()
    return resident


async def seed_roles_and_admin(db: AsyncSession, clean_first: bool = True) -> None:
    """Menjalankan seeding bersih pemetaan aktor Banda Digital Ecosystem."""
    if clean_first:
        await clean_stale_data(db)

    # 1. Seed Roles
    for role_name, description in INITIAL_ROLES:
        stmt = select(Role).where(Role.name == role_name)
        existing_role = (await db.execute(stmt)).scalar_one_or_none()
        if not existing_role:
            role = Role(name=role_name, description=description)
            db.add(role)
    await db.commit()

    # 2. Seed 1 Super Administrator (Hidden dari publik)
    await _create_user_with_roles(
        db=db,
        username=ADMIN_USER["username"],
        email=ADMIN_USER["email"],
        password=ADMIN_USER["password"],
        full_name=ADMIN_USER["full_name"],
        role_names=[ADMIN_USER["role"]],
        is_superuser=ADMIN_USER["is_superuser"],
    )

    # 3. Seed 2 Kepala Desa (berbasis NIK 16 digit & PIN 6 digit)
    for kades in VILLAGE_HEADS:
        await _create_resident(
            db=db,
            nik=kades["nik"],
            full_name=kades["full_name"],
            gender=kades["gender"],
            village=kades["village"],
            occupation=kades["occupation"],
        )
        await _create_user_with_roles(
            db=db,
            username=kades["nik"],
            email=f"{kades['nik']}@warga.bandadigital.id",
            password=kades["pin"],
            full_name=f"{kades['full_name']} ({kades['occupation']})",
            role_names=kades["roles"],
            village=kades["village"],
        )

    # 4. Seed 2 Poktan & 2 Ketua Poktan (berbasis NIK 16 digit & PIN 6 digit)
    group_map = {}
    for grp in FARMER_GROUPS_SEED:
        f_group = FarmerGroup(
            name=grp["group_name"],
            village=grp["village"],
            leader_name=grp["leader_name"],
            contact_number=grp["contact"],
        )
        db.add(f_group)
        await db.flush()
        group_map[grp["group_name"]] = f_group

        res = await _create_resident(
            db=db,
            nik=grp["leader_nik"],
            full_name=grp["leader_name"],
            gender=grp["gender"],
            village=grp["village"],
            occupation=grp["occupation"],
        )
        usr = await _create_user_with_roles(
            db=db,
            username=grp["leader_nik"],
            email=f"{grp['leader_nik']}@warga.bandadigital.id",
            password=grp["pin"],
            full_name=f"{grp['leader_name']} ({grp['occupation']})",
            role_names=grp["roles"],
            village=grp["village"],
        )

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
        await db.flush()

    # 5. Seed 2 Petani Rempah & Petak Kebun (berbasis NIK 16 digit & PIN 6 digit)
    residents_by_nik = {}
    for ptn in FARMERS_SEED:
        res = await _create_resident(
            db=db,
            nik=ptn["nik"],
            full_name=ptn["full_name"],
            gender=ptn["gender"],
            village=ptn["village"],
            occupation=ptn["occupation"],
        )
        residents_by_nik[ptn["nik"]] = res
        usr = await _create_user_with_roles(
            db=db,
            username=ptn["nik"],
            email=f"{ptn['nik']}@warga.bandadigital.id",
            password=ptn["pin"],
            full_name=f"{ptn['full_name']} ({ptn['occupation']})",
            role_names=ptn["roles"],
            village=ptn["village"],
        )
        f_grp = group_map.get(ptn["group_name"])
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
        await db.flush()

        # Seed plot kebun untuk petani
        farm_info = ptn.get("farm")
        if farm_info:
            farm_obj = Farm(
                farmer_id=f_rec.id,
                farm_code=farm_info["farm_code"],
                name=farm_info["name"],
                primary_commodity=farm_info["commodity"],
                latitude=farm_info["latitude"],
                longitude=farm_info["longitude"],
                area_sqm=farm_info["area_sqm"],
                village=farm_info["village"],
                verification_status="verified",
            )
            db.add(farm_obj)
            await db.flush()

    # 6. Seed 2 Warga Sipil (berbasis NIK 16 digit & PIN 6 digit)
    for wga in CIVILIAN_RESIDENTS:
        res = await _create_resident(
            db=db,
            nik=wga["nik"],
            full_name=wga["full_name"],
            gender=wga["gender"],
            village=wga["village"],
            occupation=wga["occupation"],
        )
        residents_by_nik[wga["nik"]] = res
        await _create_user_with_roles(
            db=db,
            username=wga["nik"],
            email=f"{wga['nik']}@warga.bandadigital.id",
            password=wga["pin"],
            full_name=f"{wga['full_name']} (Warga Desa)",
            role_names=wga["roles"],
            village=wga["village"],
        )

    # 7. Seed 2 Universal Tourism Accounts & Support Accounts (non-NIK)
    for univ in UNIVERSAL_TOURISM_ACCOUNTS + SUPPORT_ACCOUNTS:
        await _create_user_with_roles(
            db=db,
            username=univ["username"],
            email=univ["email"],
            password=univ["password"],
            full_name=univ["full_name"],
            role_names=[univ["role"]],
        )

    # 8. Seed 2 Pemandu Wisata Resmi (terhubung ke NIK warga terdaftar)
    for tg_info in TOUR_GUIDES_SEED:
        r_obj = residents_by_nik.get(tg_info["resident_nik"])
        guide = TourGuide(
            resident_id=r_obj.id if r_obj else None,
            resident_nik=tg_info["resident_nik"],
            name=tg_info["name"],
            license_number=tg_info["license_number"],
            phone_whatsapp=tg_info["phone_whatsapp"],
            specialties=tg_info["specialties"],
            languages=tg_info["languages"],
            fee_per_day_rp=tg_info["fee_per_day_rp"],
            photo_url=tg_info["photo_url"],
            bio=tg_info["bio"],
            island_base=tg_info["island_base"],
            is_verified=tg_info["is_verified"],
            is_active=tg_info["is_active"],
            rating=tg_info["rating"],
            trips_completed=tg_info["trips_completed"],
        )
        db.add(guide)

    await db.commit()
    logger.info("✓ Pemetaan aktor Banda Neira berhasil disegarkan dan dibersihkan 100%!")


if __name__ == "__main__":
    import asyncio
    from backend.app.database.session import AsyncSessionLocal

    async def main():
        async with AsyncSessionLocal() as session:
            await seed_roles_and_admin(session, clean_first=True)
            print("✓ Seluruh data lama berhasil dibersihkan & seed aktor bersih berhasil diterapkan.")

    asyncio.run(main())
