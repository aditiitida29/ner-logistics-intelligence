import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="officer")
    department = Column(String(100), default="North Eastern Logistics Authority")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class District(Base):
    __tablename__ = "districts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    state = Column(String(50), nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    accessibility_score = Column(Float, default=85.0)
    risk_score = Column(Float, default=25.0)
    incident_count = Column(Integer, default=0)
    vehicle_count = Column(Integer, default=0)
    connectivity_level = Column(String(30), default="Normal")
    weather_summary = Column(String(100), default="Scattered Rain")

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50), nullable=False)  # Landslide, Flood, Road Damage, Bridge Damage, Traffic, Weather, Other
    description = Column(Text, nullable=False)
    severity = Column(String(30), nullable=False)  # Low, Medium, High, Critical
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String(150), nullable=False)
    image_path = Column(String(255), nullable=True)
    reported_by = Column(String(100), default="Field Officer")
    status = Column(String(50), default="Active")  # Active, In Progress, Resolved
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    estimated_restoration = Column(String(100), default="4-8 Hours")
    district_name = Column(String(100), nullable=True)
    sync_status = Column(String(50), default="Synced")  # Synced, Pending, Offline-Created

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_number = Column(String(50), unique=True, nullable=False, index=True)
    driver = Column(String(100), nullable=False)
    driver_contact = Column(String(50), default="+91 98765 43210")
    commodity = Column(String(100), nullable=False)  # Medicine, Food, Construction, Agriculture, Emergency Supplies
    origin = Column(String(100), nullable=False)
    destination = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    speed = Column(Float, default=45.0)  # km/h
    status = Column(String(50), default="Moving")  # Moving, Delayed, Stopped, At Risk, Delivered
    eta = Column(String(50), default="2 hrs 30 mins")
    current_corridor = Column(String(100), default="NH-27")
    heading = Column(Float, default=90.0)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

    deliveries = relationship("Delivery", back_populates="vehicle")

class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)
    delivery_code = Column(String(50), unique=True, nullable=False, index=True)
    commodity = Column(String(100), nullable=False)
    origin = Column(String(100), nullable=False)
    destination = Column(String(100), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    priority = Column(String(30), default="Normal")  # Normal, High, Emergency
    status = Column(String(50), default="In Transit")  # In Transit, Delayed, Delivered, At Risk, Cancelled
    eta = Column(String(50), default="Today, 18:00")
    risk_score = Column(Float, default=20.0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    vehicle = relationship("Vehicle", back_populates="deliveries")

class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    origin = Column(String(100), nullable=False)
    destination = Column(String(100), nullable=False)
    distance_km = Column(Float, nullable=False)
    estimated_time_mins = Column(Integer, nullable=False)
    risk_score = Column(Float, default=25.0)
    accessibility_score = Column(Float, default=85.0)
    status = Column(String(50), default="Accessible")  # Accessible, Caution, High Risk, Blocked, Emergency Corridor
    waypoints_json = Column(Text, nullable=False)  # JSON array of [lat, lng] coordinates
    is_emergency_corridor = Column(Boolean, default=False)
    weather_risk = Column(Float, default=20.0)
    incident_risk = Column(Float, default=15.0)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(30), nullable=False)  # Critical, Warning, Information
    location = Column(String(100), nullable=False)
    related_type = Column(String(50), nullable=True)  # route, vehicle, incident, district
    related_id = Column(String(50), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class WeatherRecord(Base):
    __tablename__ = "weather_records"

    id = Column(Integer, primary_key=True, index=True)
    district_name = Column(String(100), nullable=False, index=True)
    state = Column(String(50), nullable=False)
    temperature = Column(Float, default=24.5)
    rainfall_mm = Column(Float, default=12.0)
    humidity = Column(Float, default=85.0)
    wind_speed_kmh = Column(Float, default=15.0)
    weather_condition = Column(String(50), default="Moderate Rain")
    risk_level = Column(String(30), default="Medium")  # Low, Medium, High, Severe
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
