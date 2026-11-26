"""add resident_id and resident_nik to tour_guides table

Revision ID: 016_tour_guide_resident_link
Revises: 015_resident_mutation_death
Create Date: 2026-11-26 10:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '016_tour_guide_resident_link'
down_revision: Union[str, None] = '015_resident_mutation_death'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'tour_guides',
        sa.Column('resident_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('residents.id', ondelete='SET NULL'), nullable=True),
    )
    op.add_column(
        'tour_guides',
        sa.Column('resident_nik', sa.String(length=16), nullable=True),
    )
    op.create_index('ix_tour_guides_resident_id', 'tour_guides', ['resident_id'])
    op.create_index('ix_tour_guides_resident_nik', 'tour_guides', ['resident_nik'])


def downgrade() -> None:
    op.drop_index('ix_tour_guides_resident_nik', table_name='tour_guides')
    op.drop_index('ix_tour_guides_resident_id', table_name='tour_guides')
    op.drop_column('tour_guides', 'resident_nik')
    op.drop_column('tour_guides', 'resident_id')
