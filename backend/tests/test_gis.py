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
async def test_get_spatial_features_auto_seeds(client: AsyncClient):
    """Memverifikasi bahwa endpoint GIS melakukan auto-seed 28 fitur spasial dan menghasilkan GeoJSON valid."""
    res = await client.get("/api/v1/gis/layers")
    assert res.status_code == 200
    data = res.json()

    assert data["type"] == "FeatureCollection"
    assert "features" in data
    assert data["total_features"] >= 28

    first = data["features"][0]
    assert first["type"] == "Feature"
    assert "id" in first
    assert "geometry" in first
    assert first["geometry"]["type"] in ["Point", "Polygon"]
    assert len(first["geometry"]["coordinates"]) >= 2
    # GeoJSON RFC 7946 coordinates: [longitude, latitude]
    lng, lat = first["geometry"]["coordinates"][0], first["geometry"]["coordinates"][1]
    assert 129.5 <= lng <= 130.5
    assert -5.0 <= lat <= -4.0

    props = first["properties"]
    assert "name" in props
    assert "layer_type" in props
    assert "island_name" in props
    assert "category" in props


@pytest.mark.asyncio
async def test_filter_layers_and_islands(client: AsyncClient):
    """Memverifikasi penyaringan multi-layer dan pulau."""
    # Filter 2 layer
    res = await client.get("/api/v1/gis/layers?layers=LAYER_HERITAGE,LAYER_WATER_INFRA")
    assert res.status_code == 200
    data = res.json()
    for f in data["features"]:
        assert f["properties"]["layer_type"] in ["LAYER_HERITAGE", "LAYER_WATER_INFRA"]

    # Filter Pulau Hatta
    res_hatta = await client.get("/api/v1/gis/layers?island=Pulau+Hatta")
    assert res_hatta.status_code == 200
    data_hatta = res_hatta.json()
    assert len(data_hatta["features"]) >= 3
    for f in data_hatta["features"]:
        assert f["properties"]["island_name"] == "Pulau Hatta"


@pytest.mark.asyncio
async def test_get_gis_layers_metadata(client: AsyncClient):
    """Memverifikasi endpoint metadata 7-layer dan ringkasan resiliensi/publik."""
    res = await client.get("/api/v1/gis/meta")
    assert res.status_code == 200
    meta = res.json()

    assert meta["total_features"] >= 28
    assert meta["public_layers_count"] >= 15
    assert meta["resiliency_layers_count"] >= 8
    assert len(meta["layers"]) == 7

    layer_ids = [l["id"] for l in meta["layers"]]
    assert "LAYER_TOURISM_4A" in layer_ids
    assert "LAYER_HERITAGE" in layer_ids
    assert "LAYER_ACCOMMODATION" in layer_ids
    assert "LAYER_KOPERASI_UMKM" in layer_ids
    assert "LAYER_PUBLIC_SAFETY" in layer_ids
    assert "LAYER_WATER_INFRA" in layer_ids
    assert "LAYER_ENERGY_WASTE" in layer_ids

    assert "Pulau Neira" in meta["available_islands"]
    assert "Pulau Hatta" in meta["available_islands"]


@pytest.mark.asyncio
async def test_get_heritage_by_slug(client: AsyncClient):
    """Memverifikasi pengambilan cagar budaya ber-audio guide via slug (SRS 11)."""
    # Happy path
    res = await client.get("/api/v1/gis/cagar-budaya/benteng-belgica")
    assert res.status_code == 200
    data = res.json()
    assert "Belgica" in data["properties"]["name"]
    assert "audio_url" in data["properties"]

    # Alias SRS 11
    alias_res = await client.get("/api/v1/peta/cagar-budaya/benteng-belgica")
    assert alias_res.status_code == 200

    # 404 for unknown slug
    unknown_res = await client.get("/api/v1/gis/cagar-budaya/candi-prambanan-fiktif")
    assert unknown_res.status_code == 404


@pytest.mark.asyncio
async def test_alias_peta_geojson(client: AsyncClient):
    """Memverifikasi endpoint alias /api/v1/peta/geojson sesuai SRS 10.2 & 11."""
    res = await client.get("/api/v1/peta/geojson")
    assert res.status_code == 200
    data = res.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) >= 28


@pytest.mark.asyncio
async def test_create_spatial_feature_rbac(client: AsyncClient):
    """Memverifikasi otorisasi penambahan fitur spasial baru."""
    admin_token = await get_token(client, "admin", "Admin123!")
    headers = {"Authorization": f"Bearer {admin_token}"}

    payload = {
        "name": "Stasiun Desalinasi Cadangan Lonthoir RT 04",
        "layer_type": "LAYER_WATER_INFRA",
        "category": "resiliensi",
        "island_name": "Banda Besar",
        "latitude": -4.5405,
        "longitude": 129.9055,
        "description": "Tandon bantuan darurat saat musim kemarau.",
        "properties_meta": {
            "live_tds_ppm": 38.0,
            "tank_level_pct": 95.0
        }
    }

    # 1. Unauthorized access
    unauth_res = await client.post("/api/v1/gis/features", json=payload)
    assert unauth_res.status_code in [401, 403]

    # 2. Authorized admin
    auth_res = await client.post("/api/v1/gis/features", json=payload, headers=headers)
    assert auth_res.status_code == 201
    created = auth_res.json()
    assert created["name"] == payload["name"]
    assert created["layer_type"] == payload["layer_type"]

    # 3. Check detail endpoint
    feat_id = created["id"]
    detail_res = await client.get(f"/api/v1/gis/features/{feat_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["id"] == feat_id
