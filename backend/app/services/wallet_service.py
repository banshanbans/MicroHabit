from __future__ import annotations

from uuid import uuid4

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.entities import PointsTransaction, Reward, User


def get_wallet_summary(db: Session, user: User, limit: int = 8) -> dict:
    if ensure_legacy_wallet(db, user):
        db.commit()
    transactions = list(
        db.scalars(
            select(PointsTransaction)
            .where(PointsTransaction.user_id == user.id)
            .order_by(PointsTransaction.created_at.desc())
            .limit(limit)
        )
    )
    balance = _current_balance(db, user.id)
    return {
        "balance": balance,
        "currentPoints": balance,
        "transactions": [transaction_to_api(item) for item in transactions],
    }


def add_points_transaction(
    db: Session,
    user: User,
    amount: int,
    reason: str,
    ref_id: str,
    meta: dict | None = None,
) -> PointsTransaction:
    existing = db.scalar(
        select(PointsTransaction).where(
            PointsTransaction.user_id == user.id,
            PointsTransaction.reason == reason,
            PointsTransaction.ref_id == ref_id,
        )
    )
    if existing:
        return existing

    balance_after = _current_balance(db, user.id) + amount
    transaction = PointsTransaction(
        id=f"pt_{uuid4().hex[:16]}",
        user_id=user.id,
        amount=amount,
        reason=reason,
        ref_id=ref_id,
        balance_after=balance_after,
        meta=meta or {},
    )
    db.add(transaction)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        existing = db.scalar(
            select(PointsTransaction).where(
                PointsTransaction.user_id == user.id,
                PointsTransaction.reason == reason,
                PointsTransaction.ref_id == ref_id,
            )
        )
        if existing:
            return existing
        raise
    return transaction


def spend_points_transaction(
    db: Session,
    user: User,
    amount: int,
    reason: str,
    ref_id: str,
    meta: dict | None = None,
) -> PointsTransaction:
    if amount <= 0:
        raise ValueError("Spend amount must be positive")
    if _current_balance(db, user.id) < amount:
        raise ValueError("Not enough glow points")
    return add_points_transaction(db, user, -amount, reason, ref_id, meta)


def ensure_legacy_wallet(db: Session, user: User) -> bool:
    existing_count = db.scalar(select(func.count()).select_from(PointsTransaction).where(PointsTransaction.user_id == user.id)) or 0
    if existing_count:
        return False
    legacy_points = db.scalar(select(func.coalesce(func.sum(Reward.points), 0)).where(Reward.user_id == user.id)) or 0
    if legacy_points <= 0:
        return False
    add_points_transaction(
        db,
        user,
        legacy_points,
        "legacy_reward",
        f"legacy_{user.id}",
        {"source": "rewards"},
    )
    db.flush()
    return True


def transaction_to_api(transaction: PointsTransaction) -> dict:
    return {
        "id": transaction.id,
        "amount": transaction.amount,
        "reason": transaction.reason,
        "refId": transaction.ref_id,
        "balanceAfter": transaction.balance_after,
        "meta": transaction.meta,
        "createdAt": transaction.created_at.isoformat(),
    }


def _current_balance(db: Session, user_id: str) -> int:
    return db.scalar(select(func.coalesce(func.sum(PointsTransaction.amount), 0)).where(PointsTransaction.user_id == user_id)) or 0
