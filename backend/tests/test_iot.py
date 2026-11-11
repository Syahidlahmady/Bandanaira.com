import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_ingest_iot_telemetry_normal(client: AsyncClient):
    """Uji penerimaan paket sensor normal (TDS < 100, tandon > 40%, baterai > 50%)."""
    payload = {
        "station_code": "RO-STATION-LONTHOIR-01",
        "station_name": "Stasiun BWRO Lonthoir",
        "island_name": "Banda Besar",
        "water_metrics": {
            "raw_water_tds_ppm": 2400.0,
            "filtered_water_tds_ppm": 55.0,
            "clean_tank_level_pct": 88.0,
            "daily_dispensed_liters": 150.0,
            "valve_status": "CLOSED",
        },
        "energy_metrics": {
            "active_source": "SOLAR_DIRECT_GRAVITY",
            "solar_panel_voltage_v": 26.5,
            "solar_current_a": 9.0,
            "battery_soc_pct": 95.0,
        },
    }

    res = await client.post("/api/v1/iot/telemetri", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["station_code"] == "RO-STATION-LONTHOIR-01"
    assert data["filtered_water_tds_ppm"] == 55.0
    assert data["power_watt"] == 238.5  # 26.5 * 9.0
    assert data["alert_level"] == "NORMAL"


@pytest.mark.asyncio
async def test_ingest_iot_telemetry_critical_tds_alert(client: AsyncClient):
    """Uji deteksi anomali kritis: Membran bocor (TDS > 250 ppm)."""
    payload = {
        "station_code": "RO-STATION-NEIRA-PELABUHAN",
        "water_metrics": {
            "raw_water_tds_ppm": 2100.0,
            "filtered_water_tds_ppm": 310.0,  # Membran jebol!
            "clean_tank_level_pct": 60.0,
            "daily_dispensed_liters": 80.0,
            "valve_status": "CLOSED",
        },
        "energy_metrics": {
            "active_source": "SOLAR_DIRECT_GRAVITY",
            "solar_panel_voltage_v": 24.0,
            "solar_current_a": 5.0,
            "battery_soc_pct": 80.0,
        },
    }

    res = await client.post("/api/v1/iot/telemetri", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["alert_level"] == "CRITICAL"
    assert "Membran RO rusak" in data["alert_message"]


@pytest.mark.asyncio
async def test_ingest_iot_telemetry_critical_tank_alert(client: AsyncClient):
    """Uji deteksi tandon air bersih kritis (< 20%)."""
    payload = {
        "station_code": "RO-STATION-HATTA-MASJID",
        "water_metrics": {
            "raw_water_tds_ppm": 2700.0,
            "filtered_water_tds_ppm": 60.0,
            "clean_tank_level_pct": 12.0,  # Kritis!
            "daily_dispensed_liters": 450.0,
            "valve_status": "OPEN",
        },
        "energy_metrics": {
            "active_source": "DIESEL_GRID",
            "solar_panel_voltage_v": 0.0,
            "solar_current_a": 0.0,
            "battery_soc_pct": 30.0,
        },
    }

    res = await client.post("/api/v1/iot/telemetri", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["alert_level"] == "CRITICAL"
    assert "tandon air bersih kritis" in data["alert_message"]


@pytest.mark.asyncio
async def test_get_latest_station_status(client: AsyncClient):
    """Uji pembacaan status 4 stasiun pulau."""
    res = await client.get("/api/v1/iot/telemetri/terkini")
    assert res.status_code == 200
    stations = res.json()
    assert len(stations) == 4
    station_codes = [s["station_code"] for s in stations]
    assert "RO-STATION-LONTHOIR-01" in station_codes
    assert "RO-STATION-AY-CENTRAL" in station_codes


@pytest.mark.asyncio
async def test_simulate_pulse_and_resiliency_summary(client: AsyncClient):
    """Uji simulator pengiriman gelombang sensor dan rekap resiliensi pulau."""
    # 1. Trigger simulated pulse
    res_pulse = await client.post("/api/v1/iot/simulate-pulse")
    assert res_pulse.status_code == 201
    pulses = res_pulse.json()
    assert len(pulses) == 4

    # 2. Cek histori telemetri
    res_hist = await client.get("/api/v1/iot/telemetri/riwayat?limit=10")
    assert res_hist.status_code == 200
    hist = res_hist.json()
    assert len(hist) >= 4

    # 3. Cek Ringkasan Resiliensi Pulau
    res_summary = await client.get("/api/v1/iot/resiliency-summary")
    assert res_summary.status_code == 200
    summary = res_summary.json()
    assert summary["total_active_stations"] == 4
    assert summary["avg_island_water_tds_ppm"] > 0
    assert summary["solar_energy_ratio_pct"] > 50.0
    assert summary["estimated_diesel_fuel_saved_liters"] >= 0
    assert summary["island_readiness_status"] in ("OPTIMAL", "WASPADA", "KRITIS")
