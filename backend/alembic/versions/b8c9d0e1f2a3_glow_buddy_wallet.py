"""glow_buddy_wallet

Revision ID: b8c9d0e1f2a3
Revises: 9b7c6d5e4f3a
Create Date: 2026-05-31 10:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "b8c9d0e1f2a3"
down_revision = "9b7c6d5e4f3a"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "points_transactions",
        sa.Column("id", sa.String(length=96), nullable=False),
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("amount", sa.Integer(), nullable=False),
        sa.Column("reason", sa.String(length=64), nullable=False),
        sa.Column("ref_id", sa.String(length=128), nullable=False),
        sa.Column("balance_after", sa.Integer(), nullable=False),
        sa.Column("meta", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "reason", "ref_id", name="uq_points_transaction_ref"),
    )
    op.create_index(op.f("ix_points_transactions_user_id"), "points_transactions", ["user_id"], unique=False)

    op.create_table(
        "growing_buddies",
        sa.Column("id", sa.String(length=96), nullable=False),
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("seedling_id", sa.String(length=64), nullable=False),
        sa.Column("challenge_id", sa.String(length=96), nullable=True),
        sa.Column("rarity", sa.String(length=24), nullable=False),
        sa.Column("target_checkins", sa.Integer(), nullable=False),
        sa.Column("completed_checkins", sa.Integer(), nullable=False),
        sa.Column("energy", sa.Integer(), nullable=False),
        sa.Column("stage", sa.String(length=32), nullable=False),
        sa.Column("status", sa.String(length=24), nullable=False),
        sa.Column("started_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["challenge_id"], ["challenges.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_growing_buddies_challenge_id"), "growing_buddies", ["challenge_id"], unique=False)
    op.create_index(op.f("ix_growing_buddies_seedling_id"), "growing_buddies", ["seedling_id"], unique=False)
    op.create_index(op.f("ix_growing_buddies_user_id"), "growing_buddies", ["user_id"], unique=False)

    op.create_table(
        "collectible_buddies",
        sa.Column("id", sa.String(length=96), nullable=False),
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("seedling_id", sa.String(length=64), nullable=False),
        sa.Column("mature_form_id", sa.String(length=64), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("rarity", sa.String(length=24), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("source_challenge_id", sa.String(length=96), nullable=True),
        sa.Column("meta", sa.JSON(), nullable=False),
        sa.Column("obtained_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["source_challenge_id"], ["challenges.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_collectible_buddies_mature_form_id"), "collectible_buddies", ["mature_form_id"], unique=False)
    op.create_index(op.f("ix_collectible_buddies_seedling_id"), "collectible_buddies", ["seedling_id"], unique=False)
    op.create_index(op.f("ix_collectible_buddies_source_challenge_id"), "collectible_buddies", ["source_challenge_id"], unique=False)
    op.create_index(op.f("ix_collectible_buddies_user_id"), "collectible_buddies", ["user_id"], unique=False)

    op.create_table(
        "buddy_inventory",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("seedling_id", sa.String(length=64), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "seedling_id", name="uq_buddy_inventory_seedling"),
    )
    op.create_index(op.f("ix_buddy_inventory_seedling_id"), "buddy_inventory", ["seedling_id"], unique=False)
    op.create_index(op.f("ix_buddy_inventory_user_id"), "buddy_inventory", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_buddy_inventory_user_id"), table_name="buddy_inventory")
    op.drop_index(op.f("ix_buddy_inventory_seedling_id"), table_name="buddy_inventory")
    op.drop_table("buddy_inventory")

    op.drop_index(op.f("ix_collectible_buddies_user_id"), table_name="collectible_buddies")
    op.drop_index(op.f("ix_collectible_buddies_source_challenge_id"), table_name="collectible_buddies")
    op.drop_index(op.f("ix_collectible_buddies_seedling_id"), table_name="collectible_buddies")
    op.drop_index(op.f("ix_collectible_buddies_mature_form_id"), table_name="collectible_buddies")
    op.drop_table("collectible_buddies")

    op.drop_index(op.f("ix_growing_buddies_user_id"), table_name="growing_buddies")
    op.drop_index(op.f("ix_growing_buddies_seedling_id"), table_name="growing_buddies")
    op.drop_index(op.f("ix_growing_buddies_challenge_id"), table_name="growing_buddies")
    op.drop_table("growing_buddies")

    op.drop_index(op.f("ix_points_transactions_user_id"), table_name="points_transactions")
    op.drop_table("points_transactions")
