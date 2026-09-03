from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import District, Incident, Vehicle, Delivery, Route
from ..schemas.schemas import DistrictResponse, IncidentResponse, DeliveryResponse

router = APIRouter(prefix="/api/districts", tags=["Districts"])

@router.get("", response_model=List[DistrictResponse])
def list_districts(
    state: Optional[str] = Query(None, description="Filter by state name"),
    search: Optional[str] = Query(None, description="Search by district name"),
    db: Session = Depends(get_db)
):
    query = db.query(District)
    if state and state != "Entire NER":
        query = query.filter(District.state == state)
    if search:
        query = query.filter(District.name.ilike(f"%{search}%"))
    return [DistrictResponse.model_validate(d) for d in query.all()]

@router.get("/{district_id}", response_model=Dict[str, Any])
def get_district_details(district_id: int, db: Session = Depends(get_db)):
    district = db.query(District).filter(District.id == district_id).first()
    if not district:
        raise HTTPException(status_code=404, detail="District not found")
        
    incidents = db.query(Incident).filter(Incident.district_name == district.name).all()
    # Deliveries originating or terminating in district
    deliveries_in = db.query(Delivery).filter(Delivery.destination.ilike(f"%{district.name[:6]}%")).all()
    deliveries_out = db.query(Delivery).filter(Delivery.origin.ilike(f"%{district.name[:6]}%")).all()
    vehicles = db.query(Vehicle).filter(
        (Vehicle.origin.ilike(f"%{district.name[:6]}%")) | (Vehicle.destination.ilike(f"%{district.name[:6]}%"))
    ).all()
    
    # 7-day trend specific to district
    base = district.accessibility_score
    trend = [
        {"day": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i], "score": round(max(30.0, min(100.0, base - (3 - i) * 2.2)), 1)}
        for i in range(7)
    ]

    return {
        "district": DistrictResponse.model_validate(district),
        "incidents": [IncidentResponse.model_validate(i) for i in incidents],
        "incoming_deliveries_count": len(deliveries_in),
        "outgoing_deliveries_count": len(deliveries_out),
        "active_vehicles_count": len(vehicles),
        "accessibility_trend_7d": trend,
        "risk_breakdown": {
            "topography_risk": 45.0 if district.accessibility_score < 75 else 20.0,
            "monsoon_risk": 55.0 if "Rain" in district.weather_summary or "Flood" in district.weather_summary else 25.0,
            "incident_density": len(incidents) * 15.0,
            "connectivity_rating": district.connectivity_level
        }
    }
