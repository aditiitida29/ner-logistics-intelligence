import os
import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from sqlalchemy.orm import Session
from ..database import get_db, BASE_DIR
from ..models.models import Incident, Alert, User
from ..schemas.schemas import IncidentResponse, IncidentUpdate
from ..auth.dependencies import require_super_admin

router = APIRouter(prefix="/api/incidents", tags=["Incidents"])

UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

@router.get("", response_model=List[IncidentResponse])
def list_incidents(
    type: Optional[str] = Query(None, description="Filter by incident type"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    status: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search location, affected route, or description"),
    db: Session = Depends(get_db)
):
    """List all incidents. Accessible by both Super Admin and Normal Users."""
    query = db.query(Incident)
    if type and type != "All":
        query = query.filter(Incident.type == type)
    if severity and severity != "All":
        query = query.filter(Incident.severity == severity)
    if status and status != "All":
        query = query.filter(Incident.status == status)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            Incident.location_name.ilike(search_pattern) |
            Incident.description.ilike(search_pattern) |
            Incident.affected_route.ilike(search_pattern)
        )
    return [IncidentResponse.model_validate(i) for i in query.order_by(Incident.created_at.desc()).all()]

@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    """Retrieve full incident details. Accessible by both Super Admin and Normal Users."""
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found.")
    return IncidentResponse.model_validate(inc)

@router.post("", response_model=IncidentResponse)
async def create_incident(
    type: str = Form(...),
    description: str = Form(...),
    severity: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    location_name: str = Form(...),
    affected_route: Optional[str] = Form(None),
    incident_time: Optional[str] = Form(None),
    reported_by: Optional[str] = Form("Field Officer"),
    estimated_restoration: Optional[str] = Form("4-6 Hours"),
    district_name: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
    current_admin: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """
    Create a new incident/landslide.
    STRICTLY RESTRICTED: Super Admin only.
    """
    image_url = None
    if photo and photo.filename:
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

    # Parse optional incident_time if provided
    parsed_time = datetime.datetime.utcnow()
    if incident_time:
        try:
            parsed_time = datetime.datetime.fromisoformat(incident_time.replace("Z", "+00:00"))
        except Exception:
            parsed_time = datetime.datetime.utcnow()

    new_inc = Incident(
        type=type,
        description=description,
        severity=severity,
        latitude=latitude,
        longitude=longitude,
        location_name=location_name,
        affected_route=affected_route,
        image_path=image_url,
        reported_by=reported_by or current_admin.name or "Super Admin Command",
        status="Active",
        estimated_restoration=estimated_restoration or "4-6 Hours",
        district_name=district_name,
        created_at=datetime.datetime.utcnow(),
        incident_time=parsed_time
    )
    db.add(new_inc)
    db.commit()
    db.refresh(new_inc)

    # Automatic alert generation for Landslides and High/Critical incidents
    route_label = f" on {affected_route}" if affected_route else ""
    if type == "Landslide" or severity in ["High", "Critical"]:
        alert = Alert(
            title=f"🚨 {severity.upper()} {type.upper()}: {location_name}{route_label}",
            description=f"Reported by {new_inc.reported_by}: {description}. Estimated restoration: {estimated_restoration}.",
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

@router.put("/{incident_id}", response_model=IncidentResponse)
def update_incident(
    incident_id: int,
    payload: IncidentUpdate,
    current_admin: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """
    Update an existing incident/landslide (location, route, severity, status, description, date/time).
    STRICTLY RESTRICTED: Super Admin only.
    """
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found.")

    prev_status = inc.status

    # Apply updates if provided in payload
    if payload.type is not None:
        inc.type = payload.type
    if payload.description is not None:
        inc.description = payload.description
    if payload.severity is not None:
        inc.severity = payload.severity
    if payload.latitude is not None:
        inc.latitude = payload.latitude
    if payload.longitude is not None:
        inc.longitude = payload.longitude
    if payload.location_name is not None:
        inc.location_name = payload.location_name
    if payload.affected_route is not None:
        inc.affected_route = payload.affected_route
    if payload.reported_by is not None:
        inc.reported_by = payload.reported_by
    if payload.status is not None:
        inc.status = payload.status
    if payload.estimated_restoration is not None:
        inc.estimated_restoration = payload.estimated_restoration
    if payload.district_name is not None:
        inc.district_name = payload.district_name
    if payload.incident_time is not None:
        inc.incident_time = payload.incident_time

    db.commit()
    db.refresh(inc)

    # If status transitioned to Resolved or Closed, publish resolution alert
    route_label = f" on {inc.affected_route}" if inc.affected_route else ""
    if inc.status.lower() in ["resolved", "closed"] and prev_status.lower() not in ["resolved", "closed"]:
        resolution_alert = Alert(
            title=f"✅ CLEARANCE NOTICE: {inc.type} Resolved at {inc.location_name}{route_label}",
            description=f"Road clearance operations completed. Traffic and freight transit resumed at {inc.location_name}.",
            severity="Information",
            location=inc.location_name,
            related_type="incident",
            related_id=str(inc.id),
            is_read=False,
            created_at=datetime.datetime.utcnow()
        )
        db.add(resolution_alert)
        db.commit()
    elif inc.severity in ["High", "Critical"]:
        # Publish update alert for high priority alerts
        update_alert = Alert(
            title=f"⚠️ INCIDENT UPDATE: {inc.type} at {inc.location_name}{route_label}",
            description=f"Status: {inc.status}. Severity: {inc.severity}. Clearance estimate: {inc.estimated_restoration}.",
            severity="Critical" if inc.severity == "Critical" else "Warning",
            location=inc.location_name,
            related_type="incident",
            related_id=str(inc.id),
            is_read=False,
            created_at=datetime.datetime.utcnow()
        )
        db.add(update_alert)
        db.commit()

    return IncidentResponse.model_validate(inc)

@router.put("/{incident_id}/status")
def update_incident_status(
    incident_id: int,
    status: str = Query(..., description="Active, In Progress, Resolved, or Closed"),
    current_admin: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """
    Update incident status / resolve / close an incident.
    STRICTLY RESTRICTED: Super Admin only.
    """
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found.")
    
    prev_status = inc.status
    inc.status = status
    db.commit()

    # Generate resolution alert if status set to Resolved
    route_label = f" on {inc.affected_route}" if inc.affected_route else ""
    if status.lower() in ["resolved", "closed"] and prev_status.lower() not in ["resolved", "closed"]:
        resolution_alert = Alert(
            title=f"✅ CLEARANCE NOTICE: {inc.type} Resolved at {inc.location_name}{route_label}",
            description=f"Road clearance operations completed. {inc.location_name} corridor is now open.",
            severity="Information",
            location=inc.location_name,
            related_type="incident",
            related_id=str(inc.id),
            is_read=False,
            created_at=datetime.datetime.utcnow()
        )
        db.add(resolution_alert)
        db.commit()

    return {"success": True, "incident_id": incident_id, "status": inc.status}

@router.delete("/{incident_id}")
def delete_incident(
    incident_id: int,
    current_admin: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """
    Delete an incident.
    STRICTLY RESTRICTED: Super Admin only.
    """
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found.")
    
    # Remove associated alerts
    db.query(Alert).filter(Alert.related_type == "incident", Alert.related_id == str(incident_id)).delete()
    
    db.delete(inc)
    db.commit()
    return {"success": True, "message": f"Incident #{incident_id} successfully deleted."}
