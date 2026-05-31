from __future__ import annotations

import base64
import hashlib
import json
from datetime import datetime, timedelta
from uuid import uuid4

import httpx
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.entities import CompanionVoiceState, TTSAudioCache, User
from app.services.profile_service import companion_line_for_cursor


class TTSNotConfigured(RuntimeError):
    pass


ANALYSIS_WAITING_LINES = [
    "小芽正在整理第一颗节点。",
    "图谱快长出来了。",
    "先停一口气，微光在路上。",
    "正在给第一天留一个很轻的入口。",
    "快好了，节点会一个个亮起来。",
    "小芽还在检查哪些动作最适合开始。",
]


def analysis_waiting_line_for_cursor(cursor: int) -> str:
    return ANALYSIS_WAITING_LINES[cursor % len(ANALYSIS_WAITING_LINES)]


def synthesize_companion_speech(db: Session, user: User, device_id: str, intent: str = "daily_goal") -> tuple[bytes, str]:
    state = db.get(CompanionVoiceState, device_id)
    if state is None:
        state = CompanionVoiceState(device_id=device_id, user_id=user.id, line_cursor=0)
        db.add(state)
        db.flush()
    if state.last_request_at and datetime.utcnow() - state.last_request_at < timedelta(seconds=5):
        raise HTTPException(status_code=429, detail="请稍等几秒后再播放小芽语音。")

    text = analysis_waiting_line_for_cursor(state.line_cursor) if intent == "analysis_waiting" else companion_line_for_cursor(state.line_cursor)
    audio = synthesize_speech(db, device_id, text)
    state.line_cursor = state.line_cursor + 1
    state.last_request_at = datetime.utcnow()
    db.commit()
    return audio, text


def synthesize_speech(db: Session, device_id: str, text: str) -> bytes:
    settings = get_settings()
    if not settings.volcengine_tts_api_key:
        raise TTSNotConfigured("Volcengine TTS is not configured")

    cache_key = _cache_key(settings.volcengine_tts_resource_id, settings.volcengine_tts_speaker, text)
    cached = db.scalar(select(TTSAudioCache).where(TTSAudioCache.cache_key == cache_key))
    if cached:
        cached.hit_count += 1
        cached.last_used_at = datetime.utcnow()
        db.flush()
        return cached.audio

    payload = {
        "user": {"uid": device_id},
        "req_params": {
            "text": text,
            "speaker": settings.volcengine_tts_speaker,
            "audio_params": {"format": "mp3", "sample_rate": 24000},
        },
    }
    headers = {
        "Content-Type": "application/json",
        "X-Api-Key": settings.volcengine_tts_api_key,
        "X-Api-Resource-Id": settings.volcengine_tts_resource_id,
        "X-Api-Request-Id": f"microhabit-{uuid4().hex}",
    }
    with httpx.Client(timeout=20) as client:
        response = client.post(settings.volcengine_tts_endpoint, json=payload, headers=headers)
    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail="火山引擎语音合成失败。")
    audio = _extract_audio(response)
    db.add(
        TTSAudioCache(
            id=f"tts_{uuid4().hex[:16]}",
            cache_key=cache_key,
            resource_id=settings.volcengine_tts_resource_id,
            speaker=settings.volcengine_tts_speaker,
            text=text,
            audio=audio,
            hit_count=0,
        )
    )
    db.flush()
    return audio


def _extract_audio(response: httpx.Response) -> bytes:
    content_type = response.headers.get("content-type", "")
    if content_type.startswith("audio/"):
        return response.content

    try:
        payload = response.json()
    except json.JSONDecodeError:
        payload = None
    if isinstance(payload, dict):
        code = payload.get("code")
        data = payload.get("data") or payload.get("audio")
        if code not in (None, 0, "0") and not data:
            message = payload.get("message") or "火山引擎语音合成失败。"
            raise HTTPException(status_code=502, detail=f"火山引擎语音合成失败：{message}")
        if isinstance(data, str):
            return base64.b64decode(data)

    chunks: list[bytes] = []
    for raw_line in response.text.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        if line.startswith("data:"):
            line = line[5:].strip()
        try:
            payload = json.loads(line)
        except json.JSONDecodeError:
            continue
        data = payload.get("data") or payload.get("audio")
        if isinstance(data, str):
            chunks.append(base64.b64decode(data))
    if chunks:
        return b"".join(chunks)
    raise HTTPException(status_code=502, detail="火山引擎语音响应格式无法识别。")


def _cache_key(resource_id: str, speaker: str, text: str) -> str:
    raw = f"{resource_id}:{speaker}:{text}".encode("utf-8")
    return hashlib.sha256(raw).hexdigest()
