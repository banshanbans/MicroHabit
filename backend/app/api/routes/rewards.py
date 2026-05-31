from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_or_create_user
from app.db.session import get_db
from app.models.entities import Reward, User
from app.services.serializers import reward_to_api
from app.services.wallet_service import get_wallet_summary

router = APIRouter(prefix="/rewards", tags=["rewards"])


@router.get("/me")
def get_my_rewards(db: Session = Depends(get_db), user: User = Depends(get_or_create_user)) -> dict:
    rewards = list(db.scalars(select(Reward).where(Reward.user_id == user.id).order_by(Reward.created_at.desc())))
    return {"totalPoints": get_wallet_summary(db, user)["balance"], "rewards": [reward_to_api(reward) for reward in rewards]}
