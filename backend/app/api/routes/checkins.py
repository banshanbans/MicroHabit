from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_or_create_user
from app.db.session import get_db
from app.models.entities import User
from app.schemas.api import CreateCheckinRequest
from app.services.challenge_service import complete_checkin
from app.services.serializers import checkin_result_to_api
from app.services.wallet_service import get_wallet_summary

router = APIRouter(prefix="/checkins", tags=["checkins"])


@router.post("")
def post_checkin(payload: CreateCheckinRequest, db: Session = Depends(get_db), user: User = Depends(get_or_create_user)) -> dict:
    try:
        checkin, challenge, growth = complete_checkin(db, user, payload.challengeId, payload.day, payload.completedType, payload.optionalNote)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return checkin_result_to_api(checkin, challenge, growth=growth, wallet=get_wallet_summary(db, user))
