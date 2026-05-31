from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_or_create_user
from app.db.session import get_db
from app.models.entities import User
from app.services.serializers import user_to_api

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/anonymous")
def anonymous_user(db: Session = Depends(get_db), user: User = Depends(get_or_create_user)) -> dict:
    return user_to_api(user)

