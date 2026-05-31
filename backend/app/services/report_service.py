from __future__ import annotations

from collections import Counter

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.entities import Challenge, Checkin, ReviewReport, User
from app.services.seed_data import BADGES, scenario_from_text


def build_report_payload(challenge: Challenge, checkins: list[Checkin]) -> dict:
    scenario = scenario_from_text(challenge.graph_id)
    completed_days = challenge.progress.get("completedDays", 0)
    completed_nodes = [
        {"id": day.graph_node_id, "title": day.title, "type": "reflection" if "复盘" in day.title else "action"}
        for day in challenge.days
        if day.status == "completed"
    ]
    meta = _scenario_meta(scenario)
    full_count = sum(1 for checkin in checkins if checkin.completed_type == "full")
    tiny_count = sum(1 for checkin in checkins if checkin.completed_type == "tiny")
    notes = [checkin.optional_note for checkin in checkins if checkin.optional_note]
    time_buckets = [_time_bucket(checkin.created_at.hour) for checkin in checkins]
    favorite_bucket = Counter(time_buckets).most_common(1)[0][0] if time_buckets else "还没有稳定时段"
    newest_note = notes[0] if notes else None
    strongest_scene = challenge.plan.get("preferredTime") or meta["scene"]
    easiest_action = _easiest_action(challenge, checkins, scenario)
    completion_rate = round(len(checkins) / challenge.duration_days, 2) if challenge.duration_days else 0
    return {
        "id": f"report_{challenge.id}",
        "reportVersion": 2,
        "challengeId": challenge.id,
        "title": f"你完成了{meta['label']}挑战",
        "completedDays": completed_days,
        "totalDays": challenge.duration_days,
        "completedNodes": completed_nodes,
        "strongestExecutionScene": strongest_scene,
        "easiestAction": easiest_action,
        "interruptionMoment": meta["interruption"],
        "aiFeedback": _feedback(meta["anchor"], full_count, tiny_count, newest_note),
        "personalizedStats": {
            "fullCheckins": full_count,
            "tinyCheckins": tiny_count,
            "favoriteCheckinTime": favorite_bucket,
            "completionRate": completion_rate,
        },
        "realMoments": [
            {
                "id": checkin.id,
                "day": checkin.day,
                "completedType": checkin.completed_type,
                "optionalNote": checkin.optional_note,
                "createdAt": checkin.created_at.isoformat(),
            }
            for checkin in checkins[:3]
        ],
        "reward": {
            "badgeName": BADGES[scenario],
            "badgeDescription": "完成微行动路径后获得",
            "points": 120 if challenge.status == "completed" else completed_days * 15,
            "skinUnlocked": "微光薄荷节点皮肤" if challenge.status == "completed" else None,
        },
        "nextRecommendations": _next_recommendations(challenge, checkins, scenario, strongest_scene, easiest_action, completion_rate, newest_note),
    }


def get_report(db: Session, user: User, challenge: Challenge) -> dict:
    checkins = list(
        db.scalars(
            select(Checkin)
            .where(Checkin.challenge_id == challenge.id, Checkin.user_id == user.id)
            .order_by(Checkin.created_at.desc())
        )
    )
    existing = db.scalar(select(ReviewReport).where(ReviewReport.challenge_id == challenge.id, ReviewReport.user_id == user.id))
    if existing and challenge.status == "completed" and existing.payload.get("reportVersion") == 2:
        return existing.payload
    payload = build_report_payload(challenge, checkins)
    if challenge.status == "completed":
        if existing:
            existing.payload = payload
        else:
            db.add(ReviewReport(id=payload["id"], challenge_id=challenge.id, user_id=user.id, payload=payload))
        db.commit()
    return payload


def _time_bucket(hour: int) -> str:
    if 5 <= hour < 11:
        return "上午"
    if 11 <= hour < 14:
        return "午间"
    if 14 <= hour < 18:
        return "下午"
    if 18 <= hour < 23:
        return "晚间"
    return "夜间"


def _feedback(anchor: str, full_count: int, tiny_count: int, newest_note: str | None) -> str:
    tiny_part = f"其中 {tiny_count} 次选择了 30 秒版本，这说明你会把动作缩小到能完成。" if tiny_count else "你大多完成了完整版本，说明这个动作已经比较贴近日常节奏。"
    note_part = f"你最近写下「{newest_note}」，这会成为下一轮调整计划的重要线索。" if newest_note else "下一轮可以试着留下一句备注，帮助你找到最稳定的执行场景。"
    return f"你最稳定完成的是{anchor}，一共记录了 {full_count + tiny_count} 次真实行动。{tiny_part}{note_part}"


