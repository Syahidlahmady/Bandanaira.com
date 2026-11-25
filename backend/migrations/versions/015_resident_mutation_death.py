"""create resident mutations table and death registry fields

Revision ID: 015_resident_mutation_death
Revises: 014_community_contents_table
Create Date: 2026-11-25 07:47:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '015_resident_mutation_death'
down_revision: Union[str, None] = '014_community_contents_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add residence status and death fields to residents table
    op.add_column(
        'residents',
        sa.Column('residence_status', sa.String(length=20), server_default='active', nullable=False)
    )
    op.create_index(op.f('ix_residents_residence_status'), 'residents', ['residence_status'], unique=False)

    op.add_column('residents', sa.Column('death_date', sa.Date(), nullable=True))
    op.add_column('residents', sa.Column('death_place', sa.String(length=150), nullable=True))
    op.add_column('residents', sa.Column('death_cause', sa.String(length=150), nullable=True))
    op.add_column('residents', sa.Column('death_certificate_no', sa.String(length=100), nullable=True))
    op.add_column('residents', sa.Column('death_notes', sa.Text(), nullable=True))
    op.add_column('residents', sa.Column('reported_death_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column(
        'residents',
        sa.Column('reported_death_by', postgresql.UUID(as_uuid=True), nullable=True)
    )
    op.create_foreign_key(
        'fk_residents_reported_death_by_users',
        'residents', 'users',
        ['reported_death_by'], ['id'],
        ondelete='SET NULL'
    )

    # 2. Create resident_mutations table
    op.create_table(
        'resident_mutations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('resident_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('origin_village', sa.String(length=100), nullable=False),
        sa.Column('destination_village', sa.String(length=100), nullable=False),
        sa.Column('new_address', sa.Text(), nullable=True),
        sa.Column('new_rt', sa.String(length=5), nullable=True),
        sa.Column('new_rw', sa.String(length=5), nullable=True),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('skpwni_number', sa.String(length=100), nullable=True),
        sa.Column('status', sa.String(length=50), server_default='pending_destination', nullable=False),
        sa.Column('initiated_by_village', sa.String(length=100), nullable=False),
        sa.Column('origin_approved_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('origin_approved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('destination_approved_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('destination_approved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.Column('rejected_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('rejected_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['resident_id'], ['residents.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['origin_approved_by'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['destination_approved_by'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['rejected_by'], ['users.id'], ondelete='SET NULL'),
    )
    op.create_index(op.f('ix_resident_mutations_resident_id'), 'resident_mutations', ['resident_id'], unique=False)
    op.create_index(op.f('ix_resident_mutations_origin_village'), 'resident_mutations', ['origin_village'], unique=False)
    op.create_index(op.f('ix_resident_mutations_destination_village'), 'resident_mutations', ['destination_village'], unique=False)
    op.create_index(op.f('ix_resident_mutations_status'), 'resident_mutations', ['status'], unique=False)


def downgrade() -> None:
    op.drop_table('resident_mutations')
    op.drop_constraint('fk_residents_reported_death_by_users', 'residents', type_='foreignkey')
    op.drop_index(op.f('ix_residents_residence_status'), table_name='residents')
    op.drop_column('residents', 'reported_death_by')
    op.drop_column('residents', 'reported_death_at')
    op.drop_column('residents', 'death_notes')
    op.drop_column('residents', 'death_certificate_no')
    op.drop_column('residents', 'death_cause')
    op.drop_column('residents', 'death_place')
    op.drop_column('residents', 'death_date')
    op.drop_column('residents', 'residence_status')
