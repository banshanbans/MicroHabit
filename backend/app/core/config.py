from __future__ import annotations

from functools import lru_cache
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "MicroHabit API"
    database_url: str = "postgresql+psycopg://microhabit:microhabit@127.0.0.1:5432/microhabit"
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    cors_origin_regex: str = r"http://(localhost|127\.0\.0\.1):51[0-9]{2}"
    auto_create_tables: bool = False
    volcengine_tts_api_key: Optional[str] = Field(default=None, validation_alias="VOLCENGINE_TTS_API_KEY")
    volcengine_tts_resource_id: str = Field(default="seed-tts-2.0", validation_alias="VOLCENGINE_TTS_RESOURCE_ID")
    volcengine_tts_speaker: str = Field(default="zh_female_vv_uranus_bigtts", validation_alias="VOLCENGINE_TTS_SPEAKER")
    volcengine_tts_endpoint: str = Field(
        default="https://openspeech.bytedance.com/api/v3/tts/unidirectional",
        validation_alias="VOLCENGINE_TTS_ENDPOINT",
    )
    ark_api_key: Optional[str] = Field(default=None, validation_alias="ARK_API_KEY")
    ark_base_url: str = Field(default="https://ark.cn-beijing.volces.com/api/v3", validation_alias="ARK_BASE_URL")
    ark_vision_model: str = Field(default="doubao-seed-2-0-lite-260215", validation_alias="ARK_VISION_MODEL")
    ark_audio_model: str = Field(default="doubao-seed-2-0-lite-260428", validation_alias="ARK_AUDIO_MODEL")
    storage_dir: str = Field(default="./storage", validation_alias="MICROHABIT_STORAGE_DIR")
    max_upload_mb: int = Field(default=200, validation_alias="MICROHABIT_MAX_UPLOAD_MB")
    keyframe_max_count: int = Field(default=10, validation_alias="MICROHABIT_KEYFRAME_MAX_COUNT")

    model_config = SettingsConfigDict(env_file=".env", env_prefix="MICROHABIT_")


@lru_cache
def get_settings() -> Settings:
    return Settings()
