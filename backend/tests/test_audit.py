import pytest
from httpx import AsyncClient


async def get_token(client: AsyncClient, username: str, password: str) -> str:
    res = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": username, "password": password},
    )
    assert res.status_code == 200, res.text
    return res.json()["access_token"]


@pytest.mark.asyncio
async def test_audit_logs_rbac_permissions(client: AsyncClient):
    admin_token = await get_token(client, "admin", "Admin123!")
    officer_token = await get_token(client, "petugas", "Petugas123!")
    farmer_token = await get_token(client, "petani", "Petani123!")
    resident_token = await get_token(client, "warga", "Warga123!")

    # 1. Admin and Village Officer should have access (200 OK)
    res_admin = await client.get(
        "/api/v1/audit/logs",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_admin.status_code == 200
    assert "items" in res_admin.json()

    res_officer = await client.get(
        "/api/v1/audit/logs",
        headers={"Authorization": f"Bearer {officer_token}"},
    )
    assert res_officer.status_code == 200

    # 2. Farmer and Resident should be rejected (403 Forbidden)
    res_farmer = await client.get(
        "/api/v1/audit/logs",
        headers={"Authorization": f"Bearer {farmer_token}"},
    )
    assert res_farmer.status_code == 403

    res_resident = await client.get(
        "/api/v1/audit/logs",
        headers={"Authorization": f"Bearer {resident_token}"},
    )
    assert res_resident.status_code == 403

    # 3. Unauthenticated request should be rejected (401 Unauthorized)
    res_unauth = await client.get("/api/v1/audit/logs")
    assert res_unauth.status_code == 401


@pytest.mark.asyncio
async def test_audit_logs_recording_and_filtering(client: AsyncClient):
    admin_token = await get_token(client, "admin", "Admin123!")

    # Create a resident to trigger an audit log
    create_res = await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "nik": "8171011508920005",
            "full_name": "Hamid Alkatiri",
            "gender": "L",
            "village": "Banda Neira",
            "occupation": "Petani Rempah Pala",
        },
    )
    assert create_res.status_code == 201

    # Fetch audit logs filtered by entity_name='resident'
    res_logs = await client.get(
        "/api/v1/audit/logs?entity_name=resident",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_logs.status_code == 200
    data = res_logs.json()
    assert data["total"] >= 1
    assert len(data["items"]) >= 1

    matched = [item for item in data["items"] if "resident" in item["entity_name"]]
    assert len(matched) >= 1
    assert "CREATE" in matched[0]["action"].upper()
    assert matched[0]["user"]["username"] == "admin"

    # Test filtering with non-matching entity returns 0
    res_empty = await client.get(
        "/api/v1/audit/logs?entity_name=non_existent_entity",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_empty.status_code == 200
    assert res_empty.json()["total"] == 0


@pytest.mark.asyncio
async def test_ecosystem_summary_aggregates(client: AsyncClient):
    admin_token = await get_token(client, "admin", "Admin123!")
    officer_token = await get_token(client, "petugas", "Petugas123!")

    # 1. Create test resident
    await client.post(
        "/api/v1/population/residents",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "nik": "8171012010880003",
            "full_name": "Fatimah Lestaluhu",
            "gender": "P",
            "village": "Banda Neira",
            "occupation": "Pengolah Fuli & Minyak Pala",
        },
    )

    # 2. Call ecosystem summary endpoint
    res = await client.get(
        "/api/v1/audit/ecosystem-summary",
        headers={"Authorization": f"Bearer {officer_token}"},
    )
    assert res.status_code == 200
    data = res.json()

    assert data["village_name"] == "Desa Banda Neira"
    assert "population" in data
    assert data["population"]["total_residents"] >= 1
    assert "Pengolah Fuli & Minyak Pala" in data["population"]["livelihoods_count"]

    assert "farms" in data
    assert "harvests" in data
    assert "traceability" in data
    assert "letters" in data
    assert data["total_audit_events"] >= 1
    assert len(data["recent_audit_logs"]) >= 1
