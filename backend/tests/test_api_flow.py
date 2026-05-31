import os
import sys
import base64
from pathlib import Path
from types import SimpleNamespace
from uuid import uuid4


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "backend"))
os.environ["MICROHABIT_DATABASE_URL"] = f"sqlite:////private/tmp/microhabit_pytest_{uuid4().hex}.db"
os.environ["MICROHABIT_AUTO_CREATE_TABLES"] = "true"

from fastapi.testclient import TestClient  # noqa: E402

from app.api.routes import companion  # noqa: E402
from app.db.session import SessionLocal  # noqa: E402
from app.main import app  # noqa: E402
from app.services import tts_service  # noqa: E402
from app.services.tts_service import TTSNotConfigured  # noqa: E402


def test_anonymous_user_is_reused_for_device_id():
    headers = {"X-Device-Id": "pytest-device-reuse"}
    with TestClient(app) as client:
        first = client.post("/api/users/anonymous", headers=headers)
        second = client.post("/api/users/anonymous", headers=headers)

    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json()["id"] == second.json()["id"]


def test_main_flow_for_all_scenarios_and_checkin_idempotency():
    with TestClient(app) as client:
        for scenario in ["meditation", "stretch", "eye_yoga"]:
            headers = {"X-Device-Id": f"pytest-device-{scenario}"}

            video = client.post("/api/videos/parse", json={"scenario": scenario}, headers=headers)
            assert video.status_code == 200
            assert video.json()["scenario"] == scenario

            analysis_task = client.post("/api/analysis", json={"videoId": video.json()["id"]}, headers=headers)
            assert analysis_task.status_code == 200
            assert analysis_task.json()["status"] == "completed"

            analysis = client.get(f"/api/analysis/{analysis_task.json()['analysisId']}", headers=headers)
            assert analysis.status_code == 200
            assert analysis.json()["scenario"] == scenario

            graph = client.get(f"/api/graphs/{analysis.json()['graphId']}", headers=headers)
            assert graph.status_code == 200

            challenge = client.post(
                "/api/challenges",
                json={"graphId": graph.json()["id"], "durationDays": 7, "plan": {"preferredTime": "午饭后"}},
                headers=headers,
            )
            assert challenge.status_code == 200
            challenge_id = challenge.json()["challengeId"]

            first_checkin = client.post(
                "/api/checkins",
                json={"challengeId": challenge_id, "day": 1, "completedType": "full"},
                headers=headers,
            )
            duplicate_checkin = client.post(
                "/api/checkins",
                json={"challengeId": challenge_id, "day": 1, "completedType": "tiny"},
                headers=headers,
            )
            assert first_checkin.status_code == 200
            assert duplicate_checkin.status_code == 200
            assert first_checkin.json()["checkinId"] == duplicate_checkin.json()["checkinId"]
            assert first_checkin.json()["points"] == duplicate_checkin.json()["points"]

            saved_challenge = client.get(f"/api/challenges/{challenge_id}", headers=headers)
            assert saved_challenge.status_code == 200
            assert saved_challenge.json()["progress"]["completedDays"] == 1

            report = client.get(f"/api/reports/{challenge_id}", headers=headers)
            assert report.status_code == 200
            assert report.json()["challengeId"] == challenge_id
            assert report.json()["reportVersion"] == 2
            assert report.json()["nextRecommendations"][0]["title"] != "继续挑战"


def test_parse_url_requires_manual_video_upload():
    with TestClient(app) as client:
        response = client.post(
            "/api/videos/parse",
            json={"url": "https://v.douyin.com/example"},
            headers={"X-Device-Id": "pytest-url-blocked"},
        )

    assert response.status_code == 400
    assert "请上传" in response.json()["detail"]


