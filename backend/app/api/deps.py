from __future__ import annotations

from typing import Optional
from uuid import uuid4

from fastapi import Depends, Header
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import User, utcnow


def get_or_create_user(
    db: Session = Depends(get_db),
    x_device_id: Optional[str] = Header(default=None, alias="X-Device-Id"),
) -> User:
    device_id = x_device_id or f"anonymous-{uuid4().hex}"
    user = db.scalar(select(User).where(User.anonymous_device_id == device_id))
    if user:
        user.last_seen_at = utcnow()
        db.commit()
        db.refresh(user)
        return user
    user = User(id=f"user_{uuid4().hex[:16]}", anonymous_device_id=device_id)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
