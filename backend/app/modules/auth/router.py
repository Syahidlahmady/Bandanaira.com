from typing import Any, Dict, List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from jose import JWTError
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.account_lockout import (
    check_account_lockout,
    record_login_failure,
    reset_login_failures,
)
from backend.app.core.config import settings
from backend.app.core.permissions import ROLE_ADMIN, ROLE_FARMER, get_current_active_user, require_roles
from backend.app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from backend.app.database.session import get_db
from backend.app.modules.auth.models import Role, User
from backend.app.modules.auth.seed import seed_roles_and_admin
from backend.app.modules.auth.schemas import (
    ChangePasswordRequest,
    ChangePasswordResponse,
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
    identifier = credentials.username_or_email.strip().lower()

    # 1. Proteksi Brute-Force: Cek apakah akun sedang dalam periode penguncian (Lockout)
    is_locked, remaining_seconds = check_account_lockout(identifier)
    if is_locked:
        remaining_minutes = max(1, (remaining_seconds + 59) // 60)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Akun terkunci sementara karena {settings.MAX_LOGIN_ATTEMPTS} kali kegagalan login. Silakan coba lagi dalam {remaining_minutes} menit.",
        )

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

    if not user:
        await seed_roles_and_admin(db)
        user = (await db.execute(stmt)).scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.password_hash):
        # 2. Catat kegagalan login dan picu lockout jika melampaui batas ambang
        attempts, is_now_locked, lockout_secs = record_login_failure(identifier)
        if is_now_locked:
            lockout_min = max(1, (lockout_secs + 59) // 60)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Terlalu banyak percobaan gagal. Akun dikunci sementara selama {lockout_min} menit.",
            )
        remaining_attempts = max(0, settings.MAX_LOGIN_ATTEMPTS - attempts)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Incorrect username or password. Sisa percobaan: {remaining_attempts} kali.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )

    # 3. Reset riwayat kegagalan jika login berhasil
    reset_login_failures(identifier)

    # Sinkronisasi Dinamis Peran Petani:
    # Jika warga (berdasarkan NIK / user_id) terdaftar sebagai anggota kelompok tani atau petani,
    # pastikan peran ROLE_FARMER aktif di akun pengguna sehingga token JWT memuat hak akses petani.
    if not user.is_superuser:
        from backend.app.modules.farmers.models import Farmer
        from backend.app.modules.population.models import Resident

        is_farmer = False
        f_by_user = (await db.execute(select(Farmer).where(Farmer.user_id == user.id))).scalar_one_or_none()
        if f_by_user:
            is_farmer = True
        else:
            res = (await db.execute(select(Resident).where(Resident.nik == user.username))).scalar_one_or_none()
            if res:
                f_by_res = (await db.execute(select(Farmer).where(Farmer.resident_id == res.id))).scalar_one_or_none()
                if f_by_res:
                    is_farmer = True
                    if not f_by_res.user_id:
                        f_by_res.user_id = user.id
                        db.add(f_by_res)

        if is_farmer:
            has_farmer_role = any(r.name == ROLE_FARMER for r in user.roles)
            if not has_farmer_role:
                f_role = (await db.execute(select(Role).where(Role.name == ROLE_FARMER))).scalar_one_or_none()
                if not f_role:
                    f_role = Role(name=ROLE_FARMER, description="Petani Rempah & Komoditas Banda")
                    db.add(f_role)
                    await db.flush()
                user.roles.append(f_role)
                db.add(user)
                await db.commit()
                await db.refresh(user)

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


