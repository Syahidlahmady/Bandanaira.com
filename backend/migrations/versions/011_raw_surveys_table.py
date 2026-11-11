"""create raw_surveys table for dynamic field surveys and ETL pipeline

Revision ID: 011_raw_surveys_table
Revises: 010_nik_crypto_hardening
Create Date: 2026-11-12 00:35:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '011_raw_surveys_table'
down_revision: Union[str, None] = '010_nik_crypto_hardening'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'raw_surveys',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('survey_code', sa.String(length=30), nullable=False),
        sa.Column('collector_name', sa.String(length=120), nullable=False),
        sa.Column('problem_domain', sa.String(length=40), nullable=False),
        sa.Column('island_name', sa.String(length=50), nullable=False),
        sa.Column('village_name', sa.String(length=100), nullable=True),
        sa.Column('rt_rw', sa.String(length=30), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('urgency_level', sa.String(length=20), server_default='SEDANG', nullable=False),
        sa.Column('flexible_attributes', sa.JSON(), nullable=True),
        sa.Column('photo_evidence_url', sa.String(length=255), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('etl_status', sa.String(length=30), server_default='PENDING', nullable=False),
        sa.Column('migrated_feature_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('spatial_features.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_index(op.f('ix_raw_surveys_survey_code'), 'raw_surveys', ['survey_code'], unique=True)
    op.create_index(op.f('ix_raw_surveys_problem_domain'), 'raw_surveys', ['problem_domain'], unique=False)
    op.create_index(op.f('ix_raw_surveys_island_name'), 'raw_surveys', ['island_name'], unique=False)
    op.create_index(op.f('ix_raw_surveys_etl_status'), 'raw_surveys', ['etl_status'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_raw_surveys_etl_status'), table_name='raw_surveys')
    op.drop_index(op.f('ix_raw_surveys_island_name'), table_name='raw_surveys')
    op.drop_index(op.f('ix_raw_surveys_problem_domain'), table_name='raw_surveys')
    op.drop_index(op.f('ix_raw_surveys_survey_code'), table_name='raw_surveys')
    op.drop_table('raw_surveys')
