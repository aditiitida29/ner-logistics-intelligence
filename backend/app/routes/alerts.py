from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import Alert
from ..schemas.schemas import AlertResponse

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
