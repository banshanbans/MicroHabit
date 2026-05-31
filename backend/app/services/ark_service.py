from __future__ import annotations

import base64
import json
import re
from pathlib import Path
from typing import Any

import httpx

from app.core.config import get_settings


PROMPT_VERSION = "doubao_upload_v1"


class ArkNotConfigured(RuntimeError):
    pass


class ArkResponseError(RuntimeError):
    pass


def _format_ark_error(response: httpx.Response, model: str) -> str:
    try:
        payload = response.json()
    except json.JSONDecodeError:
        return f"豆包模型请求失败：HTTP {response.status_code}"
    error = payload.get("error") if isinstance(payload, dict) else None
    if not isinstance(error, dict):
        return f"豆包模型请求失败：HTTP {response.status_code}"
    code = str(error.get("code") or "")
    message = str(error.get("message") or "")
    if code == "ModelNotOpen":
        return f"豆包模型未开通：{model}。请在火山方舟控制台开通该模型，或把 .env 中的 ARK_*_MODEL 改成已开通的模型/接入点 ID。"
    if message:
        return f"豆包模型请求失败：{code or 'ArkError'}，{message}"
    return f"豆包模型请求失败：HTTP {response.status_code}"


def _extract_json(text: str) -> dict[str, Any]:
    cleaned = text.strip()
    fence = re.search(r"```(?:json)?\s*(.*?)```", cleaned, flags=re.DOTALL | re.IGNORECASE)
    if fence:
        cleaned = fence.group(1).strip()
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start >= 0 and end > start:
        cleaned = cleaned[start : end + 1]
    return json.loads(cleaned)


def _image_data_url(path: str) -> str:
    data = base64.b64encode(Path(path).read_bytes()).decode("ascii")
    return f"data:image/jpeg;base64,{data}"


