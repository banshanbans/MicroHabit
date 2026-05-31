from typing import Optional
from urllib.parse import quote

from fastapi import APIRouter, Depends, Header, HTTPException, Response
from sqlalchemy.orm import Session

from app.api.deps import get_or_create_user
from app.db.session import get_db
from app.models.entities import User
from app.schemas.api import CompanionSpeakRequest
from app.services.profile_service import companion_line_for_cursor
from app.services.tts_service import TTSNotConfigured, analysis_waiting_line_for_cursor, synthesize_companion_speech

router = APIRouter(prefix="/companion", tags=["companion"])


@router.post("/speak")
def speak(
    payload: CompanionSpeakRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_or_create_user),
    x_device_id: Optional[str] = Header(default=None, alias="X-Device-Id"),
) -> Response:
    if payload.intent not in {"daily_goal", "analysis_waiting"}:
        raise HTTPException(status_code=400, detail="Unsupported companion intent")
    device_id = x_device_id or user.anonymous_device_id
    text = analysis_waiting_line_for_cursor(0) if payload.intent == "analysis_waiting" else companion_line_for_cursor(0)
    try:
        audio, text = synthesize_companion_speech(db, user, device_id, payload.intent)
    except TTSNotConfigured as exc:
        raise HTTPException(status_code=503, detail={"message": "语音暂时不可用", "text": text}) from exc
    return Response(
        content=audio,
        media_type="audio/mpeg",
        headers={
            "X-Companion-Text": quote(text),
            "Access-Control-Expose-Headers": "X-Companion-Text",
        },
    )
