import json
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import Route
from ..schemas.schemas import RouteAnalysisRequest, RouteAnalysisResponse
from ..services.ai_routing import analyze_ner_routes

router = APIRouter(prefix="/api/routes", tags=["Routes"])

@router.post("/analyze", response_model=RouteAnalysisResponse)
def analyze_route(req: RouteAnalysisRequest, db: Session = Depends(get_db)):
    """Run AI multi-factor route scoring and generate explainable route options."""
    return analyze_ner_routes(
        origin=req.origin,
        destination=req.destination,
        commodity=req.commodity,
        vehicle_type=req.vehicle_type,
        priority=req.priority,
        db_session=db
    )

@router.get("")
def list_routes(
    is_emergency: Optional[bool] = Query(None, description="Filter emergency corridors only"),
    db: Session = Depends(get_db)
):
    query = db.query(Route)
    if is_emergency is not None:
        query = query.filter(Route.is_emergency_corridor == is_emergency)
        
    routes = query.all()
    results = []
    for r in routes:
        results.append({
            "id": r.id,
            "name": r.name,
            "origin": r.origin,
            "destination": r.destination,
            "distance_km": r.distance_km,
            "estimated_time_mins": r.estimated_time_mins,
            "risk_score": r.risk_score,
            "accessibility_score": r.accessibility_score,
            "status": r.status,
            "is_emergency_corridor": r.is_emergency_corridor,
            "waypoints": json.loads(r.waypoints_json) if r.waypoints_json else []
        })
    return results
