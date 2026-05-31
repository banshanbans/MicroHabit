from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_or_create_user
from app.db.session import get_db
from app.models.entities import User
from app.schemas.api import PlantBuddyRequest
from app.services.buddy_service import get_buddies_summary, plant_seedling

router = APIRouter(prefix="/buddies", tags=["buddies"])


@router.get("/me")
def get_my_buddies(db: Session = Depends(get_db), user: User = Depends(get_or_create_user)) -> dict:
    return get_buddies_summary(db, user)


@router.post("/plant")
def post_plant_buddy(payload: PlantBuddyRequest, db: Session = Depends(get_db), user: User = Depends(get_or_create_user)) -> dict:
    try:
        return plant_seedling(db, user, payload.seedlingId)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
