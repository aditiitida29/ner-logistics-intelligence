import time
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..seed import seed_database

router = APIRouter(prefix="/api/system", tags=["System"])

SYSTEM_STATE = {
    "demo_mode": True,
    "simulation_active": True,
    "offline_sync_enabled": True,
    "version": "1.0.0-hackathon-mvp"
}

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    return {
        "status": "healthy",
        "timestamp": int(time.time()),
        "service": "NER Logistics Intelligence API",
        "demo_mode": SYSTEM_STATE["demo_mode"],
        "database": "connected (SQLite)"
    }

@router.get("/status")
def get_system_status():
    return SYSTEM_STATE

@router.post("/toggle-simulation")
def toggle_simulation(enabled: bool):
    SYSTEM_STATE["simulation_active"] = enabled
    return {"success": True, "simulation_active": enabled}

@router.post("/toggle-demo-mode")
def toggle_demo_mode(enabled: bool):
    SYSTEM_STATE["demo_mode"] = enabled
    return {"success": True, "demo_mode": enabled}

@router.post("/reset-demo-data")
def reset_demo_data():
    seed_database()
    return {"success": True, "message": "Demo data refreshed successfully."}
