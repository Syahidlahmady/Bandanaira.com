from typing import List
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.config import settings
from backend.app.core.permissions import ROLE_ADMIN, get_current_active_user, require_roles
from backend.app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from backend.app.database.session import get_db
from backend.app.modules.auth.models import Role, User
from backend.app.modules.auth.schemas import (
    LoginRequest,
    RefreshTokenRequest,
    RoleResponse,
    TokenResponse,
    UserCreate,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])


@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(User)
        .where(
            or_(
                User.username == credentials.username_or_email,
                User.email == credentials.username_or_email,
            )
        )
    )
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )

    role_names = [role.name for role in user.roles]
    access_token = create_access_token(
        subject=str(user.id),
        roles=role_names,
        extra_claims={"username": user.username, "is_superuser": user.is_superuser},
    )
    refresh_token = create_refresh_token(subject=str(user.id))

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        user=UserResponse.model_validate(user),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(request.refresh_token)
        user_id_str: str = payload.get("sub")
        token_type: str = payload.get("type")
        if user_id_str is None or token_type != "refresh":
            raise credentials_exception
        user_id = uuid.UUID(user_id_str)
    except (JWTError, ValueError):
        raise credentials_exception

    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise credentials_exception

    role_names = [role.name for role in user.roles]
    new_access_token = create_access_token(
        subject=str(user.id),
        roles=role_names,
        extra_claims={"username": user.username, "is_superuser": user.is_superuser},
    )
    new_refresh_token = create_refresh_token(subject=str(user.id))

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.get("/roles", response_model=List[RoleResponse])
async def list_roles(
    _: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Role).order_by(Role.name)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post(
    "/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles(ROLE_ADMIN))],
)
async def create_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    # Check duplicate email or username
    check_stmt = select(User).where(
        or_(User.email == user_in.email, User.username == user_in.username)
    )
    existing_user = (await db.execute(check_stmt)).scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email or username already exists",
        )

    # Resolve roles
    role_stmt = select(Role).where(Role.name.in_(user_in.roles))
    roles = (await db.execute(role_stmt)).scalars().all()
    if len(roles) != len(user_in.roles):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more specified roles are invalid",
        )

    new_user = User(
        email=user_in.email,
        username=user_in.username,
        password_hash=hash_password(user_in.password),
        full_name=user_in.full_name,
        is_active=True,
        is_superuser=user_in.is_superuser,
        roles=list(roles),
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user
