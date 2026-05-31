from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_or_create_user
from app.db.session import get_db
from app.models.entities import AnalysisResult, AnalysisTask, User, VideoSource
from app.schemas.api import StartAnalysisRequest
from app.services.analysis_service import run_upload_analysis_task, start_analysis
from app.services.serializers import analysis_to_api

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("")
def create_analysis(
    payload: StartAnalysisRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: User = Depends(get_or_create_user),
) -> dict:
    if not payload.videoId:
        raise HTTPException(status_code=422, detail="videoId is required")
    try:
        task = start_analysis(db, user, payload.videoId)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    video = db.get(VideoSource, payload.videoId)
    if video and video.source != "demo" and task.status == "queued":
        background_tasks.add_task(run_upload_analysis_task, task.id)
    return {"taskId": task.id, "analysisId": task.analysis_id, "status": task.status, "stage": task.stage, "progress": task.progress}


@router.get("/tasks/{task_id}")
def get_analysis_task(task_id: str, db: Session = Depends(get_db), user: User = Depends(get_or_create_user)) -> dict:
    task = db.get(AnalysisTask, task_id)
    if task is None or task.user_id != user.id:
        raise HTTPException(status_code=404, detail="Analysis task not found")
    return {
        "taskId": task.id,
        "analysisId": task.analysis_id,
        "videoId": task.video_id,
        "status": task.status,
        "stage": task.stage,
        "progress": task.progress,
        "errorMessage": task.error_message,
        "createdAt": task.created_at.isoformat(),
        "completedAt": task.completed_at.isoformat() if task.completed_at else None,
    }


@router.get("/{analysis_id}")
def get_analysis(analysis_id: str, db: Session = Depends(get_db), user: User = Depends(get_or_create_user)) -> dict:
    result = db.get(AnalysisResult, analysis_id)
    if result is None or result.user_id != user.id:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis_to_api(result)
