"""create iot_telemetry_logs table

Revision ID: 007_iot_telemetry
Revises: 006_koperasi_and_water
Create Date: 2026-11-11 23:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '007_iot_telemetry'
down_revision: Union[str, None] = '006_koperasi_and_water'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'iot_telemetry_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('station_code', sa.String(length=50), nullable=False),
        sa.Column('station_name', sa.String(length=150), nullable=False),
        sa.Column('island_name', sa.String(length=100), nullable=False),
        sa.Column('raw_water_tds_ppm', sa.Float(), server_default='2400.0', nullable=False),
        sa.Column('filtered_water_tds_ppm', sa.Float(), server_default='58.5', nullable=False),
        sa.Column('clean_tank_level_pct', sa.Float(), server_default='85.0', nullable=False),
        sa.Column('daily_dispensed_liters', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('valve_status', sa.String(length=20), server_default='CLOSED', nullable=False),
        sa.Column('active_power_source', sa.String(length=50), server_default='SOLAR_DIRECT_GRAVITY', nullable=False),
        sa.Column('solar_panel_voltage_v', sa.Float(), server_default='26.4', nullable=False),
        sa.Column('solar_current_a', sa.Float(), server_default='8.2', nullable=False),
        sa.Column('power_watt', sa.Float(), server_default='216.48', nullable=False),
        sa.Column('battery_soc_pct', sa.Float(), server_default='92.0', nullable=False),
        sa.Column('alert_level', sa.String(length=20), server_default='NORMAL', nullable=False),
        sa.Column('alert_message', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_index('ix_iot_telemetry_logs_station_code', 'iot_telemetry_logs', ['station_code'])
    op.create_index('ix_iot_telemetry_logs_created_at', 'iot_telemetry_logs', ['created_at'])


def downgrade() -> None:
    op.drop_index('ix_iot_telemetry_logs_created_at', table_name='iot_telemetry_logs')
    op.drop_index('ix_iot_telemetry_logs_station_code', table_name='iot_telemetry_logs')
    op.drop_table('iot_telemetry_logs')
