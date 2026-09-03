import os
import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from ..database import get_db, BASE_DIR
from ..models.models import Incident, Alert
from ..schemas.schemas import IncidentResponse

router = APIRouter(prefix="/api/incidents", tags=["Incidents"])

UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

@router.get("", response_model=List[IncidentResponse])
def list_incidents(
    type: Optional[str] = Query(None, description="Filter by incident type"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    status: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search location or description"),
    db: Session = Depends(get_db)
):
    query = db.query(Incident)
    if type and type != "All":
        query = query.filter(Incident.type == type)
    if severity and severity != "All":
        query = query.filter(Incident.severity == severity)
    if status and status != "All":
        query = query.filter(Incident.status == status)
    if search:
        query = query.filter(
            Incident.location_name.ilike(f"%{search}%") | Incident.description.ilike(f"%{search}%")
        )
    return [IncidentResponse.model_validate(i) for i in query.order_by(Incident.created_at.desc()).all()]

@router.post("", response_model=IncidentResponse)
async def create_incident(
    type: str = Form(...),
    description: str = Form(...),
    severity: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    location_name: str = Form(...),
    reported_by: Optional[str] = Form("Field Officer"),
    estimated_restoration: Optional[str] = Form("4-6 Hours"),
    district_name: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    image_url = None
    if photo and photo.filename:
        # Validate file extension
        ext = os.path.splitext(photo.filename)[1].lower()
        if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
            raise HTTPException(status_code=400, detail="Only JPG, PNG, and WebP images are allowed.")
        
        filename = f"{uuid.uuid4()}{ext}"
        filepath = os.path.join(UPLOADS_DIR, filename)
        content = await photo.read()
        if len(content) > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(status_code=400, detail="File size exceeds 10MB limit.")
            
        with open(filepath, "wb") as f:
            f.write(content)
        image_url = f"/uploads/{filename}"

    new_inc = Incident(
        type=type,
        description=description,
        severity=severity,
        latitude=latitude,
        longitude=longitude,
        location_name=location_name,
        image_path=image_url,
        reported_by=reported_by or "Field Officer",
        status="Active",
        estimated_restoration=estimated_restoration or "4-6 Hours",
        district_name=district_name,
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_inc)
    db.commit()
    db.refresh(new_inc)

    # Automatic alert generation for High/Critical severity
    if severity in ["High", "Critical"]:
        alert = Alert(
            title=f"🚨 {severity.upper()} INCIDENT: {type} at {location_name}",
            description=f"New report by {reported_by}: {description}. Estimated clearance: {estimated_restoration}.",
            severity="Critical" if severity == "Critical" else "Warning",
            location=location_name,
            related_type="incident",
            related_id=str(new_inc.id),
            is_read=False,
            created_at=datetime.datetime.utcnow()
        )
        db.add(alert)
        db.commit()

    return IncidentResponse.model_validate(new_inc)

@router.put("/{incident_id}/status")
def update_incident_status(incident_id: int, status: str = Query(...), db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    inc.status = status
    db.commit()
    return {"success": True, "status": inc.status}
