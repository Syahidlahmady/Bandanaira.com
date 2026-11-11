"""create spatial_features 7-layer table

Revision ID: 009_gis_spatial_features
Revises: 008_tourism_accommodations
Create Date: 2026-11-12 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '009_gis_spatial_features'
down_revision: Union[str, None] = '008_tourism_accommodations'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'spatial_features',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('layer_type', sa.String(length=50), nullable=False),
        sa.Column('category', sa.String(length=30), server_default='publik', nullable=False),
        sa.Column('island_name', sa.String(length=50), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('geometry_geojson', sa.JSON(), nullable=True),
        sa.Column('properties_meta', sa.JSON(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index(op.f('ix_spatial_features_name'), 'spatial_features', ['name'], unique=False)
    op.create_index(op.f('ix_spatial_features_layer_type'), 'spatial_features', ['layer_type'], unique=False)
    op.create_index(op.f('ix_spatial_features_category'), 'spatial_features', ['category'], unique=False)
    op.create_index(op.f('ix_spatial_features_island_name'), 'spatial_features', ['island_name'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_spatial_features_island_name'), table_name='spatial_features')
    op.drop_index(op.f('ix_spatial_features_category'), table_name='spatial_features')
    op.drop_index(op.f('ix_spatial_features_layer_type'), table_name='spatial_features')
    op.drop_index(op.f('ix_spatial_features_name'), table_name='spatial_features')
    op.drop_table('spatial_features')
