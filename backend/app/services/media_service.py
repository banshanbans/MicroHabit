from __future__ import annotations

import mimetypes
import re
import shutil
import subprocess
from pathlib import Path
from time import perf_counter
from uuid import uuid4

from fastapi import UploadFile

from app.core.config import get_settings
from app.models.entities import User, VideoSource


ALLOWED_VIDEO_MIME_TYPES = {"video/mp4", "video/quicktime", "video/x-msvideo", "video/avi"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi"}


class UploadValidationError(ValueError):
    pass


def storage_root() -> Path:
    return Path(get_settings().storage_dir).expanduser().resolve()


def _safe_extension(filename: str, content_type: str | None) -> str:
    ext = Path(filename or "").suffix.lower()
    if ext in ALLOWED_VIDEO_EXTENSIONS:
        return ext
    guessed = mimetypes.guess_extension(content_type or "") or ""
    if guessed.lower() in ALLOWED_VIDEO_EXTENSIONS:
        return guessed.lower()
    return ".mp4"


async def save_uploaded_video(upload: UploadFile, user: User, source: str = "douyin_upload") -> VideoSource:
    settings = get_settings()
    content_type = upload.content_type or "application/octet-stream"
    ext = Path(upload.filename or "").suffix.lower()
    if content_type not in ALLOWED_VIDEO_MIME_TYPES and ext not in ALLOWED_VIDEO_EXTENSIONS:
        raise UploadValidationError("仅支持上传 .mp4、.mov 或 .avi 视频文件")

    video_id = f"video_upload_{uuid4().hex[:16]}"
    target_dir = storage_root() / "videos" / user.id / video_id
    target_dir.mkdir(parents=True, exist_ok=True)
    target_path = target_dir / f"source{_safe_extension(upload.filename or '', content_type)}"

    max_bytes = settings.max_upload_mb * 1024 * 1024
    size = 0
    try:
        with target_path.open("wb") as out:
            while True:
                chunk = await upload.read(1024 * 1024)
                if not chunk:
                    break
                size += len(chunk)
                if size > max_bytes:
                    raise UploadValidationError(f"视频不能超过 {settings.max_upload_mb} MB")
                out.write(chunk)
    except Exception:
        shutil.rmtree(target_dir, ignore_errors=True)
        raise

    if size == 0:
        shutil.rmtree(target_dir, ignore_errors=True)
        raise UploadValidationError("上传文件为空")

    return VideoSource(
        id=video_id,
        user_id=user.id,
        scenario="stretch",
        source=source,
        url=None,
        title=Path(upload.filename or "上传视频").stem or "上传视频",
        cover_url="",
        creator_name=None,
        duration_sec=None,
        raw_description="用户手动上传的健康视频文件",
        mime_type=content_type,
        file_size=size,
        storage_path=str(target_path),
        media_meta={"originalFilename": upload.filename, "storageDir": str(target_dir)},
        processing_status="uploaded",
    )


def _ffmpeg_bin() -> str:
    try:
        import imageio_ffmpeg

        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return "ffmpeg"


def _run_ffmpeg(args: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(args, check=False, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)


def probe_duration_seconds(video_path: Path) -> int | None:
    result = _run_ffmpeg([_ffmpeg_bin(), "-hide_banner", "-i", str(video_path)])
    output = f"{result.stdout}\n{result.stderr}"
    match = re.search(r"Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)", output)
    if not match:
        return None
    hours, minutes, seconds = match.groups()
    return int(float(seconds) + int(minutes) * 60 + int(hours) * 3600)


def extract_audio(video_path: Path, output_dir: Path) -> Path | None:
    output_path = output_dir / "audio.mp3"
    result = _run_ffmpeg(
        [
            _ffmpeg_bin(),
            "-y",
            "-i",
            str(video_path),
            "-vn",
            "-ac",
            "1",
            "-ar",
            "16000",
            "-b:a",
            "64k",
            str(output_path),
        ]
    )
    if result.returncode != 0 or not output_path.exists() or output_path.stat().st_size == 0:
        output_path.unlink(missing_ok=True)
        return None
    return output_path


def _compress_frame(path: Path) -> None:
    from PIL import Image

    with Image.open(path) as image:
        image = image.convert("RGB")
        if image.width > 720:
            height = max(2, round(image.height * (720 / image.width)))
            image = image.resize((720, height))
        image.save(path, "JPEG", quality=75, optimize=True)


def extract_keyframes(video_path: Path, output_dir: Path, max_count: int | None = None) -> list[Path]:
    settings = get_settings()
    max_frames = max(1, max_count or settings.keyframe_max_count)
    frame_dir = output_dir / "keyframes"
    frame_dir.mkdir(parents=True, exist_ok=True)

    scene_pattern = frame_dir / "scene_%03d.jpg"
    scene_filter = "select='gt(scene,0.28)',scale='min(720,iw)':-2"
    result = _run_ffmpeg(
        [
            _ffmpeg_bin(),
            "-y",
            "-i",
            str(video_path),
            "-vf",
            scene_filter,
            "-vsync",
            "vfr",
            "-frames:v",
            str(max_frames),
            str(scene_pattern),
        ]
    )
    frames = sorted(frame_dir.glob("scene_*.jpg"))
    if result.returncode != 0 or len(frames) < min(3, max_frames):
        for frame in frame_dir.glob("*.jpg"):
            frame.unlink(missing_ok=True)
        duration = probe_duration_seconds(video_path) or 30
        interval = max(1, duration // max_frames)
        uniform_pattern = frame_dir / "frame_%03d.jpg"
        _run_ffmpeg(
            [
                _ffmpeg_bin(),
                "-y",
                "-i",
                str(video_path),
                "-vf",
                f"fps=1/{interval},scale='min(720,iw)':-2",
                "-frames:v",
                str(max_frames),
                str(uniform_pattern),
            ]
        )
        frames = sorted(frame_dir.glob("frame_*.jpg"))

    frames = frames[:max_frames]
    for frame in frames:
        _compress_frame(frame)
    return frames


def extract_media_artifacts(video_path: str) -> dict:
    start = perf_counter()
    source = Path(video_path)
    output_dir = source.parent
    duration = probe_duration_seconds(source)
    audio_start = perf_counter()
    audio_path = extract_audio(source, output_dir)
    frame_start = perf_counter()
    frames = extract_keyframes(source, output_dir)
    if not frames:
        raise RuntimeError("未能从视频中抽取关键帧")
    return {
        "durationSec": duration,
        "audioPath": str(audio_path) if audio_path else None,
        "keyframePaths": [str(path) for path in frames],
        "timingsMs": {
            "audio": round((frame_start - audio_start) * 1000),
            "keyframes": round((perf_counter() - frame_start) * 1000),
            "total": round((perf_counter() - start) * 1000),
        },
    }
