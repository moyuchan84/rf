"""add_timestamps_to_master_data

Revision ID: 0e8510ccc89e
Revises: 03c8e740f2c7
Create Date: 2026-03-19 09:14:53.410872

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0e8510ccc89e'
down_revision: Union[str, Sequence[str], None] = '03c8e740f2c7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Update beol_options
    op.alter_column('beol_options', 'created_at',
               existing_type=postgresql.TIMESTAMP(precision=3),
               type_=sa.DateTime(timezone=True),
               nullable=True,
               existing_server_default=sa.text('CURRENT_TIMESTAMP'))
    op.alter_column('beol_options', 'update_time',
               existing_type=postgresql.TIMESTAMP(precision=3),
               type_=sa.DateTime(timezone=True),
               nullable=True,
               server_default=sa.text('CURRENT_TIMESTAMP'))

    # 2. Update process_plans
    op.alter_column('process_plans', 'created_at',
               existing_type=postgresql.TIMESTAMP(precision=3),
               type_=sa.DateTime(timezone=True),
               nullable=True,
               existing_server_default=sa.text('CURRENT_TIMESTAMP'))
    op.alter_column('process_plans', 'update_time',
               existing_type=postgresql.TIMESTAMP(precision=3),
               type_=sa.DateTime(timezone=True),
               nullable=True,
               server_default=sa.text('CURRENT_TIMESTAMP'))

    # 3. Update products
    op.alter_column('products', 'created_at',
               existing_type=postgresql.TIMESTAMP(precision=3),
               type_=sa.DateTime(timezone=True),
               nullable=True,
               existing_server_default=sa.text('CURRENT_TIMESTAMP'))
    op.alter_column('products', 'update_time',
               existing_type=postgresql.TIMESTAMP(precision=3),
               type_=sa.DateTime(timezone=True),
               nullable=True,
               server_default=sa.text('CURRENT_TIMESTAMP'))

    # 4. Update request_items
    op.alter_column('request_items', 'created_at',
               existing_type=postgresql.TIMESTAMP(precision=3),
               type_=sa.DateTime(timezone=True),
               nullable=True,
               existing_server_default=sa.text('CURRENT_TIMESTAMP'))
    op.alter_column('request_items', 'update_time',
               existing_type=postgresql.TIMESTAMP(precision=3),
               type_=sa.DateTime(timezone=True),
               nullable=True,
               server_default=sa.text('CURRENT_TIMESTAMP'))


def downgrade() -> None:
    """Downgrade schema."""
    pass
