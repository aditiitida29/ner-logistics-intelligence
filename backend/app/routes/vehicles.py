import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import Vehicle
from ..schemas.schemas import VehicleResponse, VehicleGPSUpdate
from ..services.simulation import step_simulation

router = APIRouter(prefix="/api/vehicles", tags=["Vehicles"])

@router.get("", response_model=List[VehicleResponse])
def list_vehicles(
    status: Optional[str] = Query(None, description="Filter by status (Moving, Delayed, Stopped, At Risk, Delivered)"),
    commodity: Optional[str] = Query(None, description="Filter by cargo/commodity"),
    search: Optional[str] = Query(None, description="Search vehicle number or driver"),
    db: Session = Depends(get_db)
):
    query = db.query(Vehicle)
    if status and status != "All":
        query = query.filter(Vehicle.status == status)
    if commodity and commodity != "All":
        query = query.filter(Vehicle.commodity.ilike(f"%{commodity}%"))
    if search:
        query = query.filter(
            Vehicle.vehicle_number.ilike(f"%{search}%") | Vehicle.driver.ilike(f"%{search}%")
        )
    return [VehicleResponse.model_validate(v) for v in query.all()]

@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return VehicleResponse.model_validate(vehicle)

@router.post("/{vehicle_id}/gps", response_model=VehicleResponse)
def update_vehicle_gps(vehicle_id: int, payload: VehicleGPSUpdate, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    vehicle.latitude = payload.latitude
    vehicle.longitude = payload.longitude
    if payload.speed is not None:
        vehicle.speed = payload.speed
    if payload.status:
        vehicle.status = payload.status
    vehicle.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(vehicle)
    return VehicleResponse.model_validate(vehicle)

@router.post("/batch-gps")
def update_batch_gps(updates: List[VehicleGPSUpdate], db: Session = Depends(get_db)):
    """Synchronize a batch of offline GPS updates submitted when network returns."""
    synced = 0
    for up in updates:
        veh = None
        if up.vehicle_id:
            veh = db.query(Vehicle).filter(Vehicle.id == up.vehicle_id).first()
        elif up.vehicle_number:
            veh = db.query(Vehicle).filter(Vehicle.vehicle_number == up.vehicle_number).first()
        if veh:
            veh.latitude = up.latitude
            veh.longitude = up.longitude
            if up.speed is not None:
                veh.speed = up.speed
            if up.status:
                veh.status = up.status
            veh.updated_at = datetime.datetime.utcnow()
            synced += 1
    db.commit()
    return {"success": True, "synced_count": synced}

@router.post("/simulate-step")
def simulate_fleet_step(db: Session = Depends(get_db)):
    """Simulate a single time step of vehicle GPS updates along corridors."""
    updated = step_simulation(db)
    vehicles = db.query(Vehicle).all()
    return {
        "success": True,
        "updated_vehicles_count": updated,
        "vehicles": [VehicleResponse.model_validate(v) for v in vehicles]
    }
