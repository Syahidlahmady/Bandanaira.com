import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.security import hash_password
from backend.app.modules.auth.models import Role, User

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

DEMO_USERS = [
    {
        "username": "admin",
        "email": "admin@bandadigital.id",
        "password": "Admin123!",
        "full_name": "Administrator Banda Neira",
        "role": "admin",
        "is_superuser": True,
    },
    {
        "username": "petugas",
        "email": "petugas@bandadigital.id",
        "password": "Petugas123!",
        "full_name": "Budi Santoso (Petugas Pelayanan Desa)",
        "role": "village_officer",
        "is_superuser": False,
    },
    {
        "username": "ketua_kelompok",
        "email": "ketua@bandadigital.id",
        "password": "Ketua123!",
        "full_name": "Hasan Baadilla (Ketua Poktan Pala Banda)",
        "role": "farmer_group_admin",
        "is_superuser": False,
    },
    {
        "username": "petani",
        "email": "petani@bandadigital.id",
        "password": "Petani123!",
        "full_name": "Ali Wailissa (Petani Rempah Lonthoir)",
        "role": "farmer",
        "is_superuser": False,
    },
    {
        "username": "warga",
        "email": "warga@bandadigital.id",
        "password": "Warga123!",
        "full_name": "Siti Rahma (Warga Banda Neira)",
        "role": "resident",
        "is_superuser": False,
    },
    {
        "username": "pengelola_koperasi",
        "email": "koperasi@bandadigital.id",
        "password": "Koperasi123!",
        "full_name": "Faisal Latarisa (Pengelola Koperasi Hatta)",
        "role": "coop_manager",
        "is_superuser": False,
    },
    {
        "username": "operator_homestay",
        "email": "homestay@bandadigital.id",
        "password": "Homestay123!",
        "full_name": "Rahmat Delfika (Pengelola Delfika Eco-Stay)",
        "role": "homestay_operator",
        "is_superuser": False,
    },
    {
        "username": "admin_wisata",
        "email": "wisata@bandadigital.id",
        "password": "Wisata123!",
        "full_name": "Dewi Nusantara (Pengelola Smart Tourism & Pemandu Budaya)",
        "role": "smart_tourism_admin",
        "is_superuser": False,
    },
    {
        "username": "surveyor",
        "email": "surveyor@bandadigital.id",
        "password": "Surveyor123!",
        "full_name": "Fauzan Arisanto (Surveyor Lapangan & IoT Operator)",
        "role": "field_surveyor",
        "is_superuser": False,
    },
]


async def seed_roles_and_admin(db: AsyncSession) -> None:
    # 1. Seed Roles
    for role_name, description in INITIAL_ROLES:
        stmt = select(Role).where(Role.name == role_name)
        existing_role = (await db.execute(stmt)).scalar_one_or_none()
        if not existing_role:
            role = Role(name=role_name, description=description)
            db.add(role)
    await db.commit()

    # 2. Seed Demo Users for each Role
    for u_data in DEMO_USERS:
        u_stmt = select(User).where(User.username == u_data["username"])
        existing_u = (await db.execute(u_stmt)).scalar_one_or_none()
        if not existing_u:
            role_stmt = select(Role).where(Role.name == u_data["role"])
            role_obj = (await db.execute(role_stmt)).scalar_one()

            user_obj = User(
                email=u_data["email"],
                username=u_data["username"],
                password_hash=hash_password(u_data["password"]),
                full_name=u_data["full_name"],
                is_active=True,
                is_superuser=u_data["is_superuser"],
                roles=[role_obj],
            )
            db.add(user_obj)
            logger.info(f"Demo user created: {u_data['username']} ({u_data['role']})")
    await db.commit()


if __name__ == "__main__":
    import asyncio
    from backend.app.database.session import AsyncSessionLocal

    async def main():
        async with AsyncSessionLocal() as session:
            await seed_roles_and_admin(session)
            print("✓ Roles & default admin user seeded successfully: admin / Admin123!")

    asyncio.run(main())