class ArkClientService:
    def __init__(self) -> None:
        self.settings = get_settings()
        if not self.settings.ark_api_key:
            raise ArkNotConfigured("未配置 ARK_API_KEY，无法分析上传视频")
        self.base_url = self.settings.ark_base_url.rstrip("/")
        self.headers = {"Authorization": f"Bearer {self.settings.ark_api_key}"}

    def _chat(self, model: str, messages: list[dict[str, Any]], temperature: float = 0.2, json_response: bool = True) -> str:
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
        }
        if json_response:
            payload["response_format"] = {"type": "json_object"}
        with httpx.Client(timeout=90) as client:
            response = client.post(f"{self.base_url}/chat/completions", headers=self.headers, json=payload)
        if response.status_code >= 400:
            raise ArkResponseError(_format_ark_error(response, model))
        data = response.json()
        try:
            return data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise ArkResponseError("豆包模型返回格式异常") from exc

    def upload_file(self, path: str, purpose: str = "assistants") -> str | None:
        with httpx.Client(timeout=60) as client:
            with Path(path).open("rb") as file_obj:
                response = client.post(
                    f"{self.base_url}/files",
                    headers=self.headers,
                    data={"purpose": purpose},
                    files={"file": (Path(path).name, file_obj, "audio/mpeg")},
                )
        if response.status_code >= 400:
            return None
        data = response.json()
        return data.get("id") or data.get("file_id")

    def transcribe_audio(self, audio_path: str | None) -> dict[str, Any]:
        if not audio_path:
            return {"transcript": "", "healthKeywords": [], "riskNotes": [], "fileId": None}

        file_id = self.upload_file(audio_path)
        file_part: dict[str, Any]
        if file_id:
            file_part = {"type": "file", "file": {"file_id": file_id}}
        else:
            encoded = base64.b64encode(Path(audio_path).read_bytes()).decode("ascii")
            file_part = {"type": "input_audio", "input_audio": {"data": encoded, "format": "mp3"}}

        content = [
            file_part,
            {
                "type": "text",
                "text": (
                    "请转写这段健康类短视频音频，并输出严格 JSON："
                    "{\"transcript\":\"完整中文转写\",\"healthKeywords\":[\"关键词\"],"
                    "\"riskNotes\":[\"需要谨慎表达的风险点\"]}。不要输出 JSON 以外的文字。"
                ),
            },
        ]
        text = self._chat(self.settings.ark_audio_model, [{"role": "user", "content": content}], temperature=0, json_response=False)
        data = _extract_json(text)
        return {
            "transcript": str(data.get("transcript") or ""),
            "healthKeywords": list(data.get("healthKeywords") or []),
            "riskNotes": list(data.get("riskNotes") or []),
            "fileId": file_id,
            "raw": data,
        }

    def analyze_frames(self, keyframe_paths: list[str], transcript_payload: dict[str, Any]) -> dict[str, Any]:
        frame_parts = [{"type": "image_url", "image_url": {"url": _image_data_url(path)}} for path in keyframe_paths]
        schema_prompt = (
            "你是健康微习惯产品的内容分析器。根据关键帧和音频转写，提取适合普通用户执行的低风险健康微行动。"
            "只输出严格 JSON，不要 Markdown。字段："
            "scenario: meditation|stretch|eye_yoga 中最接近的一项；"
            "theme, summary, coreMicroAction{title,description,estimatedMinutes}, whyWorthDoing,"
            "actionTips[], useCases[], precautions[],"
            "risk{level:low|medium|high,label,message,reasons[],allowedToGenerateChallenge,saferAlternative},"
            "recommendedDuration: 7|15|21,"
            "graph{title,description,nodes[{type:topic|knowledge|action|reflection,title,description,linkedDay}],edges[]},"
            "challengeDayPlans[{day,title,microAction,why,howTo[],precautions[],graphNodeTitle,estimatedMinutes}]。"
            "图谱节点总数限制 6-9 个，必须包含 topic、knowledge、action、reflection。"
            "topic 节点 linkedDay 必须为 null；其他节点 linkedDay 必须从 1 开始递增且不能重复。"
            "graph.description 只描述内容主题，不要解释图谱结构、不要出现“中心/外圈/路径/节点”等界面说明。"
            "不要承诺治疗、减肥、变美或替代医疗建议；有疼痛、眩晕、眼痛、心理明显不适时要提示停止并咨询专业人士。"
        )
        text_content = {
            "type": "text",
            "text": (
                f"{schema_prompt}\n\n音频转写：{transcript_payload.get('transcript') or '无音频'}\n"
                f"健康关键词：{json.dumps(transcript_payload.get('healthKeywords') or [], ensure_ascii=False)}\n"
                f"风险提示：{json.dumps(transcript_payload.get('riskNotes') or [], ensure_ascii=False)}"
            ),
        }
        text = self._chat(
            self.settings.ark_vision_model,
            [{"role": "user", "content": [text_content, *frame_parts]}],
            temperature=0.2,
        )
        try:
            return _extract_json(text)
        except json.JSONDecodeError:
            repair = self._chat(
                self.settings.ark_vision_model,
                [
                    {
                        "role": "user",
                        "content": (
                            "下面内容应为 JSON 但格式损坏。请只修复成合法 JSON，不要改变含义，不要输出解释：\n"
                            f"{text}"
                        ),
                    }
                ],
                temperature=0,
            )
            return _extract_json(repair)


