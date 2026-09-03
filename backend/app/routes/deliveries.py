import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import Delivery, Vehicle
from ..schemas.schemas import DeliveryResponse, DeliveryCreate

router = APIRouter(prefix="/api/deliveries", tags=["Deliveries"])

@router.get("", response_model=List[DeliveryResponse])
def list_deliveries(
    commodity: Optional[str] = Query(None, description="Filter by commodity"),
    status: Optional[str] = Query(None, description="Filter by delivery status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    search: Optional[str] = Query(None, description="Search delivery code, origin, destination"),
    db: Session = Depends(get_db)
):
    query = db.query(Delivery)
    if commodity and commodity != "All":
        query = query.filter(Delivery.commodity.ilike(f"%{commodity}%"))
    if status and status != "All":
        query = query.filter(Delivery.status == status)
    if priority and priority != "All":
        query = query.filter(Delivery.priority == priority)
    if search:
        query = query.filter(
            Delivery.delivery_code.ilike(f"%{search}%") |
            Delivery.origin.ilike(f"%{search}%") |
            Delivery.destination.ilike(f"%{search}%")
        )
    
    results = []
    for d in query.order_by(Delivery.created_at.desc()).all():
        resp = DeliveryResponse(
            id=d.id,
            delivery_code=d.delivery_code,
            commodity=d.commodity,
            origin=d.origin,
            destination=d.destination,
            vehicle_id=d.vehicle_id,
            vehicle_number=d.vehicle.vehicle_number if d.vehicle else None,
            driver=d.vehicle.driver if d.vehicle else None,
            priority=d.priority,
            status=d.status,
            eta=d.eta,
            risk_score=d.risk_score,
            notes=d.notes,
            created_at=d.created_at
        )
        results.append(resp)
    return results

@router.post("", response_model=DeliveryResponse)
def create_delivery(data: DeliveryCreate, db: Session = Depends(get_db)):
    code_suffix = uuid.uuid4().hex[:4].upper()
    code = f"DLV-NER-{code_suffix}"
    
    risk_score = 15.0
    if data.priority == "Emergency":
        risk_score = 25.0
        
    deliv = Delivery(
        delivery_code=code,
        commodity=data.commodity,
        origin=data.origin,
        destination=data.destination,
        vehicle_id=data.vehicle_id,
        priority=data.priority,
        status="In Transit",
        eta=data.eta,
        risk_score=risk_score,
        notes=data.notes or "Government essential supply mission.",
        created_at=datetime.datetime.utcnow()
    )
    db.add(deliv)
    db.commit()
    db.refresh(deliv)
    
    return DeliveryResponse(
        id=deliv.id,
        delivery_code=deliv.delivery_code,
        commodity=deliv.commodity,
        origin=deliv.origin,
        destination=deliv.destination,
        vehicle_id=deliv.vehicle_id,
        vehicle_number=deliv.vehicle.vehicle_number if deliv.vehicle else None,
        driver=deliv.vehicle.driver if deliv.vehicle else None,
        priority=deliv.priority,
        status=deliv.status,
        eta=deliv.eta,
        risk_score=deliv.risk_score,
        notes=deliv.notes,
        created_at=deliv.created_at
    )

@router.put("/{delivery_id}/status")
def update_delivery_status(delivery_id: int, status: str = Query(...), db: Session = Depends(get_db)):
    deliv = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not deliv:
        raise HTTPException(status_code=404, detail="Delivery not found")
    deliv.status = status
    db.commit()
    return {"success": True, "status": deliv.status}
