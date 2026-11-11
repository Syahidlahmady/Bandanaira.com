"""create accommodations and bookings tables

Revision ID: 008_tourism_accommodations
Revises: 007_iot_telemetry
Create Date: 2026-11-11 23:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '008_tourism_accommodations'
down_revision: Union[str, None] = '007_iot_telemetry'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create accommodations table
    op.create_table(
        'accommodations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('type', sa.String(length=50), server_default='HOMESTAY', nullable=False),
        sa.Column('island_name', sa.String(length=100), server_default='Pulau Neira', nullable=False),
        sa.Column('address', sa.String(length=255), server_default='Banda Neira, Maluku Tengah', nullable=False),
        sa.Column('price_per_night_rp', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('rooms_available', sa.Integer(), server_default='5', nullable=False),
        sa.Column('has_clean_ro_water', sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column('has_solar_backup', sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column('eco_stay_badge', sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column('contact_whatsapp', sa.String(length=20), server_default='6281234567891', nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('photo_url', sa.String(length=255), nullable=True),
        sa.Column('is_verified', sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_index('ix_accommodations_island_name', 'accommodations', ['island_name'])

    # 2. Create bookings table
    op.create_table(
        'bookings',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('booking_code', sa.String(length=36), nullable=False),
        sa.Column('accommodation_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('accommodations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('guest_name', sa.String(length=150), nullable=False),
        sa.Column('guest_whatsapp', sa.String(length=20), nullable=False),
        sa.Column('guest_email', sa.String(length=100), nullable=True),
        sa.Column('check_in', sa.Date(), nullable=False),
        sa.Column('check_out', sa.Date(), nullable=False),
        sa.Column('total_nights', sa.Integer(), server_default='1', nullable=False),
        sa.Column('rooms_count', sa.Integer(), server_default='1', nullable=False),
        sa.Column('total_price_rp', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('status', sa.String(length=20), server_default='PENDING', nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('wa_link', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.UniqueConstraint('booking_code', name='uq_bookings_booking_code')
    )
    op.create_index('ix_bookings_booking_code', 'bookings', ['booking_code'])
    op.create_index('ix_bookings_accommodation_id', 'bookings', ['accommodation_id'])


def downgrade() -> None:
    op.drop_index('ix_bookings_accommodation_id', table_name='bookings')
    op.drop_index('ix_bookings_booking_code', table_name='bookings')
    op.drop_table('bookings')
    op.drop_index('ix_accommodations_island_name', table_name='accommodations')
    op.drop_table('accommodations')
