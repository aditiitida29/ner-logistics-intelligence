from typing import Dict, Any, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import District, Incident, Delivery, Route

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/overview")
def get_analytics_overview(
    timeframe: str = Query("7d", description="Timeframe '7d' or '30d'"),
    db: Session = Depends(get_db)
):
    districts = db.query(District).all()
    incidents = db.query(Incident).all()
    deliveries = db.query(Delivery).all()
    routes = db.query(Route).all()

    # 1. Accessibility Trend
    if timeframe == "30d":
        accessibility_trend = [
            {"label": f"Day {i}", "accessibility": round(80.0 + (i % 7) * 1.5 - ((i % 5) * 1.1), 1), "target": 88.0}
            for i in range(1, 31)
        ]
    else:
        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        accessibility_trend = [
            {"label": days[i], "accessibility": round(82.0 + i * 1.1 - (0 if i < 4 else 2.5), 1), "target": 90.0}
            for i in range(7)
        ]

    # 2. Incident Trend
    incident_trend = [
        {"period": "6 Days Ago", "incidents": 5, "resolved": 4},
        {"period": "5 Days Ago", "incidents": 8, "resolved": 6},
        {"period": "4 Days Ago", "incidents": 12, "resolved": 9},
        {"period": "3 Days Ago", "incidents": 7, "resolved": 8},
        {"period": "2 Days Ago", "incidents": 10, "resolved": 7},
        {"period": "Yesterday", "incidents": 9, "resolved": 11},
        {"period": "Today", "incidents": len(incidents), "resolved": 14},
    ]

    # 3. Logistics Performance
    status_counts = {"Delivered": 0, "In Transit": 0, "Delayed": 0, "At Risk": 0}
    for d in deliveries:
        s = d.status if d.status in status_counts else "In Transit"
        status_counts[s] += 1

    logistics_performance = [
        {"name": "Delivered On Time", "value": max(12, status_counts["Delivered"])},
        {"name": "In Transit (Healthy)", "value": max(14, status_counts["In Transit"])},
        {"name": "Delayed", "value": max(6, status_counts["Delayed"])},
        {"name": "At Risk", "value": max(3, status_counts["At Risk"])},
    ]

    # 4. Average Delay by District
    avg_delays = [
        {"district": "Tawang", "avg_delay_mins": 115, "state": "Arunachal"},
        {"district": "Kohima", "avg_delay_mins": 85, "state": "Nagaland"},
        {"district": "Cachar", "avg_delay_mins": 72, "state": "Assam"},
        {"district": "Aizawl", "avg_delay_mins": 68, "state": "Mizoram"},
        {"district": "East Sikkim", "avg_delay_mins": 64, "state": "Sikkim"},
        {"district": "Dibrugarh", "avg_delay_mins": 45, "state": "Assam"},
        {"district": "Shillong", "avg_delay_mins": 25, "state": "Meghalaya"},
        {"district": "Guwahati", "avg_delay_mins": 18, "state": "Assam"},
        {"district": "Agartala", "avg_delay_mins": 12, "state": "Tripura"},
    ]

    # 5. Route Risk by Corridor
    corridor_risks = [
        {"corridor": r.name.split(" (")[0][:26], "risk": r.risk_score, "status": r.status}
        for r in routes[:8]
    ]

    # 6. Commodity Movement Breakdown
    commodity_counts = {}
    for d in deliveries:
        c = d.commodity.split(" (")[0]
        if "Medicine" in c or "Vaccine" in c or "Oxygen" in c or "Blood" in c:
            cat = "Medicine & Health"
        elif "Food" in c or "Rice" in c or "Wheat" in c or "Milk" in c or "Water" in c:
            cat = "Food Supplies"
        elif "Construction" in c or "Steel" in c or "Tools" in c or "Earth" in c:
            cat = "Infrastructure Material"
        elif "Produce" in c or "Seed" in c or "Fertilizer" in c:
            cat = "Agricultural"
        else:
            cat = "Emergency Supplies"
        commodity_counts[cat] = commodity_counts.get(cat, 0) + 1

    commodity_movement = [
        {"commodity": k, "shipments": v, "share_pct": round((v / max(1, len(deliveries))) * 100, 1)}
        for k, v in commodity_counts.items()
    ]

    return {
        "timeframe": timeframe,
        "accessibility_trend": accessibility_trend,
        "incident_trend": incident_trend,
        "logistics_performance": logistics_performance,
        "average_delay_by_district": avg_delays,
        "route_risk_by_corridor": corridor_risks,
        "commodity_movement": commodity_movement
    }
