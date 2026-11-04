import pytest
from httpx import AsyncClient


async def get_admin_token(client: AsyncClient) -> str:
    res = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": "admin", "password": "Admin123!"},
    )
    return res.json()["access_token"]


@pytest.mark.asyncio
async def test_create_farmer_group_and_list(client: AsyncClient):
    token = await get_admin_token(client)
    res = await client.post(
        "/api/v1/farmers/groups",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Kelompok Tani Pala Neira Makmur",
            "leader_name": "Pak Abdullah",
            "village": "Banda Neira",
            "contact_number": "081299998888",
        },
    )
    assert res.status_code == 201
    group_data = res.json()
    assert group_data["name"] == "Kelompok Tani Pala Neira Makmur"

    # List groups
    list_res = await client.get(
        "/api/v1/farmers/groups",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert list_res.status_code == 200
    groups = list_res.json()
    assert any(g["name"] == "Kelompok Tani Pala Neira Makmur" for g in groups)


@pytest.mark.asyncio
async def test_duplicate_farmer_group_rejected(client: AsyncClient):
    token = await get_admin_token(client)
    payload = {"name": "Kelompok Tani Unik"}
    res1 = await client.post(
        "/api/v1/farmers/groups",
        headers={"Authorization": f"Bearer {token}"},
        json=payload,
    )
    assert res1.status_code == 201

    res2 = await client.post(
        "/api/v1/farmers/groups",
        headers={"Authorization": f"Bearer {token}"},
        json=payload,
    )
    assert res2.status_code == 409


@pytest.mark.asyncio
async def test_register_farmer_and_farms(client: AsyncClient):
    token = await get_admin_token(client)
    # 1. Create group
    group_res = await client.post(
        "/api/v1/farmers/groups",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "Kelompok Tani Cengkih Banda"},
    )
    group_id = group_res.json()["id"]

    # 2. Register farmer
    farmer_res = await client.post(
        "/api/v1/farmers",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "farmer_code": "BN-FRM-001",
            "name": "Ibrahim Banda",
            "phone": "081344445555",
            "farmer_group_id": group_id,
        },
    )
    assert farmer_res.status_code == 201
    farmer_data = farmer_res.json()
    assert farmer_data["farmer_code"] == "BN-FRM-001"
    farmer_id = farmer_data["id"]

    # 3. Register farm plot with coordinates in Banda Neira
    farm_res = await client.post(
        "/api/v1/farms",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "farmer_id": farmer_id,
            "farm_code": "BN-FARM-001",
            "name": "Kebun Pala Benteng Belgica",
            "location_description": "Lereng perbukitan dekat benteng Belgica",
            "latitude": -4.5255,
            "longitude": 129.9042,
            "area_sqm": 7500.0,
            "primary_commodity": "Pala",
        },
    )
    assert farm_res.status_code == 201
    farm_data = farm_res.json()
    assert farm_data["farm_code"] == "BN-FARM-001"
    assert farm_data["primary_commodity"] == "Pala"
    assert farm_data["latitude"] == -4.5255

    # 4. Fetch GeoJSON
    geojson_res = await client.get(
        "/api/v1/farms/geojson/all",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert geojson_res.status_code == 200
    fc = geojson_res.json()
    assert fc["type"] == "FeatureCollection"
    assert len(fc["features"]) >= 1
    sample_feature = fc["features"][0]
    assert sample_feature["type"] == "Feature"
    assert sample_feature["geometry"]["type"] == "Point"
    assert sample_feature["geometry"]["coordinates"] == [129.9042, -4.5255]

    # 5. Summary statistics
    stats_res = await client.get(
        "/api/v1/farms/statistics/summary",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_farmers"] >= 1
    assert stats["total_farms"] >= 1
    assert stats["total_area_sqm"] >= 7500.0
    assert "Pala" in stats["commodity_distribution"]


@pytest.mark.asyncio
async def test_duplicate_farm_code_rejected(client: AsyncClient):
    token = await get_admin_token(client)
    farmer_res = await client.post(
        "/api/v1/farmers",
        headers={"Authorization": f"Bearer {token}"},
        json={"farmer_code": "BN-FRM-002", "name": "Petani Dua"},
    )
    farmer_id = farmer_res.json()["id"]

    farm_payload = {
        "farmer_id": farmer_id,
        "farm_code": "BN-FARM-DUPLICATE",
        "name": "Kebun Asli",
        "latitude": -4.52,
        "longitude": 129.90,
        "area_sqm": 1000.0,
        "primary_commodity": "Cengkih",
    }
    r1 = await client.post(
        "/api/v1/farms",
        headers={"Authorization": f"Bearer {token}"},
        json=farm_payload,
    )
    assert r1.status_code == 201

    r2 = await client.post(
        "/api/v1/farms",
        headers={"Authorization": f"Bearer {token}"},
        json=farm_payload,
    )
    assert r2.status_code == 409
