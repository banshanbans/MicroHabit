from __future__ import annotations

import random
from datetime import datetime
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.entities import BuddyInventory, CollectibleBuddy, GrowingBuddy, User
from app.services.wallet_service import ensure_legacy_wallet, get_wallet_summary, spend_points_transaction


SEEDLINGS: dict[str, dict] = {
    "seed_mint_sprout": {
        "id": "seed_mint_sprout",
        "name": "薄荷小芽",
        "rarity": "common",
        "targetCheckins": 5,
        "emoji": "🌱",
        "description": "适合第一轮微行动陪伴，轻轻亮起来。",
        "matureForm": {"id": "buddy_glow_sprout", "name": "发光小芽", "emoji": "🌿"},
    },
    "seed_coral_bloom": {
        "id": "seed_coral_bloom",
        "name": "珊瑚花芽",
        "rarity": "rare",
        "targetCheckins": 10,
        "emoji": "🌷",
        "description": "更温暖一点的陪伴，适合连续挑战。",
        "matureForm": {"id": "buddy_coral_bloom", "name": "珊瑚花小芽", "emoji": "🌸"},
    },
    "seed_starlight_sprout": {
        "id": "seed_starlight_sprout",
        "name": "星光芽",
        "rarity": "epic",
        "targetCheckins": 14,
        "emoji": "✨",
        "description": "夜光感的小芽，适合长期守护。",
        "matureForm": {"id": "buddy_starlight_sprout", "name": "星光小芽", "emoji": "🌟"},
    },
}

DEFAULT_SEEDLING_ID = "seed_mint_sprout"
DRAW_COST = 60


def get_buddies_summary(db: Session, user: User) -> dict:
    active = get_active_buddy(db, user)
    inventory = list(db.scalars(select(BuddyInventory).where(BuddyInventory.user_id == user.id, BuddyInventory.quantity > 0)))
    collectibles = list(
        db.scalars(
            select(CollectibleBuddy)
            .where(CollectibleBuddy.user_id == user.id)
            .order_by(CollectibleBuddy.obtained_at.desc())
        )
    )
    return {
        "active": growing_buddy_to_api(active) if active else None,
        "inventory": [inventory_to_api(item) for item in inventory],
        "collection": [collectible_to_api(item) for item in collectibles],
        "seedlings": [seedling_to_api(item) for item in SEEDLINGS.values()],
        "drawCost": DRAW_COST,
    }


def apply_checkin_growth(db: Session, user: User, challenge_id: str, completed_type: str) -> dict:
    buddy = get_active_buddy(db, user) or create_growing_buddy(db, user, DEFAULT_SEEDLING_ID, challenge_id)
    energy_delta = 1 if completed_type == "tiny" else 2
    previous_stage = buddy.stage
    previous_energy = buddy.energy
    buddy.challenge_id = buddy.challenge_id or challenge_id
    buddy.completed_checkins += 1
    buddy.energy += energy_delta
    buddy.stage = stage_for_progress(buddy.completed_checkins, buddy.target_checkins)
    buddy.updated_at = datetime.utcnow()

    minted = None
    if buddy.completed_checkins >= buddy.target_checkins:
        minted = mint_collectible(db, user, buddy, challenge_id)
        buddy.status = "matured"
        buddy.stage = "bloom"
        buddy.updated_at = datetime.utcnow()

    db.flush()
    return {
        "energyDelta": energy_delta,
        "previousEnergy": previous_energy,
        "previousStage": previous_stage,
        "current": growing_buddy_to_api(buddy),
        "mintedBuddy": collectible_to_api(minted) if minted else None,
        "message": growth_message(buddy, minted),
    }


def draw_seedling(db: Session, user: User) -> dict:
    draw_id = f"draw_{uuid4().hex[:16]}"
    ensure_legacy_wallet(db, user)
    spend_points_transaction(db, user, DRAW_COST, "nursery_draw", draw_id, {"label": "苗圃抽取"})
    seedling_id = weighted_seedling_id()
    item = add_inventory(db, user, seedling_id, 1)
    db.commit()
    return {
        "wallet": get_wallet_summary(db, user),
        "seedling": seedling_to_api(SEEDLINGS[seedling_id]),
        "inventoryItem": inventory_to_api(item),
        "message": f"你获得了「{SEEDLINGS[seedling_id]['name']}」，可以把它种成下一轮陪伴。",
    }


def plant_seedling(db: Session, user: User, seedling_id: str) -> dict:
    if seedling_id not in SEEDLINGS:
        raise LookupError("Seedling not found")
    if get_active_buddy(db, user):
        raise ValueError("已有成长中的小芽")
    item = db.scalar(select(BuddyInventory).where(BuddyInventory.user_id == user.id, BuddyInventory.seedling_id == seedling_id))
    if item is None or item.quantity <= 0:
        raise ValueError("苗圃里还没有这个小芽")
    item.quantity -= 1
    item.updated_at = datetime.utcnow()
    buddy = create_growing_buddy(db, user, seedling_id, None)
    db.commit()
    return {"active": growing_buddy_to_api(buddy), "inventoryItem": inventory_to_api(item)}


