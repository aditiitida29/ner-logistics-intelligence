from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# Authentication
class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    department: str

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# District
class DistrictResponse(BaseModel):
    id: int
    name: str
    state: str
    latitude: float
    longitude: float
    accessibility_score: float
    risk_score: float
    incident_count: int
    vehicle_count: int
    connectivity_level: str
    weather_summary: str

    class Config:
        from_attributes = True

# Incident
class IncidentCreate(BaseModel):
    type: str
    description: str
    severity: str
    latitude: float
    longitude: float
    location_name: str
    reported_by: Optional[str] = "Field Officer"
    estimated_restoration: Optional[str] = "4-6 Hours"
    district_name: Optional[str] = None
    affected_route: Optional[str] = None
    incident_time: Optional[datetime] = None
    sync_status: Optional[str] = "Synced"

class IncidentUpdate(BaseModel):
    type: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None
    reported_by: Optional[str] = None
    status: Optional[str] = None
    estimated_restoration: Optional[str] = None
    district_name: Optional[str] = None
    affected_route: Optional[str] = None
    incident_time: Optional[datetime] = None

class IncidentResponse(BaseModel):
    id: int
    type: str
    description: str
    severity: str
    latitude: float
    longitude: float
    location_name: str
    image_path: Optional[str] = None
    reported_by: str
    status: str
    created_at: datetime
    incident_time: Optional[datetime] = None
    estimated_restoration: str
    district_name: Optional[str] = None
    affected_route: Optional[str] = None
    sync_status: Optional[str] = "Synced"

    class Config:
        from_attributes = True

# Vehicle
class VehicleResponse(BaseModel):
    id: int
    vehicle_number: str
    driver: str
    driver_contact: str
    commodity: str
    origin: str
    destination: str
    latitude: float
    longitude: float
    speed: float
    status: str
    eta: str
    current_corridor: str
    heading: float
    updated_at: datetime

    class Config:
        from_attributes = True

class VehicleGPSUpdate(BaseModel):
    vehicle_id: Optional[int] = None
    vehicle_number: Optional[str] = None
    latitude: float
    longitude: float
    speed: Optional[float] = None
    status: Optional[str] = None
    timestamp: Optional[str] = None

# Delivery
class DeliveryCreate(BaseModel):
    commodity: str
    origin: str
    destination: str
    vehicle_id: Optional[int] = None
    priority: str = "Normal"
    eta: str = "Today, 18:00"
    notes: Optional[str] = None

class DeliveryResponse(BaseModel):
    id: int
    delivery_code: str
    commodity: str
    origin: str
    destination: str
    vehicle_id: Optional[int] = None
    vehicle_number: Optional[str] = None
    driver: Optional[str] = None
    priority: str
    status: str
    eta: str
    risk_score: float
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Route & AI Intelligence
class RouteAnalysisRequest(BaseModel):
    origin: str
    destination: str
    commodity: str = "Medicine"
    vehicle_type: str = "Truck"
    priority: str = "Normal"

class RiskFactorBreakdown(BaseModel):
    weather_risk: float
    incident_risk: float
    road_condition: float
    traffic_risk: float
    historical_risk: float
    explanation: List[str]

class RouteOption(BaseModel):
    route_id: str
    name: str
    category: str  # "Recommended", "Alternative 1", "Alternative 2", etc.
    distance_km: float
    estimated_time_mins: int
    estimated_delay_mins: int
    accessibility_score: float
    risk_score: float
    risk_level: str  # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    incident_count: int
    weather_condition: str
    waypoints: List[List[float]]
    explainability: RiskFactorBreakdown
    status: str

class RouteAnalysisResponse(BaseModel):
    origin: str
    destination: str
    commodity: str
    vehicle_type: str
    priority: str
    recommended_route: RouteOption
    alternate_routes: List[RouteOption]

# Alerts
class AlertResponse(BaseModel):
    id: int
    title: str
    description: str
    severity: str
    location: str
    related_type: Optional[str] = None
    related_id: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Weather
class WeatherResponse(BaseModel):
    id: int
    district_name: str
    state: str
    temperature: float
    rainfall_mm: float
    humidity: float
    wind_speed_kmh: float
    weather_condition: str
    risk_level: str
    updated_at: datetime

    class Config:
        from_attributes = True

# AI Insights
class AIInsight(BaseModel):
    id: str
    title: str
    insight: str
    recommendation: str
    severity: str  # info, warning, critical
    category: str

# Dashboard
class DashboardKPIs(BaseModel):
    network_accessibility_pct: float
    network_accessibility_change: str
    active_vehicles: int
    active_incidents: int
    at_risk_routes: int
    delayed_deliveries: int
    emergency_corridors: int

class DashboardResponse(BaseModel):
    kpis: DashboardKPIs
    selected_region: str
    accessibility_trend: List[Dict[str, Any]]
    incident_distribution: List[Dict[str, Any]]
    logistics_status: List[Dict[str, Any]]
    district_connectivity: List[Dict[str, Any]]
    ai_insights: List[AIInsight]
    critical_alerts: List[AlertResponse]
    recent_incidents: List[IncidentResponse]
    active_vehicles_sample: List[VehicleResponse]