def normalize_ai_payload(raw: dict[str, Any], video_id: str, graph_id: str) -> dict[str, Any]:
    graph_payload = raw.get("graph") or {}
    raw_nodes = list(graph_payload.get("nodes") or [])
    topic = next((node for node in raw_nodes if node.get("type") == "topic"), None) or {
        "type": "topic",
        "title": raw.get("theme") or "健康微行动",
        "description": raw.get("summary") or "",
    }
    non_topic_nodes = [node for node in raw_nodes if node is not topic and node.get("type") != "topic"]
    if not any(node.get("type") == "knowledge" for node in non_topic_nodes):
        non_topic_nodes.insert(0, {"type": "knowledge", "title": "视频要点", "description": raw.get("summary") or "识别视频中的健康建议。"})
    if not any(node.get("type") == "action" for node in non_topic_nodes):
        core = raw.get("coreMicroAction") or {}
        non_topic_nodes.append({"type": "action", "title": core.get("title") or "开始微行动", "description": core.get("description") or "完成一个轻量健康动作。"})
    if not any(node.get("type") == "reflection" for node in non_topic_nodes):
        non_topic_nodes.append({"type": "reflection", "title": "行动复盘", "description": "记录最容易发生的场景和身体反馈。"})

    nodes = [topic, *non_topic_nodes[:7]]
    positions = [
        (50, 50),
        (26, 20),
        (70, 20),
        (78, 45),
        (72, 70),
        (50, 82),
        (22, 70),
        (50, 16),
        (20, 44),
    ]
    normalized_nodes = []
    seen: set[str] = set()
    for index, node in enumerate(nodes):
        title = str(node.get("title") or f"节点 {index + 1}").strip()
        node_type = node.get("type") if node.get("type") in {"topic", "knowledge", "action", "reflection", "reward"} else "action"
        slug = re.sub(r"[^a-zA-Z0-9]+", "_", title).strip("_").lower() or f"node_{index + 1}"
        node_id = f"{graph_id}_{slug[:28]}"
        if node_id in seen:
            node_id = f"{node_id}_{index + 1}"
        seen.add(node_id)
        x, y = positions[index]
        normalized_nodes.append(
            {
                "id": node_id,
                "type": node_type,
                "title": title,
                "description": str(node.get("description") or ""),
                "status": "active" if node_type == "topic" else "locked",
                "position": {"x": x, "y": y},
                "linkedDay": None if node_type == "topic" else index,
            }
        )

    topic_id = next((node["id"] for node in normalized_nodes if node["type"] == "topic"), normalized_nodes[0]["id"])
    edges = [
        {"id": f"{graph_id}_edge_{index}", "source": topic_id, "target": node["id"], "status": "inactive"}
        for index, node in enumerate(normalized_nodes)
        if node["id"] != topic_id
    ]

    scenario = raw.get("scenario") if raw.get("scenario") in {"meditation", "stretch", "eye_yoga"} else "stretch"
    recommended_duration = raw.get("recommendedDuration") if raw.get("recommendedDuration") in {7, 15, 21} else 7
    risk = raw.get("risk") or {}
    core = raw.get("coreMicroAction") or {}
    return {
        "videoId": video_id,
        "scenario": scenario,
        "theme": str(raw.get("theme") or "健康微行动"),
        "summary": str(raw.get("summary") or "AI 已根据上传视频提取出适合低门槛执行的健康微行动。"),
        "coreMicroAction": {
            "title": str(core.get("title") or "每天完成一次低门槛健康微行动"),
            "description": str(core.get("description") or "选择一个轻量动作，按身体反馈调整。"),
            "estimatedMinutes": int(core.get("estimatedMinutes") or 2),
        },
        "whyWorthDoing": str(raw.get("whyWorthDoing") or "把视频内容拆成小行动后，更容易在真实生活中稳定发生。"),
        "actionTips": list(raw.get("actionTips") or ["保持低强度", "不适时停止", "从 30 秒版本开始也算完成"]),
        "useCases": list(raw.get("useCases") or ["午休后", "下班后", "睡前"]),
        "precautions": list(raw.get("precautions") or ["该内容不替代医疗建议；如有明显不适请停止并咨询专业人士。"]),
        "risk": {
            "level": risk.get("level") if risk.get("level") in {"low", "medium", "high"} else "medium",
            "label": str(risk.get("label") or "中风险提示"),
            "message": str(risk.get("message") or "请按自身状态选择低强度版本，不适时停止。"),
            "reasons": list(risk.get("reasons") or ["来自视频内容的健康建议需要保留安全边界"]),
            "allowedToGenerateChallenge": bool(risk.get("allowedToGenerateChallenge", True)),
            "saferAlternative": risk.get("saferAlternative"),
        },
        "graphId": graph_id,
        "recommendedDuration": recommended_duration,
        "graph": {
            "id": graph_id,
            "videoId": video_id,
            "title": str(graph_payload.get("title") or raw.get("theme") or "健康微行动图谱"),
            "description": str(raw.get("summary") or graph_payload.get("description") or ""),
            "nodes": normalized_nodes,
            "edges": edges,
        },
        "challengeDayPlans": list(raw.get("challengeDayPlans") or []),
    }
