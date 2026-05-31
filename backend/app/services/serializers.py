from __future__ import annotations

from app.models.entities import AnalysisResult, Challenge, ChallengeDay, Checkin, HealthGraph, Reward, User, VideoSource


def video_to_api(video: VideoSource) -> dict:
    return {
        "id": video.id,
        "source": video.source,
        "url": video.url,
        "scenario": video.scenario,
        "title": video.title,
        "coverUrl": video.cover_url,
        "creatorName": video.creator_name,
        "durationSec": video.duration_sec,
        "rawDescription": video.raw_description,
        "mimeType": video.mime_type,
        "fileSize": video.file_size,
        "processingStatus": video.processing_status,
    }


def analysis_to_api(result: AnalysisResult) -> dict:
    return {
        "id": result.id,
        "videoId": result.video_id,
        "scenario": result.scenario,
        "theme": result.theme,
        "summary": result.summary,
        "coreMicroAction": result.core_micro_action,
        "whyWorthDoing": result.why_worth_doing,
        "actionTips": result.action_tips,
        "useCases": result.use_cases,
        "precautions": result.precautions,
        "risk": result.risk,
        "graphId": result.graph_id,
        "recommendedDuration": result.recommended_duration,
    }


def graph_to_api(graph: HealthGraph) -> dict:
    return {
        "id": graph.id,
        "videoId": graph.video_id,
        "title": graph.title,
        "description": graph.description,
        "nodes": graph.nodes,
        "edges": graph.edges,
        "progress": {"totalNodes": len(graph.nodes), "completedNodes": sum(1 for node in graph.nodes if node.get("status") == "completed")},
    }


def day_to_api(day: ChallengeDay) -> dict:
    return {
        "day": day.day,
        "title": day.title,
        "microAction": day.micro_action,
        "why": day.why,
        "howTo": day.how_to,
        "precautions": day.precautions,
        "graphNodeId": day.graph_node_id,
        "estimatedMinutes": day.estimated_minutes,
        "status": day.status,
    }


def challenge_to_api(challenge: Challenge) -> dict:
    return {
        "id": challenge.id,
        "graphId": challenge.graph_id,
        "videoId": challenge.video_id,
        "title": challenge.title,
        "durationDays": challenge.duration_days,
        "status": challenge.status,
        "currentDay": challenge.current_day,
        "startedAt": challenge.started_at.isoformat() if challenge.started_at else None,
        "completedAt": challenge.completed_at.isoformat() if challenge.completed_at else None,
        "plan": challenge.plan,
        "days": [day_to_api(day) for day in challenge.days],
        "progress": challenge.progress,
    }


def checkin_result_to_api(checkin: Checkin, challenge: Challenge, growth: dict | None = None, wallet: dict | None = None) -> dict:
    next_day = checkin.day + 1 if checkin.day < challenge.duration_days else None
    payload = {
        "checkinId": checkin.id,
        "challengeId": checkin.challenge_id,
        "completedDay": checkin.day,
        "completedType": checkin.completed_type,
        "litNodeId": checkin.graph_node_id,
        "encouragement": checkin.encouragement,
        "points": checkin.points,
        "progress": {"completedDays": challenge.progress["completedDays"], "totalDays": challenge.duration_days},
        "nextDay": next_day,
    }
    if growth is not None:
        payload["buddyGrowth"] = growth
        if growth.get("mintedBuddy"):
            payload["mintedBuddy"] = growth["mintedBuddy"]
    if wallet is not None:
        payload["wallet"] = wallet
    return payload


def user_to_api(user: User) -> dict:
    return {"id": user.id, "anonymousDeviceId": user.anonymous_device_id, "createdAt": user.created_at.isoformat(), "lastSeenAt": user.last_seen_at.isoformat()}


def reward_to_api(reward: Reward) -> dict:
    return {
        "id": reward.id,
        "challengeId": reward.challenge_id,
        "badgeName": reward.badge_name,
        "points": reward.points,
        "reason": reward.reason,
        "createdAt": reward.created_at.isoformat(),
    }
