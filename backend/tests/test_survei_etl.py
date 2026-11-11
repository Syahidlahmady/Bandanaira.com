import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_submit_raw_survey_happy_path(client: AsyncClient):
    """Menguji pengiriman formulir survei dinamis lapangan dengan atribut fleksibel (FR-01)."""
    payload = {
        "collector_name": "Syafa Nailah Mufidah (KKN-PPM UGM)",
        "problem_domain": "AIR_DAN_SAMPAH",
        "island_name": "Pulau Banda Besar",
        "village_name": "Desa Lonthoir",
        "rt_rw": "RT 03 / RW 01",
        "latitude": -4.541200,
        "longitude": 129.901100,
        "title": "Krisis Air Payau & Sumur Galian Warga Lonthoir",
        "urgency_level": "KRITIS",
        "flexible_attributes": {
            "sumber_air_utama": "Tadah hujan dan sumur gali payau",
            "kadar_tds_sumur_ppm": 2650,
            "pengeluaran_beli_air_per_bulan_rp": 300000,
            "timbulan_sampah_botol_plastik_kg": 4.5,
        },
        "notes": "Desakan pembangunan desalinasi BWRO tenaga surya.",
    }

    resp = await client.post("/api/v1/survei/mentah", json=payload)
    assert resp.status_code == 201
    data = resp.json()

    assert "id" in data
    assert data["survey_code"].startswith("SRV-")
    assert data["collector_name"] == payload["collector_name"]
    assert data["problem_domain"] == "AIR_DAN_SAMPAH"
    assert data["island_name"] == "Pulau Banda Besar"
    assert data["urgency_level"] == "KRITIS"
    assert data["etl_status"] == "PENDING"
    assert data["flexible_attributes"]["kadar_tds_sumur_ppm"] == 2650
    assert data["gps_point"]["lat"] == -4.541200
    assert data["gps_point"]["lng"] == 129.901100


@pytest.mark.asyncio
async def test_submit_raw_survey_validation_errors(client: AsyncClient):
    """Menguji penolakan koordinat di luar wilayah kepulauan Maluku/Banda."""
    payload = {
        "collector_name": "Periset Anonim",
        "problem_domain": "AIR_DAN_SAMPAH",
        "island_name": "Pulau Neira",
        "latitude": 51.5074,  # London
        "longitude": -0.1278,
        "title": "Data di Luar Wilayah",
    }
    resp = await client.post("/api/v1/survei/mentah", json=payload)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_seed_sample_and_list_surveys(client: AsyncClient):
    """Menguji penyemaian data survei autentik dan pemfilteran hasil survei."""
    seed_resp = await client.post("/api/v1/survei/seed-sample")
    assert seed_resp.status_code == 200
    assert seed_resp.json()["success"] is True

    # List all
    list_resp = await client.get("/api/v1/survei/mentah")
    assert list_resp.status_code == 200
    items = list_resp.json()
    assert len(items) >= 5

    # Filter by domain
    filter_resp = await client.get("/api/v1/survei/mentah?problem_domain=AIR_DAN_SAMPAH")
    assert filter_resp.status_code == 200
    filtered_items = filter_resp.json()
    assert all(item["problem_domain"] == "AIR_DAN_SAMPAH" for item in filtered_items)


@pytest.mark.asyncio
async def test_execute_etl_pipeline_migration(client: AsyncClient):
    """Menguji eksekusi pipa ETL yang memindahkan data mentah ke tabel spasial PostGIS 7-layer (FR-02)."""
    # 1. Pastikan ada data survei
    await client.post("/api/v1/survei/seed-sample")

    # 2. Jalankan ETL untuk domain AIR_DAN_SAMPAH
    etl_payload = {
        "problem_domain": "AIR_DAN_SAMPAH",
        "auto_promote_spatial": True,
    }
    etl_resp = await client.post("/api/v1/survei/migrasi-etl", json=etl_payload)
    assert etl_resp.status_code == 200
    etl_result = etl_resp.json()

    assert etl_result["success"] is True
    assert etl_result["total_scanned"] >= 1
    # Minimal satu survei berhasil dimigrasi atau sudah pernah dimigrasi
    assert etl_result["migrated_count"] >= 0

    # 3. Verifikasi kueri FeatureCollection GeoJSON di /api/v1/peta/geojson
    geojson_resp = await client.get("/api/v1/peta/geojson?layer_type=LAYER_WATER_INFRA")
    assert geojson_resp.status_code == 200
    fc = geojson_resp.json()
    assert fc["type"] == "FeatureCollection"
    assert len(fc["features"]) > 0


@pytest.mark.asyncio
async def test_survey_stats_endpoint(client: AsyncClient):
    """Menguji ketersediaan metrik ringkasan survei dan status kesiapan ETL."""
    resp = await client.get("/api/v1/survei/stats")
    assert resp.status_code == 200
    data = resp.json()

    assert "total_surveys" in data
    assert "pending_etl" in data
    assert "migrated_to_postgres" in data
    assert "by_domain" in data
    assert "by_urgency" in data
    assert "by_island" in data


@pytest.mark.asyncio
async def test_srs_11_alias_endpoints_penginapan(client: AsyncClient):
    """Menguji alias rute sesuai kontrak SRS BAB XI untuk penginapan dan pemesanan."""
    # GET /api/v1/penginapan
    get_resp = await client.get("/api/v1/penginapan")
    assert get_resp.status_code == 200
    accommodations = get_resp.json()
    assert len(accommodations) > 0
    first_acc_id = accommodations[0]["id"]

    # POST /api/v1/pemesanan
    booking_payload = {
        "accommodation_id": first_acc_id,
        "guest_name": "Dr. Subagyo KKN UGM",
        "guest_whatsapp": "6281298765432",
        "check_in": "2026-12-01",
        "check_out": "2026-12-05",
        "rooms_count": 2,
        "notes": "Mohon disiapkan galon air RO Koperasi Hatta di kamar.",
    }
    booking_resp = await client.post("/api/v1/pemesanan", json=booking_payload)
    assert booking_resp.status_code == 201
    b_data = booking_resp.json()
    assert b_data["booking_code"].startswith("BKG-")
    assert b_data["guest_name"] == "Dr. Subagyo KKN UGM"
    assert "wa.me" in b_data["wa_link"]
