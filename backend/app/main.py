from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import analysis, buddies, challenges, checkins, companion, graphs, nursery, profile, reports, rewards, users, videos, wallet
from app.core.config import get_settings
from app.db.session import SessionLocal, engine
from app.models.base import Base
from app.services.demo_seed import seed_demo_data


settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    del app
    if settings.auto_create_tables:
        Base.metadata.create_all(bind=engine)
        with SessionLocal() as db:
            seed_demo_data(db)
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=settings.cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api")
app.include_router(videos.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(graphs.router, prefix="/api")
app.include_router(challenges.router, prefix="/api")
app.include_router(checkins.router, prefix="/api")
app.include_router(wallet.router, prefix="/api")
app.include_router(buddies.router, prefix="/api")
app.include_router(nursery.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(rewards.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(companion.router, prefix="/api")


@app.get("/api/health")
def health() -> dict:
    return {"ok": True}
