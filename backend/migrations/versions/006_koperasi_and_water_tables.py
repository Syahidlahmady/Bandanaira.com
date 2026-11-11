"""create coop_accounts and coop_transactions tables

Revision ID: 006_koperasi_and_water
Revises: 005_blockchain_transactions
Create Date: 2026-11-11 23:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '006_koperasi_and_water'
down_revision: Union[str, None] = '005_blockchain_transactions'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create coop_accounts table
    op.create_table(
        'coop_accounts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('resident_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('residents.id', ondelete='CASCADE'), nullable=False),
        sa.Column('coop_balance_rp', sa.Numeric(precision=12, scale=2), server_default='0.0', nullable=False),
        sa.Column('plastic_points', sa.Integer(), server_default='0', nullable=False),
        sa.Column('clean_water_quota_ltr', sa.Float(), server_default='20.0', nullable=False),
        sa.Column('total_commodities_kg', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('total_plastic_recycled_kg', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('pin_hash', sa.String(length=128), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.UniqueConstraint('resident_id', name='uq_coop_accounts_resident_id')
    )
    op.create_index('ix_coop_accounts_resident_id', 'coop_accounts', ['resident_id'])

    # 2. Create coop_transactions table
    op.create_table(
        'coop_transactions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('account_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('coop_accounts.id', ondelete='CASCADE'), nullable=False),
        sa.Column('resident_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('residents.id', ondelete='CASCADE'), nullable=False),
        sa.Column('transaction_code', sa.String(length=36), nullable=False),
        sa.Column('transaction_type', sa.String(length=50), nullable=False),
        sa.Column('item_name', sa.String(length=100), nullable=False),
        sa.Column('weight_or_volume', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('unit_price_rp', sa.Numeric(precision=10, scale=2), server_default='0.0', nullable=False),
        sa.Column('monetary_value_rp', sa.Numeric(precision=10, scale=2), server_default='0.0', nullable=False),
        sa.Column('water_quota_impact_ltr', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('destination', sa.String(length=20), server_default='BALANCE', nullable=False),
        sa.Column('receipt_hash', sa.String(length=66), nullable=False),
        sa.Column('station_code', sa.String(length=50), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.UniqueConstraint('transaction_code', name='uq_coop_transactions_code')
    )
    op.create_index('ix_coop_transactions_account_id', 'coop_transactions', ['account_id'])
    op.create_index('ix_coop_transactions_resident_id', 'coop_transactions', ['resident_id'])
    op.create_index('ix_coop_transactions_type', 'coop_transactions', ['transaction_type'])


def downgrade() -> None:
    op.drop_table('coop_transactions')
    op.drop_table('coop_accounts')
