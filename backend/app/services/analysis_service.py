from __future__ import annotations

from datetime import datetime
from pathlib import Path
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import SessionLocal
from app.models.entities import AnalysisResult, AnalysisTask, HealthGraph, User, VideoArtifact, VideoSource
from app.services.ark_service import ArkClientService, PROMPT_VERSION, normalize_ai_payload
from app.services.demo_seed import analysis_payload_for_video, seed_demo_data
from app.services.media_service import extract_media_artifacts


def start_analysis(db: Session, user: User, video_id: str) -> AnalysisTask:
    seed_demo_data(db)
    video = db.get(VideoSource, video_id)
    if video is None:
        raise LookupError("Video not found")
    if video.user_id and video.user_id != user.id:
        raise LookupError("Video not found")
    if video.source != "demo":
        return queue_upload_analysis(db, user, video)

    payload = analysis_payload_for_video(video)
    result = db.scalar(
        select(AnalysisResult).where(
            AnalysisResult.user_id == user.id,
            AnalysisResult.video_id == video.id,
        )
    )
    if result is None:
        result = AnalysisResult(
            id=f"{payload['id']}_{user.id[-6:]}",
            video_id=video.id,
            user_id=user.id,
            scenario=payload["scenario"],
            theme=payload["theme"],
            summary=payload["summary"],
            core_micro_action=payload["coreMicroAction"],
            why_worth_doing=payload["whyWorthDoing"],
            action_tips=payload["actionTips"],
            use_cases=payload["useCases"],
            precautions=payload["precautions"],
            risk=payload["risk"],
            graph_id=payload["graphId"],
            recommended_duration=payload["recommendedDuration"],
            model_provider="demo",
            model_name="seed",
            prompt_version="demo_v1",
            raw_model_output=payload,
        )
        db.add(result)
        db.flush()

    task = AnalysisTask(
        id=f"task_{uuid4().hex[:16]}",
        video_id=video.id,
        user_id=user.id,
        status="completed",
        stage="completed",
        progress=100,
        analysis_id=result.id,
        artifact_payload={},
        completed_at=datetime.utcnow(),
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def queue_upload_analysis(db: Session, user: User, video: VideoSource) -> AnalysisTask:
    task = AnalysisTask(
        id=f"task_{uuid4().hex[:16]}",
        video_id=video.id,
        user_id=user.id,
        status="queued",
        stage="queued",
        progress=0,
        artifact_payload={},
    )
    video.processing_status = "queued"
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def _set_task_state(
    db: Session,
    task: AnalysisTask,
    *,
    status: str | None = None,
    stage: str | None = None,
    progress: int | None = None,
    error_message: str | None = None,
    analysis_id: str | None = None,
    artifact_payload: dict | None = None,
) -> None:
    if status is not None:
        task.status = status
    if stage is not None:
        task.stage = stage
    if progress is not None:
        task.progress = progress
    if error_message is not None:
        task.error_message = error_message
    if analysis_id is not None:
        task.analysis_id = analysis_id
    if artifact_payload is not None:
        task.artifact_payload = artifact_payload
    db.commit()
    db.refresh(task)


def _persist_ai_result(
    db: Session,
    task: AnalysisTask,
    video: VideoSource,
    normalized: dict,
    raw_output: dict,
    transcript_payload: dict,
    artifact_payload: dict,
) -> AnalysisResult:
    graph_payload = normalized["graph"]
    graph = HealthGraph(
        id=graph_payload["id"],
        video_id=video.id,
        title=graph_payload["title"],
        description=graph_payload["description"],
        nodes=graph_payload["nodes"],
        edges=graph_payload["edges"],
        version=1,
    )
    db.add(graph)
    result = AnalysisResult(
        id=f"analysis_upload_{uuid4().hex[:16]}",
        video_id=video.id,
        user_id=task.user_id,
        scenario=normalized["scenario"],
        theme=normalized["theme"],
        summary=normalized["summary"],
        core_micro_action=normalized["coreMicroAction"],
        why_worth_doing=normalized["whyWorthDoing"],
        action_tips=normalized["actionTips"],
        use_cases=normalized["useCases"],
        precautions=normalized["precautions"],
        risk=normalized["risk"],
        graph_id=graph.id,
        recommended_duration=normalized["recommendedDuration"],
        model_provider="volcengine_ark",
        model_name=get_settings().ark_vision_model,
        prompt_version=PROMPT_VERSION,
        raw_model_output={
            "raw": raw_output,
            "normalized": normalized,
            "transcript": transcript_payload,
            "challengeDayPlans": normalized.get("challengeDayPlans", []),
        },
    )
    db.add(result)
    db.add(
        VideoArtifact(
            id=f"artifact_{uuid4().hex[:16]}",
            video_id=video.id,
            task_id=task.id,
            audio_path=artifact_payload.get("audioPath"),
            keyframe_paths=artifact_payload.get("keyframePaths") or [],
            transcript=transcript_payload.get("transcript"),
            ark_audio_file_id=transcript_payload.get("fileId"),
            ark_payload={"audio": transcript_payload, "vision": raw_output},
            timings_ms=artifact_payload.get("timingsMs") or {},
        )
    )
    video.scenario = normalized["scenario"]
    video.title = normalized["theme"]
    video.duration_sec = artifact_payload.get("durationSec") or video.duration_sec
    video.media_meta = {**(video.media_meta or {}), **artifact_payload}
    video.processing_status = "completed"
    db.flush()
    return result


def run_upload_analysis_task(task_id: str) -> None:
    with SessionLocal() as db:
        task = db.get(AnalysisTask, task_id)
        if task is None:
            return
        video = db.get(VideoSource, task.video_id)
        if video is None or not video.storage_path:
            _set_task_state(db, task, status="failed", stage="failed", progress=100, error_message="视频文件不存在")
            return

        try:
            _set_task_state(db, task, status="running", stage="extracting_media", progress=12)
            video.processing_status = "extracting_media"
            db.commit()
            artifacts = extract_media_artifacts(video.storage_path)
            _set_task_state(db, task, stage="transcribing_audio", progress=38, artifact_payload=artifacts)

            ark = ArkClientService()
            transcript_payload = ark.transcribe_audio(artifacts.get("audioPath"))
            _set_task_state(db, task, stage="analyzing_frames", progress=62, artifact_payload={**artifacts, "transcript": transcript_payload.get("transcript")})

            raw_output = ark.analyze_frames(artifacts.get("keyframePaths") or [], transcript_payload)
            _set_task_state(db, task, stage="generating_graph", progress=84)

            graph_id = f"graph_upload_{Path(video.id).stem[-16:]}_{task.id[-6:]}"
            normalized = normalize_ai_payload(raw_output, video.id, graph_id)
            result = _persist_ai_result(db, task, video, normalized, raw_output, transcript_payload, artifacts)
            _set_task_state(
                db,
                task,
                status="completed",
                stage="completed",
                progress=100,
                analysis_id=result.id,
                artifact_payload={**artifacts, "transcript": transcript_payload.get("transcript"), "keyframeCount": len(artifacts.get("keyframePaths") or [])},
            )
            task.completed_at = datetime.utcnow()
            db.commit()
        except Exception as exc:
            db.rollback()
            fresh_task = db.get(AnalysisTask, task_id)
            fresh_video = db.get(VideoSource, task.video_id)
            if fresh_task:
                fresh_task.status = "failed"
                fresh_task.stage = "failed"
                fresh_task.progress = 100
                fresh_task.error_message = str(exc) or "AI 分析失败"
                fresh_task.completed_at = datetime.utcnow()
            if fresh_video:
                fresh_video.processing_status = "failed"
            db.commit()
