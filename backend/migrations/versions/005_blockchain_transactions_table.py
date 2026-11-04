"""create blockchain_transactions table

Revision ID: 005_blockchain_transactions_table
Revises: 004_harvest_and_traceability_tables
Create Date: 2026-11-04 22:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '005_blockchain_transactions_table'
down_revision: Union[str, None] = '004_harvest_and_traceability_tables'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'blockchain_transactions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('batch_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('product_batches.id', ondelete='CASCADE'), nullable=False),
        sa.Column('event_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('batch_events.id', ondelete='SET NULL'), nullable=True),
        sa.Column('transaction_hash', sa.String(length=66), nullable=True),
        sa.Column('block_number', sa.BigInteger(), nullable=True),
        sa.Column('contract_address', sa.String(length=42), nullable=False),
        sa.Column('data_hash', sa.String(length=66), nullable=False),
        sa.Column('status', sa.String(length=30), server_default='pending', nullable=False),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('confirmed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('ix_blockchain_transactions_batch_id', 'blockchain_transactions', ['batch_id'])
    op.create_index('ix_blockchain_transactions_event_id', 'blockchain_transactions', ['event_id'])
    op.create_index('ix_blockchain_transactions_transaction_hash', 'blockchain_transactions', ['transaction_hash'], unique=True)
    op.create_index('ix_blockchain_transactions_data_hash', 'blockchain_transactions', ['data_hash'])
    op.create_index('ix_blockchain_transactions_status', 'blockchain_transactions', ['status'])


def downgrade() -> None:
    op.drop_index('ix_blockchain_transactions_status', table_name='blockchain_transactions')
    op.drop_index('ix_blockchain_transactions_data_hash', table_name='blockchain_transactions')
    op.drop_index('ix_blockchain_transactions_transaction_hash', table_name='blockchain_transactions')
    op.drop_index('ix_blockchain_transactions_event_id', table_name='blockchain_transactions')
    op.drop_index('ix_blockchain_transactions_batch_id', table_name='blockchain_transactions')
    op.drop_table('blockchain_transactions')
