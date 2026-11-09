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


async def get_user_token(client: AsyncClient, username: str, password: str) -> str:
    res = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": username, "password": password},
    )
    return res.json()["access_token"]


@pytest.mark.asyncio
async def test_farm_approval_workflow_and_role_permissions(client: AsyncClient):
    admin_token = await get_admin_token(client)
    ketua_token = await get_user_token(client, "ketua_kelompok", "Ketua123!")
    petani_token = await get_user_token(client, "petani", "Petani123!")
    petugas_token = await get_user_token(client, "petugas", "Petugas123!")

    # 1. Create a farmer as admin
    farmer_res = await client.post(
        "/api/v1/farmers",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"farmer_code": "BN-FRM-099", "name": "Pak Ali Lonthoir"},
    )
    assert farmer_res.status_code == 201
    farmer_id = farmer_res.json()["id"]

    # 2. Regular farmer attempts to add a farm plot -> 403 Forbidden!
    farm_payload = {
        "farmer_id": farmer_id,
        "farm_code": "BN-FARM-PETANI-FAIL",
        "name": "Kebun Petani Ilegal",
        "latitude": -4.53,
        "longitude": 129.89,
        "area_sqm": 2500.0,
        "primary_commodity": "Pala",
    }
    fail_res = await client.post(
        "/api/v1/farms",
        headers={"Authorization": f"Bearer {petani_token}"},
        json=farm_payload,
    )
    assert fail_res.status_code == 403

    # 3. Farmer Group Admin (Kelompok Tani) adds a farm plot -> 201 Created with status='pending'
    farm_payload["farm_code"] = "BN-FARM-POKTAN-01"
    farm_payload["name"] = "Kebun Pengajuan Poktan"
    poktan_res = await client.post(
        "/api/v1/farms",
        headers={"Authorization": f"Bearer {ketua_token}"},
        json=farm_payload,
    )
    assert poktan_res.status_code == 201
    farm_data = poktan_res.json()
    assert farm_data["verification_status"] == "pending"
    farm_id = farm_data["id"]

    # 4. Farmer Group Admin cannot approve their own farm plot -> 403 Forbidden!
    unauthorized_verify = await client.patch(
        f"/api/v1/farms/{farm_id}/verification",
        headers={"Authorization": f"Bearer {ketua_token}"},
        json={"verification_status": "verified", "notes": "Setujui sendiri"},
    )
    assert unauthorized_verify.status_code == 403

    # 5. Village Officer (Petugas Kantor Desa) approves the plot -> 200 OK with status='verified'
    officer_verify = await client.patch(
        f"/api/v1/farms/{farm_id}/verification",
        headers={"Authorization": f"Bearer {petugas_token}"},
        json={"verification_status": "verified", "notes": "Disetujui kantor desa"},
    )
    assert officer_verify.status_code == 200
    assert officer_verify.json()["verification_status"] == "verified"

    # 6. Regular farmer can view the verified plot on GeoJSON
    geojson_res = await client.get(
        "/api/v1/farms/geojson/all",
        headers={"Authorization": f"Bearer {petani_token}"},
    )
    assert geojson_res.status_code == 200
    features = geojson_res.json()["features"]
    created_feature = next((f for f in features if f["id"] == farm_id), None)
    assert created_feature is not None
    assert created_feature["properties"]["verification_status"] == "verified"


