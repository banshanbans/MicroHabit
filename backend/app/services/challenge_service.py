from __future__ import annotations

from datetime import datetime
from typing import Optional, Tuple
from uuid import uuid4

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.entities import AnalysisResult, Challenge, ChallengeDay, Checkin, HealthGraph, Reward, User
from app.services.buddy_service import apply_checkin_growth
from app.services.seed_data import BADGES, build_days, scenario_from_text
from app.services.wallet_service import add_points_transaction, ensure_legacy_wallet


def _title_for(scenario: str, duration_days: int) -> str:
    return {
        "meditation": f"{duration_days} 天专注微冥想",
        "stretch": f"{duration_days} 天身体松弛拉伸",
        "eye_yoga": f"{duration_days} 天护眼微行动",
    }[scenario]


def _default_plan(scenario: str) -> dict:
    if scenario == "meditation":
        preferred_time = "午饭后"
        preferred_place = "安静角落"
        natural_language_plan = "我想每天午饭后，在安静角落做 1 分钟呼吸觉察。"
    elif scenario == "eye_yoga":
        preferred_time = "下午看屏幕后"
        preferred_place = "书桌前"
        natural_language_plan = "我想每天看屏幕后，在书桌前做 1 分钟眼周放松。"
    else:
        preferred_time = "下班后"
        preferred_place = "卧室"
        natural_language_plan = "我想每天下班后，在卧室做 2 分钟轻拉伸。"
    return {
        "preferredTime": preferred_time,
        "preferredPlace": preferred_place,
        "reminderStyle": "gentle",
        "naturalLanguagePlan": natural_language_plan,
        "fallbackPlan": "如果今天做不到完整版本，就做 30 秒，也算完成。",
    }


def _days_from_ai_result(result: AnalysisResult | None, graph: HealthGraph, duration_days: int) -> list[dict]:
    if result is None:
        return []
    raw_days = list((result.raw_model_output or {}).get("challengeDayPlans") or [])
    if not raw_days:
        raw_days = list(((result.raw_model_output or {}).get("normalized") or {}).get("challengeDayPlans") or [])
    if not raw_days:
        return []

    title_to_node = {str(node.get("title")): node.get("id") for node in graph.nodes}
    linked_nodes = {
        node.get("linkedDay"): node.get("id")
        for node in graph.nodes
        if node.get("linkedDay") is not None and node.get("type") in {"knowledge", "action", "reflection"}
    }
    fallback_node = next((node.get("id") for node in graph.nodes if node.get("type") == "action"), graph.nodes[0]["id"])
    normalized: list[dict] = []
    for index, item in enumerate(raw_days[:duration_days]):
        day = int(item.get("day") or index + 1)
        graph_node_id = (
            item.get("graphNodeId")
            or title_to_node.get(str(item.get("graphNodeTitle")))
            or linked_nodes.get(day)
            or fallback_node
        )
        normalized.append(
            {
                "day": index + 1,
                "title": str(item.get("title") or f"Day {index + 1} 微行动"),
                "microAction": str(item.get("microAction") or result.core_micro_action.get("title") or "完成一个轻量健康动作"),
                "why": str(item.get("why") or result.why_worth_doing),
                "howTo": list(item.get("howTo") or result.action_tips or []),
                "precautions": list(item.get("precautions") or result.precautions or []),
                "graphNodeId": str(graph_node_id),
                "estimatedMinutes": int(item.get("estimatedMinutes") or result.core_micro_action.get("estimatedMinutes") or 2),
            }
        )
    while len(normalized) < duration_days:
        source = normalized[len(normalized) % max(1, len(normalized))] if normalized else {
            "title": result.core_micro_action.get("title") or "微行动",
            "microAction": result.core_micro_action.get("description") or "完成一个轻量健康动作",
            "why": result.why_worth_doing,
            "howTo": result.action_tips,
            "precautions": result.precautions,
            "graphNodeId": fallback_node,
            "estimatedMinutes": result.core_micro_action.get("estimatedMinutes") or 2,
        }
        day = len(normalized) + 1
        normalized.append({**source, "day": day, "title": f"巩固练习 {day}"})
    return normalized


def get_challenge(db: Session, challenge_id: str, user: User) -> Optional[Challenge]:
    return db.scalar(
        select(Challenge)
        .options(selectinload(Challenge.days))
        .where(Challenge.id == challenge_id, Challenge.user_id == user.id)
    )


