from __future__ import annotations

from datetime import date, datetime, timedelta
from collections import Counter

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.entities import Challenge, Checkin, PointsTransaction, Reward, User
from app.services.buddy_service import get_buddies_summary
from app.services.seed_data import BADGES, scenario_from_text
from app.services.wallet_service import get_wallet_summary


TONE_CYCLE = ["mint", "coral", "blue"]
COMPANION_WARM_LINES = [
    "今天不用很厉害，只要轻轻开始一下，小芽就会为你亮起来。",
    "你已经在照顾自己了，哪怕只是三十秒，也是一束很真实的微光。",
    "慢一点也没关系。能回来看看自己，就已经是很温柔的前进。",
    "把今天的动作缩小到刚刚好，我们先完成最不费力的那一步。",
    "小芽在这里陪你。今天不求完美，只要给自己一个小小的回应。",
]


def build_profile(db: Session, user: User) -> dict:
    challenges = list(
        db.scalars(
            select(Challenge)
            .options(selectinload(Challenge.days))
            .where(Challenge.user_id == user.id)
            .order_by(Challenge.started_at.desc())
        )
    )
    rewards = list(db.scalars(select(Reward).where(Reward.user_id == user.id).order_by(Reward.created_at.desc())))
    checkins = list(db.scalars(select(Checkin).where(Checkin.user_id == user.id).order_by(Checkin.created_at.desc())))
    wallet = get_wallet_summary(db, user)
    buddies = get_buddies_summary(db, user)
    total_points = wallet["balance"]
    week_start = datetime.utcnow() - timedelta(days=7)
    weekly_points = db.scalar(
        select(func.coalesce(func.sum(PointsTransaction.amount), 0)).where(
            PointsTransaction.user_id == user.id,
            PointsTransaction.created_at >= week_start,
            PointsTransaction.amount > 0,
        )
    ) or 0
    level = total_points // 100 + 1
    next_level_points = level * 100
    active = [challenge for challenge in challenges if challenge.status in {"active", "paused"}]
    saved = [challenge for challenge in challenges if challenge.status in {"saved", "draft"}]
    completed = [challenge for challenge in challenges if challenge.status == "completed"]
    stats = _stats(challenges, checkins)

    return {
        "companion": {
            "name": "小芽",
            "level": level,
            "levelLabel": f"Lv.{level} {_level_name(level)}",
            "totalPoints": total_points,
            "weeklyPoints": weekly_points,
            "weeklyTarget": 180,
            "nextLevelPoints": next_level_points,
            "pointsToNextLevel": max(0, next_level_points - total_points),
        },
        "wallet": wallet,
        "buddy": buddies,
        "garden": {
            "collectionCount": len(buddies["collection"]),
            "inventoryCount": sum(item["quantity"] for item in buddies["inventory"]),
            "drawCost": buddies["drawCost"],
        },
        "todayGoal": _today_goal(active, saved, completed),
        "stats": stats,
        "badges": _badges(rewards, challenges, total_points, weekly_points, stats),
        "unlockables": _unlockables(total_points),
        "litNodes": _lit_nodes(challenges),
        "insight": _insight(active, completed),
    }


def companion_line_for_cursor(cursor: int) -> str:
    return COMPANION_WARM_LINES[cursor % len(COMPANION_WARM_LINES)]


def _today_goal(active: list[Challenge], saved: list[Challenge], completed: list[Challenge]) -> dict:
    if active:
        challenge = active[0]
        today = next((day for day in challenge.days if day.status == "today"), None)
        today = today or next((day for day in challenge.days if day.day == challenge.current_day), None) or challenge.days[0]
        return {
            "state": "active",
            "challengeId": challenge.id,
            "challengeTitle": challenge.title,
            "dayLabel": f"Day {challenge.current_day}",
            "nodeTitle": today.title,
            "body": f"完成「{today.title}」：{today.micro_action}",
            "actionLabel": "去完成今日行动",
            "route": f"/challenge/{challenge.id}/today",
        }
    if saved:
        challenge = saved[0]
        return {
            "state": "saved",
            "challengeId": challenge.id,
            "challengeTitle": challenge.title,
            "dayLabel": "轻轻开始就好",
            "body": f"你保存了「{challenge.title}」，可以先确认计划再开始。",
            "actionLabel": "查看挑战计划",
            "route": f"/challenge/plan/{challenge.id}",
        }
    if completed:
        challenge = completed[0]
        return {
            "state": "completed",
            "challengeId": challenge.id,
            "challengeTitle": challenge.title,
            "dayLabel": "已完成",
            "body": f"最近完成了「{challenge.title}」，可以查看复盘或开启新的微行动。",
            "actionLabel": "查看复盘报告",
            "route": f"/report/{challenge.id}",
        }
    return {
        "state": "empty",
        "dayLabel": "轻轻开始就好",
        "body": "还没有今日行动。先选择一个健康视频，让 AI 帮你生成第一条微习惯路径。",
        "actionLabel": "创建我的挑战",
        "route": "/",
    }


def _badges(rewards: list[Reward], challenges: list[Challenge], total_points: int, weekly_points: int, stats: dict) -> dict:
    earned = []
    seen = set()
    for reward in rewards:
        if not reward.badge_name or reward.badge_name in seen:
            continue
        seen.add(reward.badge_name)
        earned.append(
            {
                "id": reward.id,
                "title": reward.badge_name,
                "condition": "完成微行动挑战后获得",
                "tone": TONE_CYCLE[len(earned) % len(TONE_CYCLE)],
            }
        )
    return {"earned": earned, "upcoming": _upcoming_badges(challenges, rewards, total_points, weekly_points, stats)}


