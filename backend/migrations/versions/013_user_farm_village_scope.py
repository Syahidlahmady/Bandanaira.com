"""add village jurisdiction scoping to users and farms

Revision ID: 013_user_and_farm_village_scoping
Revises: 012_tour_guides_table
Create Date: 2026-11-17 21:18:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '013_user_farm_village_scope'
down_revision: Union[str, None] = '012_tour_guides_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add village to users table
    op.add_column('users', sa.Column('village', sa.String(length=100), nullable=True))
    op.create_index(op.f('ix_users_village'), 'users', ['village'], unique=False)

    # 2. Add village to farms table
    op.add_column('farms', sa.Column('village', sa.String(length=100), nullable=False, server_default='Lonthoir'))
    op.create_index(op.f('ix_farms_village'), 'farms', ['village'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_farms_village'), table_name='farms')
    op.drop_column('farms', 'village')
    op.drop_index(op.f('ix_users_village'), table_name='users')
    op.drop_column('users', 'village')