def create_challenge(db: Session, user: User, graph_id: str, duration_days: int, plan: dict, status: str = "active") -> Challenge:
    graph = db.get(HealthGraph, graph_id)
    if graph is None:
        raise LookupError("Graph not found")

    scenario = scenario_from_text(graph_id)
    ai_result = db.scalar(select(AnalysisResult).where(AnalysisResult.graph_id == graph_id, AnalysisResult.user_id == user.id))
    existing_count = db.scalar(
        select(func.count()).select_from(Challenge).where(Challenge.user_id == user.id, Challenge.graph_id == graph_id)
    )
    suffix = (existing_count or 0) + 1
    challenge_id = f"challenge_{scenario}_{duration_days}d_{user.id[-6:]}_{suffix:03d}"
    merged_plan = {**_default_plan(scenario), **(plan or {})}
    challenge = Challenge(
        id=challenge_id,
        graph_id=graph_id,
        video_id=graph.video_id,
        user_id=user.id,
        title=f"{duration_days} 天{ai_result.theme}" if ai_result else _title_for(scenario, duration_days),
        duration_days=duration_days,
        status=status,
        current_day=1,
        started_at=datetime.utcnow() if status == "active" else None,
        plan=merged_plan,
        progress={"completedDays": 0, "totalDays": duration_days, "completedNodeIds": []},
    )
    db.add(challenge)
    day_payloads = _days_from_ai_result(ai_result, graph, duration_days) or build_days(scenario, duration_days)
    for payload in day_payloads:
        db.add(
            ChallengeDay(
                challenge_id=challenge_id,
                day=payload["day"],
                title=payload["title"],
                micro_action=payload["microAction"],
                why=payload["why"],
                how_to=payload["howTo"],
                precautions=payload["precautions"],
                graph_node_id=payload["graphNodeId"],
                estimated_minutes=payload["estimatedMinutes"],
                status="today" if status == "active" and payload["day"] == 1 else "locked",
            )
        )
    db.commit()
    return get_challenge(db, challenge_id, user)  # type: ignore[return-value]


def start_challenge(db: Session, user: User, challenge_id: str) -> Challenge:
    challenge = get_challenge(db, challenge_id, user)
    if challenge is None:
        raise LookupError("Challenge not found")
    if challenge.status == "completed":
        return challenge
    challenge.status = "active"
    challenge.started_at = challenge.started_at or datetime.utcnow()
    challenge.current_day = max(1, challenge.current_day)
    for day in challenge.days:
        if day.day < challenge.current_day:
            day.status = "completed"
        elif day.day == challenge.current_day:
            day.status = "today"
        else:
            day.status = "locked"
    db.commit()
    return get_challenge(db, challenge_id, user)  # type: ignore[return-value]


def list_challenges(db: Session, user: User) -> list[Challenge]:
    return list(
        db.scalars(
            select(Challenge)
            .options(selectinload(Challenge.days))
            .where(Challenge.user_id == user.id)
            .order_by(Challenge.started_at.desc())
        )
    )


def complete_checkin(db: Session, user: User, challenge_id: str, day: int, completed_type: str, optional_note: Optional[str]) -> Tuple[Checkin, Challenge, Optional[dict]]:
    challenge = get_challenge(db, challenge_id, user)
    if challenge is None:
        raise LookupError("Challenge not found")
    if challenge.status not in {"active", "paused"}:
        raise ValueError("Challenge is not active")

    completed_day = min(day or challenge.current_day, challenge.duration_days)
    existing = db.scalar(select(Checkin).where(Checkin.challenge_id == challenge_id, Checkin.day == completed_day))
    if existing:
        return existing, challenge, None

    day_model = next((item for item in challenge.days if item.day == completed_day), None)
    if day_model is None:
        raise LookupError("Challenge day not found")

    encouragement = (
        "做不到完整版本也没关系，30 秒也是一次有效的开始。你已经让这个节点亮了一点光。"
        if completed_type == "tiny"
        else "今天不是完成了一个任务，而是让身体记住了一次被温柔照顾的感觉。"
    )
    points = 8 if completed_type == "tiny" else 15
    ensure_legacy_wallet(db, user)
    checkin = Checkin(
        id=f"checkin_{challenge_id}_{completed_day}",
        challenge_id=challenge_id,
        user_id=user.id,
        day=completed_day,
        graph_node_id=day_model.graph_node_id,
        completed_type=completed_type,
        optional_note=optional_note,
        encouragement=encouragement,
        points=points,
    )
    db.add(checkin)

    next_day = completed_day + 1 if completed_day < challenge.duration_days else None
    completed_node_ids = list(dict.fromkeys([*challenge.progress.get("completedNodeIds", []), day_model.graph_node_id]))
    for item in challenge.days:
        if item.day <= completed_day:
            item.status = "completed"
        elif next_day and item.day == next_day:
            item.status = "today"
        else:
            item.status = "locked"
    challenge.current_day = next_day or completed_day
    challenge.status = "active" if next_day else "completed"
    challenge.completed_at = None if next_day else datetime.utcnow()
    challenge.progress = {"completedDays": max(challenge.progress.get("completedDays", 0), completed_day), "totalDays": challenge.duration_days, "completedNodeIds": completed_node_ids}
    db.add(Reward(id=f"reward_{uuid4().hex[:16]}", user_id=user.id, challenge_id=challenge_id, badge_name=None, points=points, reason=f"checkin_day_{completed_day}"))
    add_points_transaction(
        db,
        user,
        points,
        f"checkin_day_{completed_day}",
        checkin.id,
        {"challengeId": challenge_id, "completedType": completed_type},
    )
    growth = apply_checkin_growth(db, user, challenge_id, completed_type)
    if not next_day:
        scenario = scenario_from_text(challenge.graph_id)
        db.add(Reward(id=f"reward_{uuid4().hex[:16]}", user_id=user.id, challenge_id=challenge_id, badge_name=BADGES[scenario], points=120, reason="challenge_completed"))
        add_points_transaction(
            db,
            user,
            120,
            "challenge_completed",
            challenge_id,
            {"badgeName": BADGES[scenario]},
        )
    db.commit()
    db.refresh(checkin)
    fresh = get_challenge(db, challenge_id, user)
    return checkin, fresh, growth  # type: ignore[return-value]
