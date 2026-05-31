"""tts_cache_and_voice_state

Revision ID: 7a2b1c4d5e6f
Revises: 185787b8e3bd
Create Date: 2026-05-30 22:30:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "7a2b1c4d5e6f"
down_revision = "185787b8e3bd"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "tts_audio_cache",
        sa.Column("id", sa.String(length=96), nullable=False),
        sa.Column("cache_key", sa.String(length=128), nullable=False),
        sa.Column("resource_id", sa.String(length=64), nullable=False),
        sa.Column("speaker", sa.String(length=128), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("audio", sa.LargeBinary(), nullable=False),
        sa.Column("hit_count", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("last_used_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("cache_key", name="uq_tts_audio_cache_key"),
    )
    op.create_index(op.f("ix_tts_audio_cache_cache_key"), "tts_audio_cache", ["cache_key"], unique=False)
    op.create_table(
        "companion_voice_states",
        sa.Column("device_id", sa.String(length=128), nullable=False),
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("line_cursor", sa.Integer(), nullable=False),
        sa.Column("last_request_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("device_id"),
    )
    op.create_index(op.f("ix_companion_voice_states_user_id"), "companion_voice_states", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_companion_voice_states_user_id"), table_name="companion_voice_states")
    op.drop_table("companion_voice_states")
    op.drop_index(op.f("ix_tts_audio_cache_cache_key"), table_name="tts_audio_cache")
    op.drop_table("tts_audio_cache")

