from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import WeatherRecord
from ..schemas.schemas import WeatherResponse

router = APIRouter(prefix="/api/weather", tags=["Weather"])

@router.get("", response_model=List[WeatherResponse])
def get_weather(
    state: Optional[str] = Query(None, description="Filter by state"),
    district: Optional[str] = Query(None, description="Filter by district name"),
    db: Session = Depends(get_db)
):
    query = db.query(WeatherRecord)
    if state and state != "Entire NER":
        query = query.filter(WeatherRecord.state == state)
    if district:
        query = query.filter(WeatherRecord.district_name.ilike(f"%{district}%"))
    return [WeatherResponse.model_validate(w) for w in query.all()]
