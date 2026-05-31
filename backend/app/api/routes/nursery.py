from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_or_create_user
from app.db.session import get_db
from app.models.entities import User
from app.services.buddy_service import draw_seedling

router = APIRouter(prefix="/nursery", tags=["nursery"])


@router.post("/draw")
def post_nursery_draw(db: Session = Depends(get_db), user: User = Depends(get_or_create_user)) -> dict:
    try:
        return draw_seedling(db, user)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
