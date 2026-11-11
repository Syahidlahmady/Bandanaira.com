from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class IoTWaterMetricsInput(BaseModel):
    raw_water_tds_ppm: float = Field(default=2400.0, description="Kadar TDS air baku/sumur (ppm)")
    filtered_water_tds_ppm: float = Field(default=58.5, description="Kadar TDS air minum olahan RO (ppm)")
    clean_tank_level_pct: float = Field(default=85.0, ge=0.0, le=100.0, description="Ketinggian tandon air bersih (%)")
    daily_dispensed_liters: float = Field(default=0.0, ge=0.0, description="Volume air terdistribusi hari ini (L)")
    valve_status: str = Field(default="CLOSED", description="Status katup Solenoid: OPEN / CLOSED")


class IoTEnergyMetricsInput(BaseModel):
    active_source: str = Field(
        default="SOLAR_DIRECT_GRAVITY",
        description="Sumber daya aktif: SOLAR_DIRECT_GRAVITY, DIESEL_GRID, HYBRID_BATTERY",
    )
    solar_panel_voltage_v: float = Field(default=26.4, ge=0.0, description="Tegangan panel surya (Volt)")
    solar_current_a: float = Field(default=8.2, ge=0.0, description="Arus panel surya (Ampere)")
    power_watt: Optional[float] = Field(default=None, description="Daya keluaran (Watt). Dihitung otomatis jika kosong.")
    battery_soc_pct: float = Field(default=92.0, ge=0.0, le=100.0, description="State of Charge baterai (%)")


class IoTTelemetryPacketInput(BaseModel):
    station_code: str = Field(..., description="Kode stasiun IoT: misal RO-STATION-LONTHOIR-01")
    station_name: Optional[str] = Field(default=None, description="Nama deskriptif stasiun")
    island_name: Optional[str] = Field(default=None, description="Nama pulau instalasi")
    water_metrics: IoTWaterMetricsInput
    energy_metrics: IoTEnergyMetricsInput


class IoTTelemetryItemResponse(BaseModel):
    id: str
    station_code: str
    station_name: str
    island_name: str
    raw_water_tds_ppm: float
    filtered_water_tds_ppm: float
    clean_tank_level_pct: float
    daily_dispensed_liters: float
    valve_status: str
    active_power_source: str
    solar_panel_voltage_v: float
    solar_current_a: float
    power_watt: float
    battery_soc_pct: float
    alert_level: str
    alert_message: Optional[str] = None
    created_at: datetime


class IoTStationStatus(BaseModel):
    station_code: str
    station_name: str
    island_name: str
    raw_water_tds_ppm: float
    filtered_water_tds_ppm: float
    clean_tank_level_pct: float
    daily_dispensed_liters: float
    valve_status: str
    active_power_source: str
    power_watt: float
    battery_soc_pct: float
    alert_level: str
    alert_message: Optional[str] = None
    last_heartbeat: datetime


class IoTIslandResiliencySummary(BaseModel):
    total_active_stations: int
    total_clean_water_dispensed_today_ltr: float
    avg_island_water_tds_ppm: float
    avg_tank_reserve_pct: float
    solar_energy_ratio_pct: float
    estimated_diesel_fuel_saved_liters: float
    active_alerts_count: int
    island_readiness_status: str
    stations: List[IoTStationStatus]
