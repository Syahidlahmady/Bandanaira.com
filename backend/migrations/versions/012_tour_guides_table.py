"""create tour_guides table for licensed local tourism and heritage guides

Revision ID: 012_tour_guides_table
Revises: 011_raw_surveys_table
Create Date: 2026-11-12 11:25:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '012_tour_guides_table'
down_revision: Union[str, None] = '011_raw_surveys_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'tour_guides',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('license_number', sa.String(length=50), server_default='HPI-BANDA-LOKAL', nullable=False),
        sa.Column('phone_whatsapp', sa.String(length=20), nullable=False),
        sa.Column('specialties', sa.String(length=255), nullable=False),
        sa.Column('languages', sa.String(length=100), server_default='Indonesia, English', nullable=False),
        sa.Column('fee_per_day_rp', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('photo_url', sa.String(length=255), nullable=True),
        sa.Column('bio', sa.Text(), nullable=False),
        sa.Column('island_base', sa.String(length=100), server_default='Pulau Neira', nullable=False),
        sa.Column('is_verified', sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column('rating', sa.Numeric(precision=3, scale=2), server_default='4.9', nullable=False),
        sa.Column('trips_completed', sa.Integer(), server_default='12', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_index('ix_tour_guides_island_base', 'tour_guides', ['island_base'])
    op.create_index('ix_tour_guides_is_verified', 'tour_guides', ['is_verified'])


def downgrade() -> None:
    op.drop_index('ix_tour_guides_is_verified', table_name='tour_guides')
    op.drop_index('ix_tour_guides_island_base', table_name='tour_guides')
    op.drop_table('tour_guides')