@router.get("/identify-account")
async def identify_account(
    identifier: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db),
):
    """
    Mendeteksi akun pengguna secara dinamis dari database berdasarkan 16 digit NIK, username, atau email.
    Digunakan oleh portal login Satu Pintu untuk menampilkan nama warga/petani dan peran mereka secara real-time.
    Tidak mengekspos PII sensitif (hanya masked NIK, nama lengkap, desa, peran, dan kelompok tani jika ada).
    """
    clean_id = identifier.strip()
    digits_only = "".join(ch for ch in clean_id if ch.isdigit())

    from backend.app.modules.farmers.models import Farmer
    from backend.app.modules.population.models import Resident

    resident = None
    if len(digits_only) == 16:
        res_stmt = select(Resident).where(Resident.nik == digits_only)
        resident = (await db.execute(res_stmt)).scalar_one_or_none()

    u_stmt = select(User).where(or_(User.username == clean_id, User.email == clean_id))
    user = (await db.execute(u_stmt)).scalar_one_or_none()

    if not user and resident:
        u_by_nik = (await db.execute(select(User).where(User.username == resident.nik))).scalar_one_or_none()
        if u_by_nik:
            user = u_by_nik

    if not resident and user and len(user.username) == 16 and user.username.isdigit():
        res_stmt = select(Resident).where(Resident.nik == user.username)
        resident = (await db.execute(res_stmt)).scalar_one_or_none()

    if not resident and not user:
        return {"found": False, "identifier": clean_id}

    farmer = None
    if resident:
        farmer = (await db.execute(select(Farmer).where(Farmer.resident_id == resident.id))).scalar_one_or_none()
    if not farmer and user:
        farmer = (await db.execute(select(Farmer).where(Farmer.user_id == user.id))).scalar_one_or_none()

    name = resident.full_name if resident else (user.full_name if user else "Warga")
    village = (resident.village if resident else (user.village if user else None)) or "Banda Neira"
    is_active = (resident.residence_status == "active") if resident else (user.is_active if user else True)

    roles = [r.name for r in user.roles] if user else ["resident"]
    is_farmer = bool(farmer) or (resident and resident.occupation and any(k in (resident.occupation or "").lower() for k in ["petani", "pekebun"]))
    if is_farmer and "farmer" not in roles:
        roles.append("farmer")

    # Format NIK yang aman disamarkan
    raw_nik = resident.nik if resident else (user.username if (user and len(user.username) == 16 and user.username.isdigit()) else None)
    masked_nik = f"{raw_nik[:6]}******{raw_nik[-4:]}" if raw_nik and len(raw_nik) == 16 else clean_id

    # Tentukan primary_role dan role_title
    primary_role = "resident"
    role_title = f"Warga Desa ({village})"
    group_name = farmer.group.name if (farmer and farmer.group) else None

    if "admin" in roles or (user and user.is_superuser):
        primary_role = "admin"
        role_title = "Administrator Sistem Banda"
    elif "village_officer" in roles:
        primary_role = "village_officer"
        role_title = f"Petugas Desa ({village})"
    elif "farmer_group_admin" in roles:
        primary_role = "farmer_group_admin"
        role_title = f"Ketua Kelompok Tani ({village})"
    elif is_farmer or "farmer" in roles:
        primary_role = "farmer"
        role_title = f"Petani Rempah ({village})" + (f" · {group_name}" if group_name else "")
    elif "homestay_operator" in roles:
        primary_role = "homestay_operator"
        role_title = f"Mitra Pengelola Eco-Stay ({village})"
    elif "coop_manager" in roles:
        primary_role = "coop_manager"
        role_title = "Pengelola Koperasi Hatta"
    elif "smart_tourism_admin" in roles:
        primary_role = "smart_tourism_admin"
        role_title = "Pemandu Smart Tourism"
    elif "field_surveyor" in roles:
        primary_role = "field_surveyor"
        role_title = "Surveyor Lapangan & IoT"

    return {
        "found": True,
        "identifier": clean_id,
        "name": name,
        "masked_nik": masked_nik,
        "village": village,
        "is_farmer": is_farmer,
        "farmer_code": farmer.farmer_code if farmer else None,
        "farmer_group": group_name,
        "primary_role": primary_role,
        "role_title": role_title,
        "roles": roles,
        "is_active": is_active,
    }


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


@router.post("/logout", status_code=status.HTTP_200_OK)
@router.get("/logout", status_code=status.HTTP_200_OK)
async def logout():
    """Logout session endpoint to clear client credentials gracefully."""
    return {"status": "success", "message": "Sesi berhasil ditutup"}


@router.post("/change-password", response_model=ChangePasswordResponse)
async def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Allow an authenticated user (including residents) to change their password / PIN."""
    if not verify_password(data.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kata sandi / PIN lama tidak sesuai",
        )
    current_user.password_hash = hash_password(data.new_password)
    db.add(current_user)
    await db.commit()
    return ChangePasswordResponse(message="Kata sandi / PIN berhasil diperbarui.")


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
