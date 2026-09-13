from typing import List, Optional
import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import Alert, Incident, User
from ..schemas.schemas import AlertResponse
from ..auth.dependencies import require_super_admin

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertResponse])
def list_alerts(
    severity: Optional[str] = Query(None, description="Filter by severity (Critical, Warning, Information)"),
    unread_only: Optional[bool] = Query(False, description="Filter unread only"),
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if severity and severity != "All":
        query = query.filter(Alert.severity == severity)
    if unread_only:
        query = query.filter(Alert.is_read == False)
    return [AlertResponse.model_validate(a) for a in query.order_by(Alert.created_at.desc()).all()]

@router.put("/{alert_id}/read")
def mark_alert_read(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_read = True
    db.commit()
    return {"success": True, "alert_id": alert_id, "is_read": True}

@router.post("/mark-all-read")
def mark_all_alerts_read(db: Session = Depends(get_db)):
    db.query(Alert).filter(Alert.is_read == False).update({"is_read": True})
    db.commit()
    return {"success": True, "message": "All alerts marked as read"}

@router.post("/{alert_id}/resolve")
def resolve_alert(
    alert_id: int,
    current_admin: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """
    Resolve an alert/hazard and broadcast an official Clearance Notice to all Normal Users.
    STRICTLY RESTRICTED: Super Admin only.
    """
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.is_read = True

    route_name = None
    if alert.related_type == "incident" and alert.related_id:
        try:
            inc_id = int(alert.related_id)
            inc = db.query(Incident).filter(Incident.id == inc_id).first()
            if inc:
                inc.status = "Resolved"
                route_name = inc.affected_route
                db.commit()
        except Exception:
            pass

    route_label = f" on {route_name}" if route_name else ""
    clearance_alert = Alert(
        title=f"✅ CLEARANCE NOTICE: Resolved at {alert.location}{route_label}",
        description=f"Road clearance operations completed by {current_admin.name or 'Super Admin'}. {alert.location} corridor is now verified open and safe for normal commuter traffic.",
        severity="Information",
        location=alert.location,
        related_type=alert.related_type,
        related_id=alert.related_id,
        is_read=False,
        created_at=datetime.datetime.utcnow()
    )
    db.add(clearance_alert)
    db.commit()
    db.refresh(clearance_alert)

    return {
        "success": True,
        "message": f"Alert #{alert_id} resolved! Clearance Notice broadcast to all users.",
        "clearance_alert": AlertResponse.model_validate(clearance_alert)
    }

