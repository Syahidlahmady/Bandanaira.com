import pytest
import pytest_asyncio
from httpx import AsyncClient
from backend.app.modules.blockchain.service import blockchain_service


async def get_admin_token(client: AsyncClient) -> str:
    res = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": "admin", "password": "Admin123!"},
    )
    return res.json()["access_token"]


async def get_enumerator_token(client: AsyncClient, admin_token: str) -> str:
    username = "pencatat_blockchain"
    # Create officer user
    await client.post(
        "/api/v1/auth/users",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "email": f"{username}@bandadigital.id",
            "username": username,
            "full_name": "Petugas Pencatat Rantai Pasok",
            "password": "Password123!",
            "roles": ["village_officer"],
        },
    )
    res = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": username, "password": "Password123!"},
    )
    return res.json()["access_token"]


async def get_farmer_token(client: AsyncClient, admin_token: str) -> str:
    username = "petani_biasa"
    create_res = await client.post(
        "/api/v1/auth/users",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "email": f"{username}@bandadigital.id",
            "username": username,
            "full_name": "Petani Rempah Biasa",
            "password": "Password123!",
            "roles": ["farmer"],
        },
    )
    assert create_res.status_code == 201
    res = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": username, "password": "Password123!"},
    )
    return res.json()["access_token"]


@pytest.mark.asyncio
async def test_blockchain_anchor_and_verify_workflow(client: AsyncClient):
    admin_token = await get_admin_token(client)
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Setup prerequisite farmer, farm, harvest, and batch
    farmer_res = await client.post(
        "/api/v1/farmers",
        headers=headers,
        json={"farmer_code": "BN-FRM-BC-01", "name": "Petani Rempah Blockchain Banda"},
    )
    farmer_id = farmer_res.json()["id"]

    farm_res = await client.post(
        "/api/v1/farms",
        headers=headers,
        json={
            "farmer_id": farmer_id,
            "farm_code": "BN-FARM-BC-01",
            "name": "Kebun Pala Hatta Heritage",
            "latitude": -4.52,
            "longitude": 129.91,
            "area_sqm": 8000.0,
            "primary_commodity": "Pala",
        },
    )
    farm_id = farm_res.json()["id"]

    harvest_res = await client.post(
        "/api/v1/harvests",
        headers=headers,
        json={
            "farm_id": farm_id,
            "farmer_id": farmer_id,
            "harvest_code": "BN-HRV-BC-001",
            "commodity": "Pala",
            "harvest_date": "2026-11-03",
            "quantity_kg": 300.0,
            "quality_grade": "Grade A Export",
        },
    )
    harvest_id = harvest_res.json()["id"]

    batch_res = await client.post(
        "/api/v1/batches",
        headers=headers,
        json={
            "batch_code": "BN-BTC-BC-001",
            "commodity": "Pala Banda Export Quality",
            "production_date": "2026-11-04",
            "harvests": [{"harvest_id": harvest_id, "allocated_quantity_kg": 300.0}],
        },
    )
    assert batch_res.status_code == 201
    batch_data = batch_res.json()
    batch_id = batch_data["id"]
    assert batch_data["blockchain_status"] == "pending"

    # 2. Anchor batch genesis hash to blockchain
    anchor_res = await client.post(
        f"/api/v1/blockchain/batches/{batch_id}/anchor",
        headers=headers,
    )
    assert anchor_res.status_code == 201
    tx_data = anchor_res.json()
    assert tx_data["batch_id"] == batch_id
    assert tx_data["status"] == "confirmed"
    assert tx_data["transaction_hash"].startswith("0x")
    assert tx_data["block_number"] is not None
    assert tx_data["data_hash"].startswith("0x")

    # 3. List transactions for batch
    tx_list_res = await client.get(
        f"/api/v1/blockchain/batches/{batch_id}/transactions",
        headers=headers,
    )
    assert tx_list_res.status_code == 200
    tx_list = tx_list_res.json()
    assert len(tx_list) == 1
    assert tx_list[0]["transaction_hash"] == tx_data["transaction_hash"]

    # 4. Verify batch cryptographic integrity
    verify_res = await client.get(f"/api/v1/blockchain/batches/{batch_id}/verify")
    assert verify_res.status_code == 200
    verify_data = verify_res.json()
    assert verify_data["is_verified"] is True
    assert verify_data["status"] == "confirmed"
    assert verify_data["latest_db_hash"] == verify_data["on_chain_hash"]
    assert verify_data["block_number"] == tx_data["block_number"]

    # 5. Append new lifecycle event and re-anchor
    event_res = await client.post(
        f"/api/v1/batches/{batch_id}/events",
        headers=headers,
        json={
            "event_type": "drying",
            "location": "Rumah Pengering Banda",
            "description": "Pengeringan rempah pala tahap 1",
            "metadata_json": {"humidity_pct": 12.5},
        },
    )
    assert event_res.status_code == 201
    drying_event = event_res.json()

    anchor_event_res = await client.post(
        f"/api/v1/blockchain/batches/{batch_id}/anchor",
        headers=headers,
        json={"event_id": drying_event["id"]},
    )
    assert anchor_event_res.status_code == 201
    tx_event_data = anchor_event_res.json()
    assert tx_event_data["status"] == "confirmed"
    assert tx_event_data["block_number"] > tx_data["block_number"]

    # Re-verify latest event hash on-chain
    verify_res2 = await client.get(f"/api/v1/blockchain/batches/{batch_id}/verify")
    assert verify_res2.status_code == 200
    verify_data2 = verify_res2.json()
    assert verify_data2["is_verified"] is True
    assert verify_data2["block_number"] == tx_event_data["block_number"]


