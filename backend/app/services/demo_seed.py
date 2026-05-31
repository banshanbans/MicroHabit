from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.entities import AnalysisResult, HealthGraph, VideoSource
from app.services.seed_data import ANALYSES, GRAPHS, VIDEOS


def seed_demo_data(db: Session) -> None:
    for scenario, payload in VIDEOS.items():
        existing = db.get(VideoSource, payload["id"])
        values = {
            "id": payload["id"],
            "source": payload["source"],
            "scenario": scenario,
            "title": payload["title"],
            "cover_url": payload["coverUrl"],
            "creator_name": payload["creatorName"],
            "duration_sec": payload["durationSec"],
            "raw_description": payload["rawDescription"],
        }
        if existing:
            for key, value in values.items():
                setattr(existing, key, value)
        else:
            db.add(VideoSource(**values))

    db.commit()

    for scenario, payload in GRAPHS.items():
        existing = db.get(HealthGraph, payload["id"])
        values = {
            "id": payload["id"],
            "video_id": payload["videoId"],
            "title": payload["title"],
            "description": payload["description"],
            "nodes": payload["nodes"],
            "edges": payload["edges"],
            "version": 1,
        }
        if existing:
            for key, value in values.items():
                setattr(existing, key, value)
        else:
            db.add(HealthGraph(**values))

    db.commit()


def ensure_video_for_scenario(db: Session, scenario: str, url: Optional[str] = None) -> VideoSource:
    seed_demo_data(db)
    video = db.scalar(select(VideoSource).where(VideoSource.scenario == scenario))
    if video is None:
        raise ValueError(f"Unknown scenario: {scenario}")
    if url:
        video.url = url
        video.source = "douyin"
        db.commit()
        db.refresh(video)
    return video


def analysis_payload_for_video(video: VideoSource) -> dict:
    return ANALYSES[video.scenario]