def test_upload_video_accepts_supported_file_and_rejects_other_types():
    headers = {"X-Device-Id": "pytest-upload-device"}
    with TestClient(app) as client:
        rejected = client.post(
            "/api/videos/upload",
            files={"file": ("notes.txt", b"not a video", "text/plain")},
            headers=headers,
        )
        accepted = client.post(
            "/api/videos/upload",
            files={"file": ("clip.mp4", b"fake mp4 bytes", "video/mp4")},
            data={"source": "douyin_upload"},
            headers=headers,
        )

    assert rejected.status_code == 400
    assert accepted.status_code == 200
    assert accepted.json()["source"] == "douyin_upload"
    assert accepted.json()["fileSize"] == len(b"fake mp4 bytes")
    assert accepted.json()["processingStatus"] == "uploaded"


def test_profile_reflects_empty_and_active_goal():
    headers = {"X-Device-Id": "pytest-profile-device"}
    with TestClient(app) as client:
        empty_profile = client.get("/api/profile/me", headers=headers)
        assert empty_profile.status_code == 200
        assert empty_profile.json()["todayGoal"]["state"] == "empty"

        video = client.post("/api/videos/parse", json={"scenario": "stretch"}, headers=headers)
        analysis_task = client.post("/api/analysis", json={"videoId": video.json()["id"]}, headers=headers)
        analysis = client.get(f"/api/analysis/{analysis_task.json()['analysisId']}", headers=headers)
        challenge = client.post(
            "/api/challenges",
            json={"graphId": analysis.json()["graphId"], "durationDays": 7, "plan": {"preferredTime": "午饭后"}},
            headers=headers,
        )
        profile = client.get("/api/profile/me", headers=headers)

    assert challenge.status_code == 200
    assert profile.status_code == 200
    assert profile.json()["todayGoal"]["state"] == "active"
    assert profile.json()["todayGoal"]["challengeId"] == challenge.json()["challengeId"]
    assert "stats" in profile.json()
    assert profile.json()["badges"]["upcoming"][0]["condition"] != "本周收集 180 点微光"


def test_wallet_buddy_growth_nursery_and_garden_flow():
    headers = {"X-Device-Id": "pytest-glow-buddy-device"}
    with TestClient(app) as client:
        video = client.post("/api/videos/parse", json={"scenario": "stretch"}, headers=headers)
        analysis_task = client.post("/api/analysis", json={"videoId": video.json()["id"]}, headers=headers)
        analysis = client.get(f"/api/analysis/{analysis_task.json()['analysisId']}", headers=headers)
        challenge = client.post(
            "/api/challenges",
            json={"graphId": analysis.json()["graphId"], "durationDays": 7, "plan": {"preferredTime": "午饭后"}},
            headers=headers,
        )
        challenge_id = challenge.json()["challengeId"]

        latest = None
        for day in range(1, 6):
            latest = client.post(
                "/api/checkins",
                json={"challengeId": challenge_id, "day": day, "completedType": "full"},
                headers=headers,
            )
            assert latest.status_code == 200

        assert latest is not None
        payload = latest.json()
        assert payload["wallet"]["balance"] == 75
        assert payload["buddyGrowth"]["current"]["status"] == "matured"
        assert payload["mintedBuddy"]["name"] == "发光小芽"

        buddies = client.get("/api/buddies/me", headers=headers)
        wallet = client.get("/api/wallet/me", headers=headers)
        draw = client.post("/api/nursery/draw", headers=headers)
        seedling_id = draw.json()["seedling"]["id"]
        planted = client.post("/api/buddies/plant", json={"seedlingId": seedling_id}, headers=headers)

    assert buddies.status_code == 200
    assert len(buddies.json()["collection"]) == 1
    assert buddies.json()["active"] is None
    assert wallet.status_code == 200
    assert wallet.json()["balance"] == 75
    assert draw.status_code == 200
    assert draw.json()["wallet"]["balance"] == 15
    assert planted.status_code == 200
    assert planted.json()["active"]["seedlingId"] == seedling_id


