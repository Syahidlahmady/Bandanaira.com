"""create harvests, product_batches, batch_harvests, and batch_events tables

Revision ID: 004_harvest_and_traceability_tables
Revises: 003_farmers_and_farms_tables
Create Date: 2026-11-04 21:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '004_harvest_and_traceability_tables'
down_revision: Union[str, None] = '003_farmers_and_farms_tables'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Harvests table
    op.create_table(
        'harvests',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('farm_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('farms.id', ondelete='CASCADE'), nullable=False),
        sa.Column('farmer_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('farmers.id', ondelete='CASCADE'), nullable=False),
        sa.Column('harvest_code', sa.String(length=50), nullable=False),
        sa.Column('commodity', sa.String(length=100), nullable=False),
        sa.Column('harvest_date', sa.Date(), nullable=False),
        sa.Column('quantity_kg', sa.Float(), nullable=False),
        sa.Column('quality_grade', sa.String(length=20), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_index(op.f('ix_harvests_harvest_code'), 'harvests', ['harvest_code'], unique=True)
    op.create_index(op.f('ix_harvests_commodity'), 'harvests', ['commodity'], unique=False)
    op.create_index(op.f('ix_harvests_farm_id'), 'harvests', ['farm_id'], unique=False)
    op.create_index(op.f('ix_harvests_farmer_id'), 'harvests', ['farmer_id'], unique=False)

    # 2. Product Batches table
    op.create_table(
        'product_batches',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('batch_code', sa.String(length=50), nullable=False),
        sa.Column('commodity', sa.String(length=100), nullable=False),
        sa.Column('total_quantity_kg', sa.Float(), nullable=False),
        sa.Column('production_date', sa.Date(), nullable=False),
        sa.Column('public_verification_token', sa.String(length=64), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='created'),
        sa.Column('blockchain_status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_index(op.f('ix_product_batches_batch_code'), 'product_batches', ['batch_code'], unique=True)
    op.create_index(op.f('ix_product_batches_public_verification_token'), 'product_batches', ['public_verification_token'], unique=True)
    op.create_index(op.f('ix_product_batches_commodity'), 'product_batches', ['commodity'], unique=False)

    # 3. Batch Harvests junction table
    op.create_table(
        'batch_harvests',
        sa.Column('batch_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('product_batches.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('harvest_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('harvests.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('allocated_quantity_kg', sa.Float(), nullable=False),
    )

    # 4. Batch Events table
    op.create_table(
        'batch_events',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('batch_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('product_batches.id', ondelete='CASCADE'), nullable=False),
        sa.Column('event_type', sa.String(length=50), nullable=False),
        sa.Column('event_timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.Column('recorded_by_user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('metadata_json', sa.JSON(), nullable=True),
        sa.Column('event_hash', sa.String(length=64), nullable=False),
        sa.Column('previous_event_hash', sa.String(length=64), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(op.f('ix_batch_events_batch_id'), 'batch_events', ['batch_id'], unique=False)
    op.create_index(op.f('ix_batch_events_event_hash'), 'batch_events', ['event_hash'], unique=False)


def downgrade() -> None:
    op.drop_table('batch_events')
    op.drop_table('batch_harvests')
    op.drop_table('product_batches')
    op.drop_table('harvests')