def _upcoming_badges(challenges: list[Challenge], rewards: list[Reward], total_points: int, weekly_points: int, stats: dict) -> list[dict]:
    earned_names = {reward.badge_name for reward in rewards if reward.badge_name}
    completed_scenarios = {scenario_from_text(challenge.graph_id) for challenge in challenges if challenge.status == "completed"}
    active_or_saved = [challenge for challenge in challenges if challenge.status in {"active", "paused", "saved", "draft"}]
    upcoming: list[dict] = []

    if not challenges:
        upcoming.append({"id": "starter", "title": "微习惯启动者", "condition": "创建第一条健康图谱挑战", "tone": "mint"})
    elif active_or_saved:
        challenge = active_or_saved[0]
        scenario = scenario_from_text(challenge.graph_id)
        badge_name = BADGES[scenario]
        if badge_name not in earned_names:
            completed_days = challenge.progress.get("completedDays", 0)
            upcoming.append(
                {
                    "id": f"finish_{challenge.id}",
                    "title": badge_name,
                    "condition": f"完成「{challenge.title}」剩余 {max(0, challenge.duration_days - completed_days)} 天",
                    "tone": "mint",
                }
            )

    if weekly_points < 180:
        upcoming.append({"id": "weekly", "title": "稳定点亮者", "condition": f"本周还差 {180 - weekly_points} 点微光", "tone": "blue"})

    if stats.get("streakDays", 0) < 3:
        upcoming.append({"id": "streak_3", "title": "三天连续微光", "condition": f"连续打卡到第 3 天，当前 {stats.get('streakDays', 0)} 天", "tone": "coral"})

    if total_points < 100:
        upcoming.append({"id": "level_2", "title": "小芽升级", "condition": f"再收集 {100 - total_points} 点微光，小芽升到下一阶段", "tone": "mint"})

    missing_scenario = next((scenario for scenario in ["meditation", "stretch", "eye_yoga"] if scenario not in completed_scenarios), None)
    if missing_scenario and challenges:
        scenario_labels = {"meditation": "专注微冥想", "stretch": "身体松弛拉伸", "eye_yoga": "护眼微行动"}
        upcoming.append(
            {
                "id": f"scenario_{missing_scenario}",
                "title": f"点亮「{scenario_labels[missing_scenario]}」",
                "condition": "完成一个不同生活场景的 7 天路径",
                "tone": "blue",
            }
        )

    deduped = []
    seen_ids = set()
    for badge in upcoming:
        if badge["id"] in seen_ids:
            continue
        seen_ids.add(badge["id"])
        deduped.append(badge)
    return deduped[:3]


def _unlockables(total_points: int) -> list[dict]:
    items = [
        ("voice", "温柔陪伴语气", 30),
        ("skin", "夜光小芽皮肤", 100),
        ("theme", "星光健康图谱主题", 180),
    ]
    return [
        {"id": item_id, "title": title, "requiredPoints": required, "unlocked": total_points >= required}
        for item_id, title, required in items
    ]


def _lit_nodes(challenges: list[Challenge]) -> list[dict]:
    nodes = []
    seen = set()
    for challenge in challenges:
        completed_node_ids = set(challenge.progress.get("completedNodeIds", []))
        for day in challenge.days:
            if day.graph_node_id in completed_node_ids or day.status == "completed":
                if day.graph_node_id in seen:
                    continue
                seen.add(day.graph_node_id)
                nodes.append({"id": day.graph_node_id, "title": day.title, "tone": TONE_CYCLE[len(nodes) % len(TONE_CYCLE)]})
    return nodes


def _insight(active: list[Challenge], completed: list[Challenge]) -> dict:
    if active:
        challenge = active[0]
        time = challenge.plan.get("preferredTime") or "固定时间"
        place = challenge.plan.get("preferredPlace") or "熟悉场景"
        return {
            "title": "AI 发现",
            "body": f"你正在把「{challenge.title}」放进{time}的{place}。下一步先保持动作足够小，比加码更重要。",
        }
    if completed:
        challenge = completed[0]
        return {"title": "AI 发现", "body": f"你已经完成「{challenge.title}」。下一轮建议延续最稳定的执行场景，再加一个相邻节点。"}
    return {"title": "AI 发现", "body": "你还没有开始挑战。第一次建议选择 7 天路径，把动作控制在 1-2 分钟内。"}


def _stats(challenges: list[Challenge], checkins: list[Checkin]) -> dict:
    total_days = sum(challenge.duration_days for challenge in challenges if challenge.status in {"active", "paused", "completed"})
    completed_days = len({(checkin.challenge_id, checkin.day) for checkin in checkins})
    preferred_times = [challenge.plan.get("preferredTime") for challenge in challenges if challenge.plan.get("preferredTime")]
    favorite_time = Counter(preferred_times).most_common(1)[0][0] if preferred_times else "暂未形成固定时间"
    week_start = datetime.utcnow() - timedelta(days=7)
    weekly_lit_nodes = len({checkin.graph_node_id for checkin in checkins if checkin.created_at >= week_start})
    return {
        "streakDays": _streak_days(checkins),
        "favoriteExecutionTime": favorite_time,
        "completionRate": round(completed_days / total_days, 2) if total_days else 0,
        "weeklyLitNodes": weekly_lit_nodes,
    }


def _streak_days(checkins: list[Checkin]) -> int:
    completed_dates = {checkin.created_at.date() for checkin in checkins}
    if not completed_dates:
        return 0
    cursor: date = datetime.utcnow().date()
    if cursor not in completed_dates:
        cursor = max(completed_dates)
    streak = 0
    while cursor in completed_dates:
        streak += 1
        cursor = cursor - timedelta(days=1)
    return streak


def _level_name(level: int) -> str:
    if level >= 5:
        return "微光伙伴"
    if level >= 3:
        return "稳定小芽"
    return "发光小芽"