def test_saved_challenge_can_be_started():
    headers = {"X-Device-Id": "pytest-saved-device"}
    with TestClient(app) as client:
        video = client.post("/api/videos/parse", json={"scenario": "eye_yoga"}, headers=headers)
        analysis_task = client.post("/api/analysis", json={"videoId": video.json()["id"]}, headers=headers)
        analysis = client.get(f"/api/analysis/{analysis_task.json()['analysisId']}", headers=headers)
        challenge = client.post(
            "/api/challenges",
            json={"graphId": analysis.json()["graphId"], "durationDays": 7, "plan": {}, "status": "saved"},
            headers=headers,
        )
        challenge_id = challenge.json()["challengeId"]
        saved = client.get(f"/api/challenges/{challenge_id}", headers=headers)
        started = client.post(f"/api/challenges/{challenge_id}/start", headers=headers)

    assert saved.status_code == 200
    assert saved.json()["status"] == "saved"
    assert saved.json()["days"][0]["status"] == "locked"
    assert started.status_code == 200
    assert started.json()["status"] == "active"
    assert started.json()["days"][0]["status"] == "today"


def test_companion_speak_returns_503_when_tts_is_not_configured(monkeypatch):
    def fake_synthesize(db, user, device_id: str, intent: str = "daily_goal") -> tuple[bytes, str]:
        del intent
        raise TTSNotConfigured("not configured")

    monkeypatch.setattr(companion, "synthesize_companion_speech", fake_synthesize)
    with TestClient(app) as client:
        response = client.post("/api/companion/speak", json={"intent": "daily_goal"}, headers={"X-Device-Id": "pytest-voice-503"})

    assert response.status_code == 503
    assert response.json()["detail"]["message"] == "语音暂时不可用"
    assert response.json()["detail"]["text"]


def test_companion_speak_returns_audio_with_text_header(monkeypatch):
    def fake_synthesize(db, user, device_id: str, intent: str = "daily_goal") -> tuple[bytes, str]:
        del intent
        return b"fake-mp3", "今天不用很厉害。"

    monkeypatch.setattr(companion, "synthesize_companion_speech", fake_synthesize)
    with TestClient(app) as client:
        response = client.post("/api/companion/speak", json={"intent": "daily_goal"}, headers={"X-Device-Id": "pytest-voice-ok"})

    assert response.status_code == 200
    assert response.headers["content-type"] == "audio/mpeg"
    assert response.headers["x-companion-text"]
    assert response.content == b"fake-mp3"


def test_companion_speak_supports_analysis_waiting_intent(monkeypatch):
    seen: list[str] = []

    def fake_synthesize(db, user, device_id: str, intent: str = "daily_goal") -> tuple[bytes, str]:
        seen.append(intent)
        return b"waiting-mp3", "图谱快长出来了。"

    monkeypatch.setattr(companion, "synthesize_companion_speech", fake_synthesize)
    with TestClient(app) as client:
        response = client.post(
            "/api/companion/speak",
            json={"intent": "analysis_waiting"},
            headers={"X-Device-Id": "pytest-voice-waiting"},
        )

    assert response.status_code == 200
    assert seen == ["analysis_waiting"]
    assert response.headers["x-companion-text"]
    assert response.content == b"waiting-mp3"


def test_tts_speech_reuses_database_cache(monkeypatch):
    calls: list[str] = []

    class FakeClient:
        def __init__(self, timeout: int):
            self.timeout = timeout

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc, traceback):
            return False

        def post(self, url, json, headers):
            calls.append(json["req_params"]["text"])
            return tts_service.httpx.Response(
                200,
                json={"code": 0, "data": base64.b64encode(b"cached-mp3").decode("ascii")},
            )

    monkeypatch.setattr(
        tts_service,
        "get_settings",
        lambda: SimpleNamespace(
            volcengine_tts_api_key="test-key",
            volcengine_tts_resource_id="seed-tts-2.0",
            volcengine_tts_speaker="zh_female_vv_uranus_bigtts",
            volcengine_tts_endpoint="https://example.test/tts",
        ),
    )
    monkeypatch.setattr(tts_service.httpx, "Client", FakeClient)

    with SessionLocal() as db:
        first = tts_service.synthesize_speech(db, "pytest-cache-device", "今天慢慢来。")
        second = tts_service.synthesize_speech(db, "pytest-cache-device", "今天慢慢来。")

    assert first == b"cached-mp3"
    assert second == b"cached-mp3"
    assert calls == ["今天慢慢来。"]
