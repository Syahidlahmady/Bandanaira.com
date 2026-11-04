from datetime import datetime, timezone
import pytest
from httpx import AsyncClient
from backend.app.modules.traceability.hashing import calculate_event_hash


async def get_admin_token(client: AsyncClient) -> str:
    res = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": "admin", "password": "Admin123!"},
    )
    return res.json()["access_token"]


def test_deterministic_event_hashing():
    now = datetime(2026, 11, 4, 10, 0, 0, tzinfo=timezone.utc)
    import uuid
    b_id = uuid.uuid4()
    
    hash1 = calculate_event_hash(
        batch_id=b_id,
        event_type="drying",
        event_timestamp=now,
        metadata={"temperature_c": 38.5, "duration_days": 4},
        previous_event_hash="0000000000000000000000000000000000000000000000000000000000000000",
    )
    hash2 = calculate_event_hash(
        batch_id=b_id,
        event_type="drying",
        event_timestamp=now,
        metadata={"temperature_c": 38.5, "duration_days": 4},
        previous_event_hash="0000000000000000000000000000000000000000000000000000000000000000",
    )
    assert hash1 == hash2
    assert len(hash1) == 64

    # Altering metadata produces a completely different hash
    hash3 = calculate_event_hash(
        batch_id=b_id,
        event_type="drying",
        event_timestamp=now,
        metadata={"temperature_c": 39.0, "duration_days": 4},
        previous_event_hash="0000000000000000000000000000000000000000000000000000000000000000",
    )
    assert hash1 != hash3


@pytest.mark.asyncio
async def test_end_to_end_traceability_and_qr_verification(client: AsyncClient):
    token = await get_admin_token(client)

    # 1. Setup farmer and farm
    farmer_res = await client.post(
        "/api/v1/farmers",
        headers={"Authorization": f"Bearer {token}"},
        json={"farmer_code": "BN-FRM-TRACE", "name": "Petani Traceability Banda"},
    )
    farmer_id = farmer_res.json()["id"]

    farm_res = await client.post(
        "/api/v1/farms",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "farmer_id": farmer_id,
            "farm_code": "BN-FARM-TRACE",
            "name": "Perkebunan Pala Lonthoir Asli",
            "latitude": -4.53,
            "longitude": 129.89,
            "area_sqm": 5000.0,
            "primary_commodity": "Pala",
        },
    )
    farm_id = farm_res.json()["id"]

    # 2. Record harvest
    harvest_res = await client.post(
        "/api/v1/harvests",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "farm_id": farm_id,
            "farmer_id": farmer_id,
            "harvest_code": "BN-HRV-2026-001",
            "commodity": "Pala",
            "harvest_date": "2026-11-01",
            "quantity_kg": 250.0,
            "quality_grade": "Super Grade A",
        },
    )
    assert harvest_res.status_code == 201
    harvest_id = harvest_res.json()["id"]

    # Duplicate harvest code rejected
    dup_h = await client.post(
        "/api/v1/harvests",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "farm_id": farm_id,
            "farmer_id": farmer_id,
            "harvest_code": "BN-HRV-2026-001",
            "commodity": "Pala",
            "harvest_date": "2026-11-01",
            "quantity_kg": 100.0,
        },
    )
    assert dup_h.status_code == 409

    # 3. Create Product Batch
    batch_res = await client.post(
        "/api/v1/batches",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "batch_code": "BN-BTC-2026-001",
            "commodity": "Pala Banda",
            "production_date": "2026-11-02",
            "harvests": [
                {"harvest_id": harvest_id, "allocated_quantity_kg": 200.0}
            ],
        },
    )
    assert batch_res.status_code == 201
    batch_data = batch_res.json()
    batch_id = batch_data["id"]
    qr_token = batch_data["public_verification_token"]
    assert batch_data["total_quantity_kg"] == 200.0
    assert len(batch_data["events"]) == 1
    assert batch_data["events"][0]["event_type"] == "harvest_aggregated"
    genesis_hash = batch_data["events"][0]["event_hash"]

    # 4. Append lifecycle events (Drying & Packaging)
    drying_res = await client.post(
        f"/api/v1/batches/{batch_id}/events",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "event_type": "drying",
            "location": "Rumah Pengeringan Rempah Lonthoir",
            "description": "Pengeringan tradisional di bawah sinar matahari",
            "metadata_json": {"method": "solar", "target_moisture_pct": 10.0},
        },
    )
    assert drying_res.status_code == 201
    drying_event = drying_res.json()
    assert drying_event["previous_event_hash"] == genesis_hash
    drying_hash = drying_event["event_hash"]

    packaging_res = await client.post(
        f"/api/v1/batches/{batch_id}/events",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "event_type": "packaging",
            "location": "Sentra Pengemasan Rempah Banda Neira",
            "description": "Pengemasan vakum aluminium foil food grade 250g",
            "metadata_json": {"package_units": 800, "weight_per_unit_g": 250},
        },
    )
    assert packaging_res.status_code == 201
    packaging_event = packaging_res.json()
    assert packaging_event["previous_event_hash"] == drying_hash

    # 5. Public QR Verification Endpoint (ZERO AUTH REQUIRED)
    pub_res = await client.get(f"/api/v1/public/verify/{qr_token}")
    assert pub_res.status_code == 200
    pub_data = pub_res.json()

    assert pub_data["batch_code"] == "BN-BTC-2026-001"
    assert pub_data["commodity"] == "Pala Banda"
    assert pub_data["status"] == "packaged"
    assert pub_data["verified_integrity"] is True
    assert len(pub_data["timeline"]) == 3  # genesis + drying + packaging
    assert "Perkebunan Pala Lonthoir Asli" in pub_data["origin_farms"]
    assert pub_data["qr_code_base64"].startswith("data:image/png;base64,")

    # PRIVACY AUDIT: Ensure NO sensitive PII leaked to public!
    raw_text = str(pub_data).lower()
    assert "nik" not in raw_text
    assert "password" not in raw_text
    assert "081" not in raw_text  # no phone numbers


@pytest.mark.asyncio
async def test_public_qr_verification_invalid_token(client: AsyncClient):
    res = await client.get("/api/v1/public/verify/invalid-nonexistent-token-xyz")
    assert res.status_code == 404
    assert "tidak valid" in res.json()["detail"].lower()
