from typing import Literal, Optional

from pydantic import BaseModel


VideoScenario = Literal["meditation", "stretch", "eye_yoga"]
ChallengeDuration = Literal[7, 15, 21]
CompletedType = Literal["full", "tiny"]


class ParseVideoRequest(BaseModel):
    url: Optional[str] = None
    scenario: Optional[str] = None


class StartAnalysisRequest(BaseModel):
    videoId: Optional[str] = None


class CreateChallengeRequest(BaseModel):
    graphId: str
    durationDays: ChallengeDuration
    plan: dict = {}
    status: Literal["active", "saved"] = "active"


class CreateCheckinRequest(BaseModel):
    challengeId: str
    day: int
    completedType: CompletedType
    optionalNote: Optional[str] = None


class CompanionSpeakRequest(BaseModel):
    intent: Literal["daily_goal", "analysis_waiting"] = "daily_goal"


class PlantBuddyRequest(BaseModel):
    seedlingId: str
