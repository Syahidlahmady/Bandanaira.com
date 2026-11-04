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
    ("smart_tourism_admin", "Tourism administrator managing public catalog and spice routes"),
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

    # 2. Seed Default Admin User if not exists
    admin_stmt = select(User).where(User.username == "admin")
    existing_admin = (await db.execute(admin_stmt)).scalar_one_or_none()
    if not existing_admin:
        admin_role_stmt = select(Role).where(Role.name == "admin")
        admin_role = (await db.execute(admin_role_stmt)).scalar_one()

        admin_user = User(
            email="admin@bandadigital.id",
            username="admin",
            password_hash=hash_password("Admin123!"),
            full_name="Administrator Banda Neira",
            is_active=True,
            is_superuser=True,
            roles=[admin_role],
        )
        db.add(admin_user)
        await db.commit()
        logger.info("Default admin user created: admin / Admin123!")


if __name__ == "__main__":
    import asyncio
    from backend.app.database.session import AsyncSessionLocal

    async def main():
        async with AsyncSessionLocal() as session:
            await seed_roles_and_admin(session)
            print("✓ Roles & default admin user seeded successfully: admin / Admin123!")

    asyncio.run(main())
