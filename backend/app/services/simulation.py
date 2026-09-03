import random
import datetime
from sqlalchemy.orm import Session
from ..models.models import Vehicle, Incident

def step_simulation(db: Session):
    """
    Simulate a single time-step of realistic GPS movement for active NER logistics vehicles.
    Vehicles nudge slightly along their transit vectors, adjust speeds, and change status if near incidents.
    """
    vehicles = db.query(Vehicle).all()
    incidents = db.query(Incident).filter(Incident.status == "Active").all()
    
    updated_count = 0
    
    for v in vehicles:
        if v.status == "Delivered":
            continue
            
        # Nudge coordinates by small realistic delta (approx 0.002 to 0.006 degrees)
        lat_delta = (random.random() - 0.48) * 0.005
        lng_delta = (random.random() - 0.45) * 0.006
        
        v.latitude = round(v.latitude + lat_delta, 5)
        v.longitude = round(v.longitude + lng_delta, 5)
        
        # Vary speed smoothly
        if v.status == "Moving":
            speed_change = random.uniform(-4.0, 4.0)
            v.speed = max(20.0, min(65.0, round(v.speed + speed_change, 1)))
        elif v.status == "Delayed":
            v.speed = max(8.0, min(25.0, round(v.speed + random.uniform(-2.0, 2.0), 1)))
        elif v.status == "Stopped":
            v.speed = 0.0
            
        # Check proximity to critical incidents
        near_incident = False
        for inc in incidents:
            dist = ((v.latitude - inc.latitude)**2 + (v.longitude - inc.longitude)**2)**0.5
            if dist < 0.25 and inc.severity in ["High", "Critical"]:
                near_incident = True
                break
                
        if near_incident and v.status not in ["Stopped", "At Risk"]:
            v.status = "At Risk" if random.random() > 0.5 else "Delayed"
            v.speed = round(v.speed * 0.5, 1)
        elif not near_incident and v.status in ["At Risk", "Delayed"] and random.random() > 0.6:
            v.status = "Moving"
            v.speed = 45.0
            
        v.updated_at = datetime.datetime.utcnow()
        updated_count += 1
        
    db.commit()
    return updated_count
