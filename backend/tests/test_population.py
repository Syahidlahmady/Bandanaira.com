import pytest
from httpx import AsyncClient
from sqlalchemy import select
from backend.app.modules.audit.models import AuditLog


async def get_admin_token(client: AsyncClient) -> str:
    res = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": "admin", "password": "Admin123!"},
    )
    return res.json()["access_token"]


@pytest.mark.asyncio
async def test_create_resident_happy_path(client: AsyncClient):
    token = await get_admin_token(client)
    res = await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "nik": "8171010101900001",
            "full_name": "Ahmad Baadilla",
            "gender": "L",
            "birth_place": "Banda Neira",
            "birth_date": "1990-01-01",
            "address": "Jl. Nusantara No. 12",
            "rt": "001",
            "rw": "002",
            "village": "Banda Neira",
            "occupation": "Petani Rempah Pala",
            "phone_number": "081234567890",
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert data["nik"] == "8171010101900001"
    assert data["full_name"] == "Ahmad Baadilla"
    assert data["verification_status"] == "pending"
    assert data["village"] == "Banda Neira"


@pytest.mark.asyncio
async def test_create_resident_invalid_nik_and_gender(client: AsyncClient):
    token = await get_admin_token(client)
    # Invalid NIK length (not 16 digits)
    res = await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "nik": "12345",
            "full_name": "Salah NIK",
            "gender": "L",
        },
    )
    assert res.status_code == 422

    # Invalid gender
    res_gender = await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "nik": "8171010101900002",
            "full_name": "Salah Gender",
            "gender": "X",
        },
    )
    assert res_gender.status_code == 422


@pytest.mark.asyncio
async def test_duplicate_nik_rejected(client: AsyncClient):
    token = await get_admin_token(client)
    payload = {
        "nik": "8171010101900003",
        "full_name": "Penduduk Asli",
        "gender": "P",
        "village": "Banda Neira",
    }
    res1 = await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {token}"},
        json=payload,
    )
    assert res1.status_code == 201

    # Second attempt with same NIK -> 409
    res2 = await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {token}"},
        json=payload,
    )
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"]


@pytest.mark.asyncio
async def test_list_and_search_residents(client: AsyncClient):
    token = await get_admin_token(client)
    # Seed residents with diverse occupations
    await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {token}"},
        json={"nik": "8171010101900010", "full_name": "Siti Fatimah", "gender": "P", "occupation": "Petani Rempah Pala"},
    )
    await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {token}"},
        json={"nik": "8171010101900020", "full_name": "Budi Santoso", "gender": "L", "occupation": "Nelayan Tangkap Banda"},
    )

    # Search for Siti
    search_res = await client.get(
        "/api/v1/population/residents?search=Siti",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert search_data["total"] >= 1
    assert any("Siti" in item["full_name"] for item in search_data["items"])

    # Search by occupation 'Nelayan'
    occ_search_res = await client.get(
        "/api/v1/population/residents?search=Nelayan",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert occ_search_res.status_code == 200
    occ_data = occ_search_res.json()
    assert any("Nelayan" in item.get("occupation", "") for item in occ_data["items"])

    # Filter explicitly by occupation parameter
    occ_filter_res = await client.get(
        "/api/v1/population/residents?occupation=Nelayan",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert occ_filter_res.status_code == 200
    assert any("Nelayan" in item.get("occupation", "") for item in occ_filter_res.json()["items"])


@pytest.mark.asyncio
async def test_verify_resident_workflow(client: AsyncClient):
    token = await get_admin_token(client)
    create_res = await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {token}"},
        json={"nik": "8171010101900030", "full_name": "Warga Verifikasi", "gender": "L"},
    )
    resident_id = create_res.json()["id"]

    # Verify resident
    verify_res = await client.post(
        f"/api/v1/population/residents/{resident_id}/verify",
        headers={"Authorization": f"Bearer {token}"},
        json={"verification_status": "verified", "notes": "Berkas identitas sesuai"},
    )
    assert verify_res.status_code == 200
    verified_data = verify_res.json()
    assert verified_data["verification_status"] == "verified"
    assert verified_data["verified_by"] is not None
    assert verified_data["verified_at"] is not None


@pytest.mark.asyncio
async def test_create_administrative_request(client: AsyncClient):
    token = await get_admin_token(client)
    create_res = await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {token}"},
        json={"nik": "8171010101900040", "full_name": "Pemohon Layanan", "gender": "L"},
    )
    resident_id = create_res.json()["id"]

    req_res = await client.post(
        "/api/v1/population/requests",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "resident_id": resident_id,
            "request_type": "Surat Keterangan Usaha Perkebunan Rempah",
            "notes": "Keperluan pengajuan kelompok tani",
        },
    )
    assert req_res.status_code == 201
    req_data = req_res.json()
    assert req_data["request_type"] == "Surat Keterangan Usaha Perkebunan Rempah"
    assert req_data["status"] == "submitted"


@pytest.mark.asyncio
async def test_population_statistics(client: AsyncClient):
    token = await get_admin_token(client)
    # Add a farmer and verify
    r1 = await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "nik": "8171010101900050",
            "full_name": "Petani Satu",
            "gender": "L",
            "occupation": "Petani Rempah",
        },
    )
    await client.post(
        f"/api/v1/population/residents/{r1.json()['id']}/verify",
        headers={"Authorization": f"Bearer {token}"},
        json={"verification_status": "verified"},
    )

    stats_res = await client.get(
        "/api/v1/population/statistics",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_residents"] >= 1
    assert stats["total_verified"] >= 1
    assert "L" in stats["gender_distribution"]
    assert "Petani Rempah" in stats["top_occupations"]


@pytest.mark.asyncio
async def test_population_unauthorized_access(client: AsyncClient):
    # Unauthenticated -> 401
    res = await client.get("/api/v1/population/residents")
    assert res.status_code == 401

    # Authenticated as farmer -> 403 Forbidden
    admin_token = await get_admin_token(client)
    await client.post(
        "/api/v1/auth/users",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "email": "farmer1@bandaneira.id",
            "username": "petani1",
            "password": "FarmerPassword123!",
            "full_name": "Petani Cengkih",
            "roles": ["farmer"],
        },
    )
    login_farmer = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": "petani1", "password": "FarmerPassword123!"},
    )
    farmer_token = login_farmer.json()["access_token"]

    farmer_access_res = await client.get(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {farmer_token}"},
    )
    assert farmer_access_res.status_code == 403
    assert "Operation not permitted" in farmer_access_res.json()["detail"]
