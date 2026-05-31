from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, LargeBinary, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


def utcnow() -> datetime:
    return datetime.utcnow()


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    anonymous_device_id: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    last_seen_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)


class VideoSource(Base):
    __tablename__ = "video_sources"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id"), index=True)
    scenario: Mapped[str] = mapped_column(String(32), index=True)
    source: Mapped[str] = mapped_column(String(32), default="demo")
    url: Mapped[Optional[str]] = mapped_column(Text)
    title: Mapped[str] = mapped_column(Text)
    cover_url: Mapped[str] = mapped_column(Text)
    creator_name: Mapped[Optional[str]] = mapped_column(Text)
    duration_sec: Mapped[Optional[int]] = mapped_column(Integer)
    raw_description: Mapped[Optional[str]] = mapped_column(Text)
    mime_type: Mapped[Optional[str]] = mapped_column(String(128))
    file_size: Mapped[Optional[int]] = mapped_column(Integer)
    storage_path: Mapped[Optional[str]] = mapped_column(Text)
    media_meta: Mapped[dict] = mapped_column(JSON, default=dict)
    processing_status: Mapped[str] = mapped_column(String(32), default="ready")


class AnalysisTask(Base):
    __tablename__ = "analysis_tasks"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    video_id: Mapped[str] = mapped_column(ForeignKey("video_sources.id"), index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    status: Mapped[str] = mapped_column(String(24), default="queued")
    stage: Mapped[str] = mapped_column(String(32), default="queued")
    progress: Mapped[int] = mapped_column(Integer, default=0)
    error_message: Mapped[Optional[str]] = mapped_column(Text)
    analysis_id: Mapped[Optional[str]] = mapped_column(String(64), index=True)
    artifact_payload: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    video_id: Mapped[str] = mapped_column(ForeignKey("video_sources.id"), index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    scenario: Mapped[str] = mapped_column(String(32), index=True)
    theme: Mapped[str] = mapped_column(Text)
    summary: Mapped[str] = mapped_column(Text)
    core_micro_action: Mapped[dict] = mapped_column(JSON)
    why_worth_doing: Mapped[str] = mapped_column(Text)
    action_tips: Mapped[list] = mapped_column(JSON)
    use_cases: Mapped[list] = mapped_column(JSON)
    precautions: Mapped[list] = mapped_column(JSON)
    risk: Mapped[dict] = mapped_column(JSON)
    graph_id: Mapped[str] = mapped_column(String(64), index=True)
    recommended_duration: Mapped[int] = mapped_column(Integer, default=7)
    model_provider: Mapped[Optional[str]] = mapped_column(String(32))
    model_name: Mapped[Optional[str]] = mapped_column(String(128))
    prompt_version: Mapped[Optional[str]] = mapped_column(String(32))
    raw_model_output: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class HealthGraph(Base):
    __tablename__ = "health_graphs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    video_id: Mapped[str] = mapped_column(ForeignKey("video_sources.id"), index=True)
    title: Mapped[str] = mapped_column(Text)
    description: Mapped[str] = mapped_column(Text)
    nodes: Mapped[list] = mapped_column(JSON)
    edges: Mapped[list] = mapped_column(JSON)
    version: Mapped[int] = mapped_column(Integer, default=1)


class VideoArtifact(Base):
    __tablename__ = "video_artifacts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    video_id: Mapped[str] = mapped_column(ForeignKey("video_sources.id"), index=True)
    task_id: Mapped[Optional[str]] = mapped_column(ForeignKey("analysis_tasks.id"), index=True)
    audio_path: Mapped[Optional[str]] = mapped_column(Text)
    keyframe_paths: Mapped[list] = mapped_column(JSON, default=list)
    transcript: Mapped[Optional[str]] = mapped_column(Text)
    ark_audio_file_id: Mapped[Optional[str]] = mapped_column(String(128))
    ark_payload: Mapped[dict] = mapped_column(JSON, default=dict)
    timings_ms: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class Challenge(Base):
    __tablename__ = "challenges"

    id: Mapped[str] = mapped_column(String(96), primary_key=True)
    graph_id: Mapped[str] = mapped_column(ForeignKey("health_graphs.id"), index=True)
    video_id: Mapped[str] = mapped_column(ForeignKey("video_sources.id"), index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(Text)
    duration_days: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(24), default="active")
    current_day: Mapped[int] = mapped_column(Integer, default=1)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    plan: Mapped[dict] = mapped_column(JSON)
    progress: Mapped[dict] = mapped_column(JSON)

    days: Mapped[list["ChallengeDay"]] = relationship(
        "ChallengeDay",
        cascade="all, delete-orphan",
        order_by="ChallengeDay.day",
        lazy="selectin",
    )


class ChallengeDay(Base):
    __tablename__ = "challenge_days"
    __table_args__ = (UniqueConstraint("challenge_id", "day", name="uq_challenge_day"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    challenge_id: Mapped[str] = mapped_column(ForeignKey("challenges.id"), index=True)
    day: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(Text)
    micro_action: Mapped[str] = mapped_column(Text)
    why: Mapped[str] = mapped_column(Text)
    how_to: Mapped[list] = mapped_column(JSON)
    precautions: Mapped[list] = mapped_column(JSON)
    graph_node_id: Mapped[str] = mapped_column(String(96))
    estimated_minutes: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(24), default="locked")


class Checkin(Base):
    __tablename__ = "checkins"
    __table_args__ = (UniqueConstraint("challenge_id", "day", name="uq_checkin_challenge_day"),)

    id: Mapped[str] = mapped_column(String(96), primary_key=True)
    challenge_id: Mapped[str] = mapped_column(ForeignKey("challenges.id"), index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    day: Mapped[int] = mapped_column(Integer)
    graph_node_id: Mapped[str] = mapped_column(String(96))
    completed_type: Mapped[str] = mapped_column(String(16))
    optional_note: Mapped[Optional[str]] = mapped_column(Text)
    encouragement: Mapped[str] = mapped_column(Text)
    points: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class ReviewReport(Base):
    __tablename__ = "review_reports"

    id: Mapped[str] = mapped_column(String(96), primary_key=True)
    challenge_id: Mapped[str] = mapped_column(ForeignKey("challenges.id"), unique=True, index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    payload: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class Reward(Base):
    __tablename__ = "rewards"

    id: Mapped[str] = mapped_column(String(96), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    challenge_id: Mapped[Optional[str]] = mapped_column(ForeignKey("challenges.id"), index=True)
    badge_name: Mapped[Optional[str]] = mapped_column(Text)
    points: Mapped[int] = mapped_column(Integer, default=0)
    reason: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class PointsTransaction(Base):
    __tablename__ = "points_transactions"
    __table_args__ = (UniqueConstraint("user_id", "reason", "ref_id", name="uq_points_transaction_ref"),)

    id: Mapped[str] = mapped_column(String(96), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    amount: Mapped[int] = mapped_column(Integer)
    reason: Mapped[str] = mapped_column(String(64))
    ref_id: Mapped[str] = mapped_column(String(128))
    balance_after: Mapped[int] = mapped_column(Integer)
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class GrowingBuddy(Base):
    __tablename__ = "growing_buddies"

    id: Mapped[str] = mapped_column(String(96), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    seedling_id: Mapped[str] = mapped_column(String(64), index=True)
    challenge_id: Mapped[Optional[str]] = mapped_column(ForeignKey("challenges.id"), index=True)
    rarity: Mapped[str] = mapped_column(String(24), default="common")
    target_checkins: Mapped[int] = mapped_column(Integer, default=5)
    completed_checkins: Mapped[int] = mapped_column(Integer, default=0)
    energy: Mapped[int] = mapped_column(Integer, default=0)
    stage: Mapped[str] = mapped_column(String(32), default="seedling")
    status: Mapped[str] = mapped_column(String(24), default="active")
    started_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)


class CollectibleBuddy(Base):
    __tablename__ = "collectible_buddies"

    id: Mapped[str] = mapped_column(String(96), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    seedling_id: Mapped[str] = mapped_column(String(64), index=True)
    mature_form_id: Mapped[str] = mapped_column(String(64), index=True)
    name: Mapped[str] = mapped_column(Text)
    rarity: Mapped[str] = mapped_column(String(24), default="common")
    description: Mapped[str] = mapped_column(Text)
    source_challenge_id: Mapped[Optional[str]] = mapped_column(ForeignKey("challenges.id"), index=True)
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    obtained_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class BuddyInventory(Base):
    __tablename__ = "buddy_inventory"
    __table_args__ = (UniqueConstraint("user_id", "seedling_id", name="uq_buddy_inventory_seedling"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    seedling_id: Mapped[str] = mapped_column(String(64), index=True)
    quantity: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)


class TTSAudioCache(Base):
    __tablename__ = "tts_audio_cache"
    __table_args__ = (UniqueConstraint("cache_key", name="uq_tts_audio_cache_key"),)

    id: Mapped[str] = mapped_column(String(96), primary_key=True)
    cache_key: Mapped[str] = mapped_column(String(128), index=True)
    resource_id: Mapped[str] = mapped_column(String(64))
    speaker: Mapped[str] = mapped_column(String(128))
    text: Mapped[str] = mapped_column(Text)
    audio: Mapped[bytes] = mapped_column(LargeBinary)
    hit_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    last_used_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class CompanionVoiceState(Base):
    __tablename__ = "companion_voice_states"

    device_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    line_cursor: Mapped[int] = mapped_column(Integer, default=0)
    last_request_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)
