from typing import Optional
from sqlalchemy import (
    String,
    Float,
    DateTime,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column
from backend.app.database.base import Base, TimestampMixin


class IoTTelemetryLog(Base, TimestampMixin):
    """
    Log data sensor telemetri perangkat keras IoT (ESP32) stasiun air RO & energi pulau.
    Memantau parameter sensor kualitas air (TDS BWRO/SWRO), ketinggian tandon, dan bauran daya surya vs diesel.
    """
    __tablename__ = "iot_telemetry_logs"

    station_code: Mapped[str] = mapped_column(
        String(50), index=True, nullable=False
    )
    station_name: Mapped[str] = mapped_column(
        String(150), nullable=False
    )
    island_name: Mapped[str] = mapped_column(
        String(100), nullable=False
    )

    # Water Metrics
    raw_water_tds_ppm: Mapped[float] = mapped_column(
        Float, default=2400.0, nullable=False
    )
    filtered_water_tds_ppm: Mapped[float] = mapped_column(
        Float, default=58.5, nullable=False
    )
    clean_tank_level_pct: Mapped[float] = mapped_column(
        Float, default=85.0, nullable=False
    )
    daily_dispensed_liters: Mapped[float] = mapped_column(
        Float, default=0.0, nullable=False
    )
    valve_status: Mapped[str] = mapped_column(
        String(20), default="CLOSED", nullable=False
    )

    # Energy Metrics
    active_power_source: Mapped[str] = mapped_column(
        String(50), default="SOLAR_DIRECT_GRAVITY", nullable=False
    )
    solar_panel_voltage_v: Mapped[float] = mapped_column(
        Float, default=26.4, nullable=False
    )
    solar_current_a: Mapped[float] = mapped_column(
        Float, default=8.2, nullable=False
    )
    power_watt: Mapped[float] = mapped_column(
        Float, default=216.48, nullable=False
    )
    battery_soc_pct: Mapped[float] = mapped_column(
        Float, default=92.0, nullable=False
    )

    # Operational Alerts
    alert_level: Mapped[str] = mapped_column(
        String(20), default="NORMAL", nullable=False
    )
    alert_message: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True
    )
