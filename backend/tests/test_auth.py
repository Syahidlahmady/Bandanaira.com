import pytest
from httpx import AsyncClient
from backend.app.core.security import (
    create_access_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_password_hashing():
    raw_pass = "BandaNeira2026!"
    hashed = hash_password(raw_pass)
    assert hashed != raw_pass
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


def test_token_creation_and_decoding():
    token = create_access_token("test-user-id", roles=["admin", "village_officer"])
    payload = decode_token(token)
    assert payload["sub"] == "test-user-id"
    assert "admin" in payload["roles"]
    assert payload["type"] == "access"


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": "admin", "password": "Admin123!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["username"] == "admin"
    assert any(role["name"] == "admin" for role in data["user"]["roles"])


@pytest.mark.asyncio
async def test_login_invalid_password(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": "admin", "password": "IncorrectPassword"},
    )
    assert response.status_code == 401
    assert "detail" in response.json()


@pytest.mark.asyncio
async def test_login_nonexistent_user(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": "nonexistent_user", "password": "SomePassword123"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me_authenticated(client: AsyncClient):
    # 1. Login
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": "admin", "password": "Admin123!"},
    )
    token = login_res.json()["access_token"]

    # 2. Get profile
    me_res = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    user_data = me_res.json()
    assert user_data["username"] == "admin"
    assert user_data["email"] == "admin@bandadigital.id"


@pytest.mark.asyncio
async def test_get_me_unauthorized(client: AsyncClient):
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_refresh_token_flow(client: AsyncClient):
    # 1. Login
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": "admin", "password": "Admin123!"},
    )
    refresh_token = login_res.json()["refresh_token"]

    # 2. Refresh
    refresh_res = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_res.status_code == 200
    data = refresh_res.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_rbac_admin_can_create_user(client: AsyncClient):
    # Login as admin
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": "admin", "password": "Admin123!"},
    )
    admin_token = login_res.json()["access_token"]

    # Create village officer
    create_res = await client.post(
        "/api/v1/auth/users",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "email": "petugas@bandaneira.desa.id",
            "username": "petugas1",
            "password": "PetugasPassword123!",
            "full_name": "Petugas Desa Banda Neira",
            "roles": ["village_officer"],
        },
    )
    assert create_res.status_code == 201
    officer_data = create_res.json()
    assert officer_data["username"] == "petugas1"
    assert any(r["name"] == "village_officer" for r in officer_data["roles"])


@pytest.mark.asyncio
async def test_rbac_non_admin_cannot_create_user(client: AsyncClient):
    # 1. Login as admin and create a village officer
    login_admin = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": "admin", "password": "Admin123!"},
    )
    admin_token = login_admin.json()["access_token"]

    await client.post(
        "/api/v1/auth/users",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "email": "officer@bandaneira.desa.id",
            "username": "officer1",
            "password": "Password123!",
            "full_name": "Officer Test",
            "roles": ["village_officer"],
        },
    )

    # 2. Login as the newly created village officer
    login_officer = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": "officer1", "password": "Password123!"},
    )
    officer_token = login_officer.json()["access_token"]

    # 3. Officer attempts to create another user -> MUST BE 403 FORBIDDEN
    attempt_res = await client.post(
        "/api/v1/auth/users",
        headers={"Authorization": f"Bearer {officer_token}"},
        json={
            "email": "another@bandaneira.desa.id",
            "username": "another1",
            "password": "Password123!",
            "full_name": "Another User",
            "roles": ["farmer"],
        },
    )
    assert attempt_res.status_code == 403
    assert "Operation not permitted" in attempt_res.json()["detail"]


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "username,password,expected_role",
    [
        ("pengelola_koperasi", "Koperasi123!", "coop_manager"),
        ("operator_homestay", "Homestay123!", "homestay_operator"),
        ("admin_wisata", "Wisata123!", "smart_tourism_admin"),
        ("surveyor", "Surveyor123!", "field_surveyor"),
    ],
)
async def test_login_segmented_roles(
    client: AsyncClient, username: str, password: str, expected_role: str
):
    response = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": username, "password": password},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["username"] == username
    assert any(role["name"] == expected_role for role in data["user"]["roles"])

