from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_or_create_user
from app.db.session import get_db
from app.models.entities import User
from app.schemas.api import CreateChallengeRequest
from app.services.challenge_service import create_challenge, get_challenge, list_challenges, start_challenge
from app.services.serializers import challenge_to_api

router = APIRouter(prefix="/challenges", tags=["challenges"])


@router.post("")
def post_challenge(payload: CreateChallengeRequest, db: Session = Depends(get_db), user: User = Depends(get_or_create_user)) -> dict:
    try:
        challenge = create_challenge(db, user, payload.graphId, payload.durationDays, payload.plan, payload.status)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return {"challengeId": challenge.id}


@router.post("/{challenge_id}/start")
def post_start_challenge(challenge_id: str, db: Session = Depends(get_db), user: User = Depends(get_or_create_user)) -> dict:
    try:
        challenge = start_challenge(db, user, challenge_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return challenge_to_api(challenge)


@router.get("")
def get_challenges(db: Session = Depends(get_db), user: User = Depends(get_or_create_user)) -> list[dict]:
    return [challenge_to_api(challenge) for challenge in list_challenges(db, user)]


@router.get("/{challenge_id}")
def get_challenge_by_id(challenge_id: str, db: Session = Depends(get_db), user: User = Depends(get_or_create_user)) -> dict:
    challenge = get_challenge(db, challenge_id, user)
    if challenge is None:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return challenge_to_api(challenge)
