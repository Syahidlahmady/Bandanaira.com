import random
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, desc, func
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.database.session import get_db
from backend.app.modules.iot.models import IoTTelemetryLog
from backend.app.modules.iot.schemas import (
    IoTTelemetryPacketInput,
    IoTTelemetryItemResponse,
    IoTStationStatus,
    IoTIslandResiliencySummary,
)

router = APIRouter(prefix="/iot", tags=["IoT Telemetri & Ketahanan Pulau"])

DEFAULT_STATIONS = {
    "RO-STATION-LONTHOIR-01": {
        "name": "Stasiun BWRO Lonthoir (Perkebunan Pala)",
        "island": "Banda Besar (Lonthoir)",
        "base_raw_tds": 2400.0,
        "base_filtered_tds": 52.0,
        "tank_pct": 88.0,
        "daily_dispensed": 340.0,
        "power_source": "SOLAR_DIRECT_GRAVITY",
        "power_watt": 380.0,
        "battery_soc": 94.0,
    },
    "RO-STATION-NEIRA-PELABUHAN": {
        "name": "Dispenser Pelabuhan Banda Neira",
        "island": "Pulau Neira",
        "base_raw_tds": 1850.0,
        "base_filtered_tds": 45.0,
        "tank_pct": 92.0,
        "daily_dispensed": 620.0,
        "power_source": "SOLAR_DIRECT_GRAVITY",
        "power_watt": 420.0,
        "battery_soc": 89.0,
    },
    "RO-STATION-HATTA-MASJID": {
        "name": "Kiosk Air Bersih Masjid Hatta",
        "island": "Pulau Hatta",
        "base_raw_tds": 2800.0,
        "base_filtered_tds": 65.0,
        "tank_pct": 76.0,
        "daily_dispensed": 210.0,
        "power_source": "SOLAR_DIRECT_GRAVITY",
        "power_watt": 280.0,
        "battery_soc": 82.0,
    },
    "RO-STATION-AY-CENTRAL": {
        "name": "Stasiun SWRO Pulau Ay Terpadu",
        "island": "Pulau Ay",
        "base_raw_tds": 3200.0,
        "base_filtered_tds": 72.0,
        "tank_pct": 81.0,
        "daily_dispensed": 280.0,
        "power_source": "HYBRID_BATTERY",
        "power_watt": 350.0,
        "battery_soc": 78.0,
    },
}


def evaluate_telemetry_alerts(
    filtered_tds: float, tank_pct: float, battery_soc: float, power_source: str
) -> tuple[str, str]:
    """Evaluasi aturan ambang batas sensor resiliensi pulau."""
    if filtered_tds > 250.0:
        return "CRITICAL", f"Kadar TDS air minum bahaya tinggi ({filtered_tds:.1f} ppm)! Membran RO rusak/bocor."
    if clean_tank_level_critical := (tank_pct < 20.0):
        return "CRITICAL", f"Cadangan tandon air bersih kritis ({tank_pct:.1f}%). Aktifkan pompa desalinasi darurat."
    if filtered_tds > 100.0:
        return "WARNING", f"Kadar TDS ({filtered_tds:.1f} ppm) di atas rekomendasi air minum (<100 ppm). Lakukan pembersihan membran."
    if tank_pct < 40.0:
        return "WARNING", f"Cadangan tandon air menipis ({tank_pct:.1f}%)."
    if battery_soc < 25.0 and power_source != "DIESEL_GRID":
        return "WARNING", f"Baterai surya rendah ({battery_soc:.1f}%). Siagakan genset PLTD pendukung."
    return "NORMAL", "Semua indikator kualitas air dan bauran energi beroperasi optimal."