@pytest.mark.asyncio
async def test_spatial_polygon_boundary_and_overlap_validation(client: AsyncClient):
    token = await get_admin_token(client)

    # 1. Setup group & farmer
    grp_res = await client.post(
        "/api/v1/farmers/groups",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "Poktan Pala Spasial Banda"},
    )
    group_id = grp_res.json()["id"]

    frm_res = await client.post(
        "/api/v1/farmers",
        headers={"Authorization": f"Bearer {token}"},
        json={"farmer_code": "BN-FRM-SP01", "name": "Pak Ali Spasial", "farmer_group_id": group_id},
    )
    farmer_id = frm_res.json()["id"]

    # 2. Polygon 1: Kebun Pala Lonthoir (100m x 100m)
    # lon, lat: 129.8970, -4.5310
    poly1 = {
        "type": "Polygon",
        "coordinates": [
            [
                [129.8970, -4.5310],
                [129.8979, -4.5310],
                [129.8979, -4.5301],
                [129.8970, -4.5301],
                [129.8970, -4.5310],
            ]
        ],
    }

    # Register farm 1 with area_sqm=0 -> should auto-calculate geodesic area
    farm1_res = await client.post(
        "/api/v1/farms",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "farmer_id": farmer_id,
            "farm_code": "BN-FARM-SP01",
            "name": "Kebun Pala Spasial Lonthoir",
            "latitude": -4.5310,
            "longitude": 129.8970,
            "area_sqm": 0.0,
            "primary_commodity": "Pala",
            "polygon_boundary_geojson": poly1,
        },
    )
    assert farm1_res.status_code == 201
    f1_data = farm1_res.json()
    assert f1_data["area_sqm"] > 9000.0  # Approx 9980 m²

    # 3. Test validate-boundary endpoint with invalid geometry (<4 coords)
    invalid_poly = {
        "type": "Polygon",
        "coordinates": [[[129.8970, -4.5310], [129.8979, -4.5310]]],
    }
    val_inv = await client.post(
        "/api/v1/farms/validate-boundary",
        headers={"Authorization": f"Bearer {token}"},
        json={"polygon_boundary_geojson": invalid_poly},
    )
    assert val_inv.status_code == 200
    assert val_inv.json()["is_valid"] is False

    # 4. Polygon 2 overlapping Polygon 1
    poly_overlap = {
        "type": "Polygon",
        "coordinates": [
            [
                [129.8975, -4.5315],
                [129.8985, -4.5315],
                [129.8985, -4.5305],
                [129.8975, -4.5305],
                [129.8975, -4.5315],
            ]
        ],
    }

    # Pre-check via validate-boundary
    val_over = await client.post(
        "/api/v1/farms/validate-boundary",
        headers={"Authorization": f"Bearer {token}"},
        json={"polygon_boundary_geojson": poly_overlap},
    )
    assert val_over.status_code == 200
    assert val_over.json()["is_valid"] is True
    assert val_over.json()["has_overlap"] is True
    assert val_over.json()["overlapping_farm_code"] == "BN-FARM-SP01"

    # Attempt to create farm with overlapping boundary -> 409 Conflict!
    fail_res = await client.post(
        "/api/v1/farms",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "farmer_id": farmer_id,
            "farm_code": "BN-FARM-SP02",
            "name": "Kebun Tumpang Tindih",
            "latitude": -4.5315,
            "longitude": 129.8975,
            "area_sqm": 0.0,
            "primary_commodity": "Cengkih",
            "polygon_boundary_geojson": poly_overlap,
        },
    )
    assert fail_res.status_code == 409
    assert "bertubrukan (overlap)" in fail_res.json()["detail"]

    # 5. Polygon 3: Non-overlapping (Pulau Ay: lon 129.8300, lat -4.5200)
    poly_ok = {
        "type": "Polygon",
        "coordinates": [
            [
                [129.8300, -4.5200],
                [129.8310, -4.5200],
                [129.8310, -4.5190],
                [129.8300, -4.5190],
                [129.8300, -4.5200],
            ]
        ],
    }

    val_ok = await client.post(
        "/api/v1/farms/validate-boundary",
        headers={"Authorization": f"Bearer {token}"},
        json={"polygon_boundary_geojson": poly_ok},
    )
    assert val_ok.status_code == 200
    assert val_ok.json()["is_valid"] is True
    assert val_ok.json()["has_overlap"] is False

    # Create non-overlapping farm -> 201 Created!
    ok_res = await client.post(
        "/api/v1/farms",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "farmer_id": farmer_id,
            "farm_code": "BN-FARM-SP03",
            "name": "Kebun Pala Pulau Ay",
            "latitude": -4.5200,
            "longitude": 129.8300,
            "area_sqm": 0.0,
            "primary_commodity": "Pala",
            "polygon_boundary_geojson": poly_ok,
        },
    )
    assert ok_res.status_code == 201
    assert ok_res.json()["area_sqm"] > 9000.0

