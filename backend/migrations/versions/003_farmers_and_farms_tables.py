"""create farmer_groups, farmers, and farms tables

Revision ID: 003_farmers_and_farms_tables
Revises: 002_population_and_audit_tables
Create Date: 2026-11-04 21:26:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '003_farmers_and_farms_tables'
down_revision: Union[str, None] = '002_population_and_audit_tables'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Farmer Groups table
    op.create_table(
        'farmer_groups',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('leader_name', sa.String(length=255), nullable=True),
        sa.Column('village', sa.String(length=100), nullable=False, server_default='Banda Neira'),
        sa.Column('contact_number', sa.String(length=20), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_index(op.f('ix_farmer_groups_name'), 'farmer_groups', ['name'], unique=True)

    # 2. Farmers table
    op.create_table(
        'farmers',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('farmer_code', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='active'),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('resident_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('residents.id', ondelete='SET NULL'), nullable=True),
        sa.Column('farmer_group_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('farmer_groups.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_index(op.f('ix_farmers_farmer_code'), 'farmers', ['farmer_code'], unique=True)
    op.create_index(op.f('ix_farmers_name'), 'farmers', ['name'], unique=False)

    # 3. Farms table
    op.create_table(
        'farms',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('farmer_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('farmers.id', ondelete='CASCADE'), nullable=False),
        sa.Column('farm_code', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('location_description', sa.Text(), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('polygon_boundary_geojson', sa.JSON(), nullable=True),
        sa.Column('area_sqm', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('primary_commodity', sa.String(length=100), nullable=False),
        sa.Column('verification_status', sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_index(op.f('ix_farms_farm_code'), 'farms', ['farm_code'], unique=True)
    op.create_index(op.f('ix_farms_name'), 'farms', ['name'], unique=False)
    op.create_index(op.f('ix_farms_primary_commodity'), 'farms', ['primary_commodity'], unique=False)
    op.create_index(op.f('ix_farms_farmer_id'), 'farms', ['farmer_id'], unique=False)


def downgrade() -> None:
    op.drop_table('farms')
    op.drop_table('farmers')
    op.drop_table('farmer_groups')
