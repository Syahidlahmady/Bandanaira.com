"""add nik_encrypted and nik_blind_index to residents table

Revision ID: 010_nik_crypto_hardening
Revises: 009_gis_spatial_features
Create Date: 2026-11-12 00:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '010_nik_crypto_hardening'
down_revision: Union[str, None] = '009_gis_spatial_features'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('residents', sa.Column('nik_encrypted', sa.Text(), nullable=True))
    op.add_column('residents', sa.Column('nik_blind_index', sa.String(length=64), nullable=True))
    op.create_index(op.f('ix_residents_nik_blind_index'), 'residents', ['nik_blind_index'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_residents_nik_blind_index'), table_name='residents')
    op.drop_column('residents', 'nik_blind_index')
    op.drop_column('residents', 'nik_encrypted')
