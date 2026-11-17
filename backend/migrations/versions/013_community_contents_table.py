"""create community_contents table for literary content bank, digital literacy modules, and Pokdarwis/UMKM community works

Revision ID: 013_community_contents_table
Revises: 012_tour_guides_table
Create Date: 2026-11-17 17:55:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '013_community_contents_table'
down_revision: Union[str, None] = '012_tour_guides_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'community_contents',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('content_code', sa.String(length=40), unique=True, index=True, nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('slug', sa.String(length=200), unique=True, index=True, nullable=False),
        sa.Column('content_type', sa.String(length=30), index=True, nullable=False),
        sa.Column('priority_category', sa.String(length=40), index=True, nullable=False),
        sa.Column('island_name', sa.String(length=100), server_default='Pulau Neira', index=True, nullable=False),
        sa.Column('author_name', sa.String(length=150), nullable=False),
        sa.Column('author_role', sa.String(length=100), server_default='Pokdarwis / Komunitas Lokal', nullable=False),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('body_narrative', sa.Text(), nullable=False),
        sa.Column('media_url', sa.String(length=255), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('sop_stage', sa.String(length=30), server_default='PUBLIKASI', nullable=False),
        sa.Column('qc_accuracy', sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column('qc_language', sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column('qc_visual', sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column('qc_adat_ethics', sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column('qc_source_validated', sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column('qc_consent_copyright', sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column('is_published', sa.Boolean(), server_default=sa.true(), index=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('community_contents')
