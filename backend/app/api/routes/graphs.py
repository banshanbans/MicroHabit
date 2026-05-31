from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import HealthGraph
from app.services.demo_seed import seed_demo_data
from app.services.serializers import graph_to_api

router = APIRouter(prefix="/graphs", tags=["graphs"])


@router.get("/{graph_id}")
def get_graph(graph_id: str, db: Session = Depends(get_db)) -> dict:
    seed_demo_data(db)
    graph = db.get(HealthGraph, graph_id)
    if graph is None:
        raise HTTPException(status_code=404, detail="Graph not found")
    return graph_to_api(graph)