@router.post(
    "/telemetri",
    response_model=IoTTelemetryItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest Telemetri Sensor ESP32 (TDS Air, Tandon & Daya Surya/Diesel)",
)
async def ingest_iot_telemetry(
    packet: IoTTelemetryPacketInput,
    db: AsyncSession = Depends(get_db),
):
    """
    Endpoint penerimaan paket telemetri berkala dari mikrokontroler ESP32 di stasiun pengolahan air & energi desa.
    Memeriksa ambang batas anomali dan menyimpan log histori.
    """
    code = packet.station_code
    default_meta = DEFAULT_STATIONS.get(code, {})

    name = packet.station_name or default_meta.get("name", f"Stasiun IoT {code}")
    island = packet.island_name or default_meta.get("island", "Kepulauan Banda")

    w = packet.water_metrics
    e = packet.energy_metrics

    # Hitung daya watt jika belum dihitung
    watt = e.power_watt
    if watt is None:
        watt = round(e.solar_panel_voltage_v * e.solar_current_a, 2)

    alert_lvl, alert_msg = evaluate_telemetry_alerts(
        w.filtered_water_tds_ppm, w.clean_tank_level_pct, e.battery_soc_pct, e.active_source
    )

    log_entry = IoTTelemetryLog(
        station_code=code,
        station_name=name,
        island_name=island,
        raw_water_tds_ppm=w.raw_water_tds_ppm,
        filtered_water_tds_ppm=w.filtered_water_tds_ppm,
        clean_tank_level_pct=w.clean_tank_level_pct,
        daily_dispensed_liters=w.daily_dispensed_liters,
        valve_status=w.valve_status.upper(),
        active_power_source=e.active_source.upper(),
        solar_panel_voltage_v=e.solar_panel_voltage_v,
        solar_current_a=e.solar_current_a,
        power_watt=watt,
        battery_soc_pct=e.battery_soc_pct,
        alert_level=alert_lvl,
        alert_message=alert_msg,
    )

    db.add(log_entry)
    await db.commit()
    await db.refresh(log_entry)

    return IoTTelemetryItemResponse(
        id=str(log_entry.id),
        station_code=log_entry.station_code,
        station_name=log_entry.station_name,
        island_name=log_entry.island_name,
        raw_water_tds_ppm=log_entry.raw_water_tds_ppm,
        filtered_water_tds_ppm=log_entry.filtered_water_tds_ppm,
        clean_tank_level_pct=log_entry.clean_tank_level_pct,
        daily_dispensed_liters=log_entry.daily_dispensed_liters,
        valve_status=log_entry.valve_status,
        active_power_source=log_entry.active_power_source,
        solar_panel_voltage_v=log_entry.solar_panel_voltage_v,
        solar_current_a=log_entry.solar_current_a,
        power_watt=log_entry.power_watt,
        battery_soc_pct=log_entry.battery_soc_pct,
        alert_level=log_entry.alert_level,
        alert_message=log_entry.alert_message,
        created_at=log_entry.created_at,
    )


@router.get(
    "/telemetri/terkini",
    response_model=List[IoTStationStatus],
    summary="Status Sensor Terkini Seluruh Stasiun Pulau (Real-Time HUD)",
)
async def get_latest_station_status(
    db: AsyncSession = Depends(get_db),
):
    """
    Mengambil snapshot data telemetri paling mutakhir untuk setiap stasiun air dan energi di kepulauan.
    Jika basis data masih kosong, menghasilkan data referensi baseline awal.
    """
    results: List[IoTStationStatus] = []

    for code, meta in DEFAULT_STATIONS.items():
        stmt = (
            select(IoTTelemetryLog)
            .where(IoTTelemetryLog.station_code == code)
            .order_by(desc(IoTTelemetryLog.created_at))
            .limit(1)
        )
        res = await db.execute(stmt)
        latest = res.scalar_one_or_none()

        if latest:
            results.append(
                IoTStationStatus(
                    station_code=latest.station_code,
                    station_name=latest.station_name,
                    island_name=latest.island_name,
                    raw_water_tds_ppm=latest.raw_water_tds_ppm,
                    filtered_water_tds_ppm=latest.filtered_water_tds_ppm,
                    clean_tank_level_pct=latest.clean_tank_level_pct,
                    daily_dispensed_liters=latest.daily_dispensed_liters,
                    valve_status=latest.valve_status,
                    active_power_source=latest.active_power_source,
                    power_watt=latest.power_watt,
                    battery_soc_pct=latest.battery_soc_pct,
                    alert_level=latest.alert_level,
                    alert_message=latest.alert_message,
                    last_heartbeat=latest.created_at,
                )
            )
        else:
            # Baseline jika stasiun belum mengirim paket sensor
            alert_lvl, alert_msg = evaluate_telemetry_alerts(
                meta["base_filtered_tds"], meta["tank_pct"], meta["battery_soc"], meta["power_source"]
            )
            results.append(
                IoTStationStatus(
                    station_code=code,
                    station_name=meta["name"],
                    island_name=meta["island"],
                    raw_water_tds_ppm=meta["base_raw_tds"],
                    filtered_water_tds_ppm=meta["base_filtered_tds"],
                    clean_tank_level_pct=meta["tank_pct"],
                    daily_dispensed_liters=meta["daily_dispensed"],
                    valve_status="CLOSED",
                    active_power_source=meta["power_source"],
                    power_watt=meta["power_watt"],
                    battery_soc_pct=meta["battery_soc"],
                    alert_level=alert_lvl,
                    alert_message=alert_msg,
                    last_heartbeat=datetime.now(timezone.utc),
                )
            )

    return results