def get_active_buddy(db: Session, user: User) -> GrowingBuddy | None:
    return db.scalar(
        select(GrowingBuddy)
        .where(GrowingBuddy.user_id == user.id, GrowingBuddy.status == "active")
        .order_by(GrowingBuddy.started_at.desc())
    )


def create_growing_buddy(db: Session, user: User, seedling_id: str, challenge_id: str | None) -> GrowingBuddy:
    definition = SEEDLINGS[seedling_id]
    buddy = GrowingBuddy(
        id=f"gb_{uuid4().hex[:16]}",
        user_id=user.id,
        seedling_id=seedling_id,
        challenge_id=challenge_id,
        rarity=definition["rarity"],
        target_checkins=definition["targetCheckins"],
        completed_checkins=0,
        energy=0,
        stage="seedling",
        status="active",
    )
    db.add(buddy)
    db.flush()
    return buddy


def add_inventory(db: Session, user: User, seedling_id: str, quantity: int) -> BuddyInventory:
    item = db.scalar(select(BuddyInventory).where(BuddyInventory.user_id == user.id, BuddyInventory.seedling_id == seedling_id))
    if item is None:
        item = BuddyInventory(user_id=user.id, seedling_id=seedling_id, quantity=0)
        db.add(item)
    item.quantity += quantity
    item.updated_at = datetime.utcnow()
    db.flush()
    return item


def mint_collectible(db: Session, user: User, buddy: GrowingBuddy, challenge_id: str | None) -> CollectibleBuddy:
    definition = SEEDLINGS[buddy.seedling_id]
    mature = definition["matureForm"]
    collectible = CollectibleBuddy(
        id=f"cb_{uuid4().hex[:16]}",
        user_id=user.id,
        seedling_id=buddy.seedling_id,
        mature_form_id=mature["id"],
        name=mature["name"],
        rarity=definition["rarity"],
        description=f"{definition['description']} 这是你通过微行动养成的一位伙伴。",
        source_challenge_id=challenge_id,
        meta={"emoji": mature["emoji"], "fromGrowingBuddyId": buddy.id},
    )
    db.add(collectible)
    db.flush()
    return collectible


def stage_for_progress(completed_checkins: int, target_checkins: int) -> str:
    if completed_checkins >= target_checkins:
        return "bloom"
    ratio = completed_checkins / max(1, target_checkins)
    if ratio >= 0.65:
        return "bud"
    if ratio >= 0.3:
        return "sprout"
    return "seedling"


def growth_message(buddy: GrowingBuddy, minted: CollectibleBuddy | None) -> str:
    if minted:
        return f"「{minted.name}」成熟了。它会留在你的微光花园里。"
    remaining = max(0, buddy.target_checkins - buddy.completed_checkins)
    return f"小芽多了一点微光，再点亮 {remaining} 个节点就能完成这一轮成长。"


def weighted_seedling_id() -> str:
    roll = random.random()
    if roll < 0.8:
        return "seed_mint_sprout"
    if roll < 0.98:
        return "seed_coral_bloom"
    return "seed_starlight_sprout"


def seedling_to_api(definition: dict) -> dict:
    return {
        "id": definition["id"],
        "name": definition["name"],
        "rarity": definition["rarity"],
        "targetCheckins": definition["targetCheckins"],
        "emoji": definition["emoji"],
        "description": definition["description"],
        "matureForm": definition["matureForm"],
    }


def growing_buddy_to_api(buddy: GrowingBuddy) -> dict:
    definition = SEEDLINGS[buddy.seedling_id]
    return {
        "id": buddy.id,
        "seedlingId": buddy.seedling_id,
        "name": definition["name"],
        "rarity": buddy.rarity,
        "emoji": definition["emoji"],
        "stage": buddy.stage,
        "stageLabel": stage_label(buddy.stage),
        "energy": buddy.energy,
        "completedCheckins": buddy.completed_checkins,
        "targetCheckins": buddy.target_checkins,
        "progress": min(1, buddy.completed_checkins / max(1, buddy.target_checkins)),
        "status": buddy.status,
        "message": growth_message(buddy, None),
        "updatedAt": buddy.updated_at.isoformat(),
    }


def collectible_to_api(buddy: CollectibleBuddy) -> dict:
    return {
        "id": buddy.id,
        "seedlingId": buddy.seedling_id,
        "matureFormId": buddy.mature_form_id,
        "name": buddy.name,
        "rarity": buddy.rarity,
        "description": buddy.description,
        "emoji": (buddy.meta or {}).get("emoji", "🌿"),
        "sourceChallengeId": buddy.source_challenge_id,
        "obtainedAt": buddy.obtained_at.isoformat(),
    }


def inventory_to_api(item: BuddyInventory) -> dict:
    definition = SEEDLINGS[item.seedling_id]
    return {
        "seedling": seedling_to_api(definition),
        "quantity": item.quantity,
        "updatedAt": item.updated_at.isoformat(),
    }


def stage_label(stage: str) -> str:
    return {
        "seedling": "种子期",
        "sprout": "发芽期",
        "bud": "蓄光期",
        "bloom": "成熟",
    }.get(stage, "成长中")
