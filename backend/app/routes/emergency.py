import json
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import Route, Incident, Vehicle, Delivery
from ..schemas.schemas import IncidentResponse, VehicleResponse, DeliveryResponse

router = APIRouter(prefix="/api/emergency", tags=["Emergency Mode"])

EMERGENCY_SHELTERS = [
    {"name": "Guwahati Central Disaster Logistics Hub", "location": "Khanapara, Kamrup Metro", "capacity_tonnes": 500, "status": "Operational", "contact": "+91 361 2234001"},
    {"name": "Silchar Barak Relief Transit Depot", "location": "Cachar Foothills", "capacity_tonnes": 250, "status": "Operational", "contact": "+91 3842 245112"},
    {"name": "Dimapur Railhead Strategic Warehouse", "location": "Dimapur Bypass", "capacity_tonnes": 400, "status": "Operational", "contact": "+91 3862 230987"},
    {"name": "Tezpur Forward Logistics Base", "location": "Sonitpur North Bank", "capacity_tonnes": 300, "status": "Operational", "contact": "+91 3712 221045"},
    {"name": "Imphal Medical Supplies Reserve", "location": "RIMS Complex, Imphal", "capacity_tonnes": 150, "status": "Operational", "contact": "+91 385 2414555"},
]

@router.get("/overview")
def get_emergency_overview(db: Session = Depends(get_db)):
    # 1. Emergency Corridors
    corridors = db.query(Route).filter(Route.is_emergency_corridor == True).all()
    corridor_data = []
    for c in corridors:
        corridor_data.append({
            "id": c.id,
            "name": c.name,
            "origin": c.origin,
            "destination": c.destination,
            "distance_km": c.distance_km,
            "estimated_time": f"{c.estimated_time_mins // 60}h {c.estimated_time_mins % 60}m",
            "accessibility": f"{c.accessibility_score}%",
            "risk": "LOW" if c.risk_score < 30 else ("MEDIUM" if c.risk_score < 60 else "HIGH"),
            "status": "Green Lane (Open)" if c.accessibility_score >= 80 else "Controlled Convoy",
            "waypoints": json.loads(c.waypoints_json) if c.waypoints_json else []
        })
        
    # 2. Critical Incidents
    critical_incidents = db.query(Incident).filter(
        Incident.status == "Active",
        Incident.severity.in_(["Critical", "High"])
    ).all()
    
    # 3. Emergency & Life-Saving Supply Vehicles
    emergency_vehicles = db.query(Vehicle).filter(
        Vehicle.commodity.in_([
            "Essential Medicines", "Cold-Chain Vaccines", "Hospital Oxygen Cylinders",
            "Emergency Relief Kits", "Baby Food & Formula", "Emergency Medical Blood Units"
        ])
    ).all()
    
    # 4. Delayed Life-Saving Deliveries
    priority_deliveries = db.query(Delivery).filter(
        Delivery.priority.in_(["Emergency", "High"])
    ).all()

    return {
        "emergency_mode_active": True,
        "active_protocol": "NER-SDRF Level 2 Logistics Continuity Protocol",
        "safe_emergency_corridors": corridor_data,
        "critical_incidents": [IncidentResponse.model_validate(i) for i in critical_incidents],
        "emergency_vehicles": [VehicleResponse.model_validate(v) for v in emergency_vehicles],
        "priority_deliveries": [
            {
                "code": d.delivery_code,
                "commodity": d.commodity,
                "origin": d.origin,
                "destination": d.destination,
                "priority": d.priority,
                "status": d.status,
                "eta": d.eta,
                "risk_score": d.risk_score
            }
            for d in priority_deliveries
        ],
        "emergency_shelters": EMERGENCY_SHELTERS,
        "summary": {
            "monitored_emergency_corridors": len(corridor_data),
            "critical_disruptions": len(critical_incidents),
            "priority_supply_transits": len(emergency_vehicles),
            "shelters_ready": len(EMERGENCY_SHELTERS)
        }
    }
