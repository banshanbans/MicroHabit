from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_or_create_user
from app.db.session import get_db
from app.models.entities import User
from app.services.challenge_service import get_challenge
from app.services.report_service import get_report

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/{challenge_id}")
def get_challenge_report(challenge_id: str, db: Session = Depends(get_db), user: User = Depends(get_or_create_user)) -> dict:
    challenge = get_challenge(db, challenge_id, user)
    if challenge is None:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return get_report(db, user, challenge)