@router.get(
    "/telemetri/riwayat",
    response_model=List[IoTTelemetryItemResponse],
    summary="Riwayat Time-Series Telemetri Sensor untuk Visualisasi Tren",
)
async def get_telemetry_history(
    station_code: Optional[str] = Query(None, description="Filter stasiun tertentu"),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    """Mengambil riwayat pembacaan sensor time-series untuk grafik analitik."""
    query = select(IoTTelemetryLog).order_by(desc(IoTTelemetryLog.created_at)).limit(limit)
    if station_code:
        query = query.where(IoTTelemetryLog.station_code == station_code)

    res = await db.execute(query)
    logs = res.scalars().all()

    return [
        IoTTelemetryItemResponse(
            id=str(log.id),
            station_code=log.station_code,
            station_name=log.station_name,
            island_name=log.island_name,
            raw_water_tds_ppm=log.raw_water_tds_ppm,
            filtered_water_tds_ppm=log.filtered_water_tds_ppm,
            clean_tank_level_pct=log.clean_tank_level_pct,
            daily_dispensed_liters=log.daily_dispensed_liters,
            valve_status=log.valve_status,
            active_power_source=log.active_power_source,
            solar_panel_voltage_v=log.solar_panel_voltage_v,
            solar_current_a=log.solar_current_a,
            power_watt=log.power_watt,
            battery_soc_pct=log.battery_soc_pct,
            alert_level=log.alert_level,
            alert_message=log.alert_message,
            created_at=log.created_at,
        )
        for log in logs
    ]


@router.get(
    "/resiliency-summary",
    response_model=IoTIslandResiliencySummary,
    summary="Ringkasan Ketahanan Pulau (Indikator Air RO, Bauran Surya & Penghematan BBM)",
)
async def get_island_resiliency_summary(
    db: AsyncSession = Depends(get_db),
):
    """
    Menghitung agregat ketahanan pulau (Island Resiliency Score):
    Total air minum terdistribusi, rata-rata kemurnian TDS, cadangan tandon, dan penghematan BBM solar PLTD.
    """
    stations = await get_latest_station_status(db)

    total_stations = len(stations)
    total_dispensed = sum(s.daily_dispensed_liters for s in stations)
    avg_tds = sum(s.filtered_water_tds_ppm for s in stations) / max(total_stations, 1)
    avg_tank = sum(s.clean_tank_level_pct for s in stations) / max(total_stations, 1)

    solar_stations = [s for s in stations if "SOLAR" in s.active_power_source or "HYBRID" in s.active_power_source]
    solar_ratio = (len(solar_stations) / max(total_stations, 1)) * 100.0

    # Estimasi penghematan BBM solar PLTD: ~0.35 Liter bbm diesel per kWh daya surya yang dibangkitkan
    # Total watt gabungan * 8 jam efektif / 1000 * 0.35
    total_watts = sum(s.power_watt for s in stations)
    kwh_today = (total_watts * 8.0) / 1000.0
    diesel_saved = round(kwh_today * 0.35, 1)

    active_alerts = len([s for s in stations if s.alert_level in ("WARNING", "CRITICAL")])

    if any(s.alert_level == "CRITICAL" for s in stations):
        status_kritis = "KRITIS"
    elif active_alerts > 0:
        status_kritis = "WASPADA"
    else:
        status_kritis = "OPTIMAL"

    return IoTIslandResiliencySummary(
        total_active_stations=total_stations,
        total_clean_water_dispensed_today_ltr=round(total_dispensed, 1),
        avg_island_water_tds_ppm=round(avg_tds, 1),
        avg_tank_reserve_pct=round(avg_tank, 1),
        solar_energy_ratio_pct=round(solar_ratio, 1),
        estimated_diesel_fuel_saved_liters=diesel_saved,
        active_alerts_count=active_alerts,
        island_readiness_status=status_kritis,
        stations=stations,
    )


@router.post(
    "/simulate-pulse",
    response_model=List[IoTTelemetryItemResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Simulator Hardware: Kirim Gelombang Telemetri 4 Stasiun Sekaligus",
)
async def simulate_hardware_telemetry_pulse(
    db: AsyncSession = Depends(get_db),
):
    """
    Menyuntikkan paket pembacaan sensor dinamis dengan fluktuasi alami (tegangan surya, arus, TDS, tandon)
    untuk mendemonstrasikan sistem IoT secara live tanpa menunggu hardware fisik.
    """
    created_entries: List[IoTTelemetryItemResponse] = []

    for code, meta in DEFAULT_STATIONS.items():
        # Variasi acak realistis
        tds_fluctuation = random.uniform(-3.5, 3.5)
        filtered_tds = max(25.0, round(meta["base_filtered_tds"] + tds_fluctuation, 1))

        tank_delta = random.uniform(-1.5, 1.0)
        tank_pct = min(100.0, max(15.0, round(meta["tank_pct"] + tank_delta, 1)))

        volt = round(random.uniform(24.5, 27.5), 1)
        amp = round(random.uniform(6.5, 12.0), 1)
        watts = round(volt * amp, 1)
        soc = min(100.0, max(50.0, round(meta["battery_soc"] + random.uniform(-2.0, 1.5), 1)))

        dispensed = round(meta["daily_dispensed"] + random.uniform(5.0, 25.0), 1)

        alert_lvl, alert_msg = evaluate_telemetry_alerts(filtered_tds, tank_pct, soc, meta["power_source"])

        entry = IoTTelemetryLog(
            station_code=code,
            station_name=meta["name"],
            island_name=meta["island"],
            raw_water_tds_ppm=meta["base_raw_tds"],
            filtered_water_tds_ppm=filtered_tds,
            clean_tank_level_pct=tank_pct,
            daily_dispensed_liters=dispensed,
            valve_status="CLOSED",
            active_power_source=meta["power_source"],
            solar_panel_voltage_v=volt,
            solar_current_a=amp,
            power_watt=watts,
            battery_soc_pct=soc,
            alert_level=alert_lvl,
            alert_message=alert_msg,
        )
        db.add(entry)
        await db.flush()

        created_entries.append(
            IoTTelemetryItemResponse(
                id=str(entry.id),
                station_code=entry.station_code,
                station_name=entry.station_name,
                island_name=entry.island_name,
                raw_water_tds_ppm=entry.raw_water_tds_ppm,
                filtered_water_tds_ppm=entry.filtered_water_tds_ppm,
                clean_tank_level_pct=entry.clean_tank_level_pct,
                daily_dispensed_liters=entry.daily_dispensed_liters,
                valve_status=entry.valve_status,
                active_power_source=entry.active_power_source,
                solar_panel_voltage_v=entry.solar_panel_voltage_v,
                solar_current_a=entry.solar_current_a,
                power_watt=entry.power_watt,
                battery_soc_pct=entry.battery_soc_pct,
                alert_level=entry.alert_level,
                alert_message=entry.alert_message,
                created_at=entry.created_at or datetime.now(timezone.utc),
            )
        )

    await db.commit()
    return created_entries
