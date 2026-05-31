"""upload_ai_pipeline

Revision ID: 9b7c6d5e4f3a
Revises: 7a2b1c4d5e6f
Create Date: 2026-05-30 23:10:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "9b7c6d5e4f3a"
down_revision = "7a2b1c4d5e6f"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("video_sources") as batch_op:
        batch_op.add_column(sa.Column("user_id", sa.String(length=64), nullable=True))
        batch_op.add_column(sa.Column("mime_type", sa.String(length=128), nullable=True))
        batch_op.add_column(sa.Column("file_size", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("storage_path", sa.Text(), nullable=True))
        batch_op.add_column(sa.Column("media_meta", sa.JSON(), nullable=True))
        batch_op.add_column(sa.Column("processing_status", sa.String(length=32), nullable=False, server_default="ready"))
        batch_op.create_index(batch_op.f("ix_video_sources_user_id"), ["user_id"], unique=False)
        batch_op.create_foreign_key("fk_video_sources_user_id_users", "users", ["user_id"], ["id"])

    op.add_column("analysis_tasks", sa.Column("stage", sa.String(length=32), nullable=False, server_default="queued"))
    op.add_column("analysis_tasks", sa.Column("progress", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("analysis_tasks", sa.Column("artifact_payload", sa.JSON(), nullable=True))

    op.add_column("analysis_results", sa.Column("model_provider", sa.String(length=32), nullable=True))
    op.add_column("analysis_results", sa.Column("model_name", sa.String(length=128), nullable=True))
    op.add_column("analysis_results", sa.Column("prompt_version", sa.String(length=32), nullable=True))
    op.add_column("analysis_results", sa.Column("raw_model_output", sa.JSON(), nullable=True))

    op.create_table(
        "video_artifacts",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("video_id", sa.String(length=64), nullable=False),
        sa.Column("task_id", sa.String(length=64), nullable=True),
        sa.Column("audio_path", sa.Text(), nullable=True),
        sa.Column("keyframe_paths", sa.JSON(), nullable=False),
        sa.Column("transcript", sa.Text(), nullable=True),
        sa.Column("ark_audio_file_id", sa.String(length=128), nullable=True),
        sa.Column("ark_payload", sa.JSON(), nullable=False),
        sa.Column("timings_ms", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["task_id"], ["analysis_tasks.id"]),
        sa.ForeignKeyConstraint(["video_id"], ["video_sources.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_video_artifacts_task_id"), "video_artifacts", ["task_id"], unique=False)
    op.create_index(op.f("ix_video_artifacts_video_id"), "video_artifacts", ["video_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_video_artifacts_video_id"), table_name="video_artifacts")
    op.drop_index(op.f("ix_video_artifacts_task_id"), table_name="video_artifacts")
    op.drop_table("video_artifacts")

    op.drop_column("analysis_results", "raw_model_output")
    op.drop_column("analysis_results", "prompt_version")
    op.drop_column("analysis_results", "model_name")
    op.drop_column("analysis_results", "model_provider")

    op.drop_column("analysis_tasks", "artifact_payload")
    op.drop_column("analysis_tasks", "progress")
    op.drop_column("analysis_tasks", "stage")

    with op.batch_alter_table("video_sources") as batch_op:
        batch_op.drop_constraint("fk_video_sources_user_id_users", type_="foreignkey")
        batch_op.drop_index(batch_op.f("ix_video_sources_user_id"))
        batch_op.drop_column("processing_status")
        batch_op.drop_column("media_meta")
        batch_op.drop_column("storage_path")
        batch_op.drop_column("file_size")
        batch_op.drop_column("mime_type")
        batch_op.drop_column("user_id")
