from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_or_create_user
from app.db.session import get_db
from app.models.entities import User
from app.services.wallet_service import get_wallet_summary

router = APIRouter(prefix="/wallet", tags=["wallet"])


@router.get("/me")
def get_my_wallet(db: Session = Depends(get_db), user: User = Depends(get_or_create_user)) -> dict:
    return get_wallet_summary(db, user)
