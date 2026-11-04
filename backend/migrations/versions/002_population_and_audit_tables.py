"""create population and audit tables

Revision ID: 002_population_and_audit_tables
Revises: 001_initial_users_and_roles
Create Date: 2026-11-04 21:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '002_population_and_audit_tables'
down_revision: Union[str, None] = '001_initial_users_and_roles'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Audit logs table
    op.create_table(
        'audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('entity_name', sa.String(length=100), nullable=False),
        sa.Column('entity_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('changes_json', sa.JSON(), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(op.f('ix_audit_logs_action'), 'audit_logs', ['action'], unique=False)
    op.create_index(op.f('ix_audit_logs_entity_name'), 'audit_logs', ['entity_name'], unique=False)
    op.create_index(op.f('ix_audit_logs_entity_id'), 'audit_logs', ['entity_id'], unique=False)

    # 2. Residents table
    op.create_table(
        'residents',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('nik', sa.String(length=16), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('gender', sa.String(length=10), nullable=False),
        sa.Column('birth_place', sa.String(length=100), nullable=True),
        sa.Column('birth_date', sa.Date(), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('rt', sa.String(length=5), nullable=True),
        sa.Column('rw', sa.String(length=5), nullable=True),
        sa.Column('village', sa.String(length=100), nullable=False, server_default='Banda Neira'),
        sa.Column('religion', sa.String(length=50), nullable=True),
        sa.Column('marital_status', sa.String(length=50), nullable=True),
        sa.Column('occupation', sa.String(length=100), nullable=True),
        sa.Column('phone_number', sa.String(length=20), nullable=True),
        sa.Column('verification_status', sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column('verified_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_index(op.f('ix_residents_nik'), 'residents', ['nik'], unique=True)
    op.create_index(op.f('ix_residents_full_name'), 'residents', ['full_name'], unique=False)
    op.create_index(op.f('ix_residents_verification_status'), 'residents', ['verification_status'], unique=False)
    op.create_index(op.f('ix_residents_occupation'), 'residents', ['occupation'], unique=False)

    # 3. Administrative requests table
    op.create_table(
        'administrative_requests',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('resident_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('residents.id', ondelete='CASCADE'), nullable=False),
        sa.Column('request_type', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='submitted'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_index(op.f('ix_administrative_requests_resident_id'), 'administrative_requests', ['resident_id'], unique=False)
    op.create_index(op.f('ix_administrative_requests_status'), 'administrative_requests', ['status'], unique=False)


def downgrade() -> None:
    op.drop_table('administrative_requests')
    op.drop_table('residents')
    op.drop_table('audit_logs')