def _easiest_action(challenge: Challenge, checkins: list[Checkin], scenario: str) -> str:
    checked_days = {checkin.day for checkin in checkins}
    if checked_days:
        first_completed = next((day for day in challenge.days if day.day in checked_days), None)
        if first_completed:
            return first_completed.title
    return _scenario_meta(scenario)["fallback_action"]


def _next_recommendations(
    challenge: Challenge,
    checkins: list[Checkin],
    scenario: str,
    strongest_scene: str,
    easiest_action: str,
    completion_rate: float,
    newest_note: str | None,
) -> list[dict]:
    labels = {"meditation": "专注微冥想", "stretch": "身体松弛拉伸", "eye_yoga": "护眼微行动"}
    adjacent = {
        "meditation": ("eye_yoga", "专注练习之后，下一轮可以照顾长时间看屏幕后的眼睛"),
        "stretch": ("meditation", "身体松开后，很适合接一个低压的专注恢复"),
        "eye_yoga": ("stretch", "眼睛休息之后，可以把屏幕紧绷延伸到肩背和腰背放松"),
    }
    switch_to = {"meditation": "stretch", "stretch": "eye_yoga", "eye_yoga": "meditation"}
    unfinished = next((day for day in challenge.days if day.status != "completed" and day.day > len(checkins)), None)
    full_count = sum(1 for checkin in checkins if checkin.completed_type == "full")
    tiny_count = sum(1 for checkin in checkins if checkin.completed_type == "tiny")

    continue_days = 3 if completion_rate < 0.5 else 7
    continue_description = (
        f"继续把「{easiest_action}」放在{strongest_scene}，先跑 {continue_days} 天，不增加动作难度。"
        if checkins
        else f"先从{strongest_scene}开始，只保留一个最小动作，完成一次就算进入下一轮。"
    )

    if unfinished:
        related_title = f"补点亮「{unfinished.title}」"
        related_description = f"当前路径还差这个节点；把它拆成「{unfinished.micro_action}」会比重新开始更轻。"
    else:
        related_scenario, reason = adjacent[scenario]
        related_title = f"解锁「{labels[related_scenario]}」视频"
        related_description = reason + "。"

    switch_scenario = switch_to[scenario]
    switch_description = (
        f"如果{strongest_scene}最近不稳定，可以换到「{labels[switch_scenario]}」场景，保留 1 分钟版本。"
        if completion_rate < 0.7
        else f"你已经完成得比较稳定，可以换到「{labels[switch_scenario]}」扩展另一类生活场景。"
    )

    light_reason = "你最近更常用 30 秒版本" if tiny_count > full_count else "你已经找到可完成的入口"
    if newest_note:
        light_reason = f"你提到「{newest_note}」"
    light_description = f"{light_reason}，适合改成每周一次的轻提醒，避免把微习惯变成压力。"

    return [
        {"id": f"continue_{challenge.id}", "title": f"延续「{easiest_action}」", "description": continue_description, "type": "continue"},
        {"id": f"related_{scenario}", "title": related_title, "description": related_description, "type": "related_video"},
        {"id": f"switch_{switch_scenario}", "title": f"切到「{labels[switch_scenario]}」", "description": switch_description, "type": "related_node"},
        {"id": f"light_{challenge.id}", "title": "保留低压轻提醒", "description": light_description, "type": "light_reminder"},
    ]


def _scenario_meta(scenario: str) -> dict:
    return {
        "meditation": {
            "label": "专注微冥想",
            "scene": "午饭后安静角落",
            "interruption": "临时消息打断后的重新开始",
            "anchor": "短呼吸觉察",
            "fallback_action": "呼吸节奏",
        },
        "stretch": {
            "label": "身体松弛拉伸",
            "scene": "下班后卧室",
            "interruption": "下午连续久坐之后",
            "anchor": "小幅度转体",
            "fallback_action": "扣膝转体",
        },
        "eye_yoga": {
            "label": "护眼微行动",
            "scene": "下午看屏幕后",
            "interruption": "长时间刷屏之后",
            "anchor": "远眺和眨眼恢复",
            "fallback_action": "远眺 20 秒",
        },
    }[scenario]
