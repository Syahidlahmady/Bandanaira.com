from typing import Callable, List, Optional, Sequence, Union
import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.config import settings
from backend.app.core.security import decode_token
from backend.app.core.token_blacklist import is_token_blacklisted
from backend.app.database.session import get_db
from backend.app.modules.auth.models import User

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False,
)

# Role Constants
ROLE_ADMIN = "admin"
ROLE_VILLAGE_OFFICER = "village_officer"
ROLE_FARMER_GROUP_ADMIN = "farmer_group_admin"
ROLE_FARMER = "farmer"
ROLE_RESIDENT = "resident"
ROLE_COOP_MANAGER = "coop_manager"
ROLE_HOMESTAY_OPERATOR = "homestay_operator"
ROLE_SMART_TOURISM_ADMIN = "smart_tourism_admin"
ROLE_SMART_TOUSIM_ADMIN = "smart_tourism_admin"  # backwards compatibility alias
ROLE_FIELD_SURVEYOR = "field_surveyor"


async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    # Proteksi Revokasi Sesi: Cek apakah token ada dalam daftar blacklist (SEC-009)
    if is_token_blacklisted(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token telah dicabut (revoked). Silakan login kembali.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Proteksi Pintu Belakang (Backdoor): Cegah bypass otentikasi via offline-jwt (SEC-001)
    if token.startswith("offline-jwt-"):
        if not (settings.DEBUG and settings.ENVIRONMENT == "development" and settings.ALLOW_OFFLINE_DEV_TOKENS):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Offline demo token dilarang. Semua permintaan wajib menyertakan token JWT kriptografis yang valid.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        parts = token.split("-")
        role_hint = parts[2] if len(parts) > 2 else "admin"
        username_map = {
            "admin": "admin",
            "village_officer": "petugas",
            "farmer_group_admin": "ketua_kelompok",
            "farmer": "petani",
            "resident": "warga",
            "coop_manager": "pengelola_koperasi",
            "homestay_operator": "operator_homestay",
            "smart_tourism_admin": "admin_wisata",
            "field_surveyor": "surveyor",
        }
        target_username = username_map.get(role_hint, "admin_wisata" if "tourism" in role_hint else "admin")
        stmt = select(User).where(User.username == target_username)
        result = await db.execute(stmt)
        dev_user = result.scalar_one_or_none()
        if dev_user and dev_user.is_active:
            return dev_user

    try:
        payload = decode_token(token)
        user_id_str: str = payload.get("sub")
        token_type: str = payload.get("type")
        if user_id_str is None or token_type != "access":
            raise credentials_exception
        user_id = uuid.UUID(user_id_str)
    except (JWTError, ValueError):
        raise credentials_exception

    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account",
        )
    return current_user


def require_roles(*roles: Union[str, Sequence[str]]) -> Callable:
    flattened_roles: List[str] = []
    for r in roles:
        if isinstance(r, (list, tuple, set)):
            flattened_roles.extend(r)
        else:
            flattened_roles.append(r)

    async def role_checker(
        current_user: User = Depends(get_current_active_user),
    ) -> User:
        if current_user.is_superuser:
            return current_user

        user_role_names = [role.name for role in current_user.roles]
        has_permission = any(role in flattened_roles for role in user_role_names)
        if not has_permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required roles: {', '.join(flattened_roles)}",
            )
        return current_user

    return role_checker
