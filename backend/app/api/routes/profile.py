from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_or_create_user
from app.db.session import get_db
from app.models.entities import User
from app.services.profile_service import build_profile

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/me")
def get_my_profile(db: Session = Depends(get_db), user: User = Depends(get_or_create_user)) -> dict:
    return build_profile(db, user)

