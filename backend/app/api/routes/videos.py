from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_or_create_user
from app.db.session import get_db
from app.models.entities import User
from app.schemas.api import ParseVideoRequest
from app.services.demo_seed import ensure_video_for_scenario
from app.services.media_service import UploadValidationError, save_uploaded_video
from app.services.serializers import video_to_api

router = APIRouter(prefix="/videos", tags=["videos"])


@router.post("/parse")
def parse_video(payload: ParseVideoRequest, db: Session = Depends(get_db), user: User = Depends(get_or_create_user)) -> dict:
    del user
    if payload.url and not payload.scenario:
        raise HTTPException(status_code=400, detail="暂不支持直接解析抖音链接，请上传已下载或录屏的视频文件")
    scenario = payload.scenario or "stretch"
    try:
        video = ensure_video_for_scenario(db, scenario, None)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return video_to_api(video)


@router.post("/upload")
async def upload_video(
    file: UploadFile = File(...),
    source: str = Form(default="douyin_upload"),
    db: Session = Depends(get_db),
    user: User = Depends(get_or_create_user),
) -> dict:
    try:
        video = await save_uploaded_video(file, user, source)
    except UploadValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    db.add(video)
    db.commit()
    db.refresh(video)
    return video_to_api(video)