@pytest.mark.asyncio
async def test_blockchain_permission_denial(client: AsyncClient):
    admin_token = await get_admin_token(client)
    farmer_token = await get_farmer_token(client, admin_token)

    # 1. Farmer cannot trigger anchor
    fake_id = "00000000-0000-0000-0000-000000000001"
    res_farmer = await client.post(
        f"/api/v1/blockchain/batches/{fake_id}/anchor",
        headers={"Authorization": f"Bearer {farmer_token}"},
    )
    assert res_farmer.status_code == 403

    # 2. Unauthenticated cannot trigger anchor
    res_unauth = await client.post(f"/api/v1/blockchain/batches/{fake_id}/anchor")
    assert res_unauth.status_code == 401

    # 3. Nonexistent batch returns 404 for authorized user
    res_404 = await client.post(
        f"/api/v1/blockchain/batches/{fake_id}/anchor",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_404.status_code == 404


@pytest.mark.asyncio
async def test_blockchain_zero_pii_audit(client: AsyncClient):
    admin_token = await get_admin_token(client)
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Setup batch
    farmer = (await client.post(
        "/api/v1/farmers",
        headers=headers,
        json={"farmer_code": "BN-FRM-PII-01", "name": "Petani PII Audit Banda"},
    )).json()

    farm = (await client.post(
        "/api/v1/farms",
        headers=headers,
        json={
            "farmer_id": farmer["id"],
            "farm_code": "BN-FARM-PII-01",
            "name": "Kebun Rempah PII Test",
            "latitude": -4.51,
            "longitude": 129.90,
            "area_sqm": 2500.0,
            "primary_commodity": "Cengkih",
        },
    )).json()

    harvest = (await client.post(
        "/api/v1/harvests",
        headers=headers,
        json={
            "farm_id": farm["id"],
            "farmer_id": farmer["id"],
            "harvest_code": "BN-HRV-PII-001",
            "commodity": "Cengkih",
            "harvest_date": "2026-11-04",
            "quantity_kg": 150.0,
        },
    )).json()

    batch = (await client.post(
        "/api/v1/batches",
        headers=headers,
        json={
            "batch_code": "BN-BTC-PII-001",
            "commodity": "Cengkih Banda",
            "production_date": "2026-11-04",
            "harvests": [{"harvest_id": harvest["id"], "allocated_quantity_kg": 150.0}],
        },
    )).json()

    anchor = (await client.post(
        f"/api/v1/blockchain/batches/{batch['id']}/anchor",
        headers=headers,
    )).json()

    verify = (await client.get(
        f"/api/v1/blockchain/batches/{batch['id']}/verify"
    )).json()

    # AUDIT: Ensure NO PII anywhere in blockchain transaction or verification outputs
    combined_repr = (str(anchor) + str(verify)).lower()
    assert "nik" not in combined_repr
    assert "password" not in combined_repr
    assert "phone" not in combined_repr
    assert "telepon" not in combined_repr
    assert "email" not in combined_repr
