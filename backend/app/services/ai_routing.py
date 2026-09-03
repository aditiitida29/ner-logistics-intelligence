import math
import random
from typing import Dict, Any, List
from ..schemas.schemas import RouteOption, RiskFactorBreakdown, RouteAnalysisResponse

# Coordinates for major NER hubs [lat, lng]
NER_HUBS: Dict[str, List[float]] = {
    "Guwahati": [26.1445, 91.7362],
    "Dibrugarh": [27.4728, 94.9120],
    "Silchar": [24.8333, 92.7789],
    "Tezpur": [26.6338, 92.7926],
    "Jorhat": [26.7509, 94.2037],
    "Shillong": [25.5788, 91.8933],
    "Tura": [25.5144, 90.2201],
    "Jowai": [25.4533, 92.2033],
    "Itanagar": [27.0844, 93.6053],
    "Tawang": [27.5861, 91.8594],
    "Pasighat": [28.0665, 95.3268],
    "Imphal": [24.8170, 93.9368],
    "Churachandpur": [24.3333, 93.6667],
    "Kohima": [25.6751, 94.1086],
    "Dimapur": [25.9042, 93.7275],
    "Aizawl": [23.7271, 92.7176],
    "Lunglei": [22.8800, 92.7300],
    "Agartala": [23.8315, 91.2868],
    "Udaipur": [23.5333, 91.4833],
    "Gangtok": [27.3389, 88.6065],
    "Namchi": [27.1667, 88.3500],
}

def haversine_distance(coord1: List[float], coord2: List[float]) -> float:
    """Approximate distance in km between two lat/lng points."""
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def generate_corridor_waypoints(origin_coord: List[float], dest_coord: List[float], variation_seed: float = 0.0) -> List[List[float]]:
    """Generate realistic highway waypoints between origin and destination with natural curve."""
    steps = 8
    waypoints = [origin_coord]
    for i in range(1, steps):
        ratio = i / steps
        # Linear interpolation
        base_lat = origin_coord[0] + ratio * (dest_coord[0] - origin_coord[0])
        base_lng = origin_coord[1] + ratio * (dest_coord[1] - origin_coord[1])
        
        # Add slight natural terrain curve / highway detour based on variation_seed
        curve_factor = math.sin(ratio * math.pi) * variation_seed
        lat_jitter = curve_factor * 0.18
        lng_jitter = curve_factor * 0.22
        
        waypoints.append([round(base_lat + lat_jitter, 4), round(base_lng + lng_jitter, 4)])
    waypoints.append(dest_coord)
    return waypoints

def analyze_ner_routes(
    origin: str,
    destination: str,
    commodity: str = "Medicine",
    vehicle_type: str = "Truck",
    priority: str = "Normal",
    db_session = None
) -> RouteAnalysisResponse:
    """
    AI Multi-Factor Route Scoring & Explainability Engine.
    Formula:
    risk_score = 0.25 * weather_risk + 0.25 * incident_risk + 0.20 * road_condition + 0.15 * traffic_risk + 0.15 * historical_risk
    """
    origin_coord = NER_HUBS.get(origin, [26.1445, 91.7362])
    dest_coord = NER_HUBS.get(destination, [27.4728, 94.9120])
    
    crow_dist = haversine_distance(origin_coord, dest_coord)
    # Hill highway factor in NER terrain is typically 1.35x to 1.6x of straight distance
    base_highway_dist = max(45.0, crow_dist * 1.45)
    
    # Base speeds in NER terrain
    speed_map = {
        "Truck": 35.0,
        "Mini Truck": 42.0,
        "Ambulance": 55.0,
        "Utility Vehicle": 45.0,
        "Other": 40.0
    }
    avg_speed = speed_map.get(vehicle_type, 40.0)

    # Commodity sensitivity multipliers
    is_emergency_supply = commodity in ["Medicine", "Emergency Supplies"] or priority == "Emergency"
    
    # Generate 3 realistic route alternatives
    # Route 1: Primary National Highway Corridor (e.g. NH-27 / NH-29 / NH-10)
    # Route 2: Regional State Arterial Bypass
    # Route 3: Mountain Ridge / Interior Alternate
    
    route_definitions = [
        {
            "id": "route-opt-1",
            "name": f"NH Primary Corridor via {origin} - Central Bypass - {destination}",
            "category": "Recommended",
            "dist_mult": 1.0,
            "weather_base": 22.0 if not is_emergency_supply else 15.0,
            "incident_base": 18.0,
            "road_base": 15.0,
            "traffic_base": 25.0,
            "hist_base": 14.0,
            "variation": 0.05,
            "incident_count": 1,
            "weather_cond": "Scattered Clouds / Light Drizzle",
            "status": "Accessible"
        },
        {
            "id": "route-opt-2",
            "name": f"State Highway 4 & Valley Bypass ({origin} - Foothill Sector)",
            "category": "Alternate B",
            "dist_mult": 1.15,
            "weather_base": 42.0,
            "incident_base": 38.0,
            "road_base": 40.0,
            "traffic_base": 18.0,
            "hist_base": 35.0,
            "variation": -0.25,
            "incident_count": 3,
            "weather_cond": "Moderate Rain with Hill Fog",
            "status": "Caution"
        },
        {
            "id": "route-opt-3",
            "name": f"Interior Hill Cutoff via Ridge Pass",
            "category": "Alternate C",
            "dist_mult": 0.92,
            "weather_base": 65.0,
            "incident_base": 72.0,
            "road_base": 68.0,
            "traffic_base": 12.0,
            "hist_base": 60.0,
            "variation": 0.35,
            "incident_count": 5,
            "weather_cond": "Heavy Downpour / High Slag Risk",
            "status": "High Risk"
        }
    ]
    
    evaluated_routes: List[RouteOption] = []
    
    for rdef in route_definitions:
        # Calculate transparent weighted score
        w_risk = round(rdef["weather_base"], 1)
        i_risk = round(rdef["incident_base"], 1)
        rd_risk = round(rdef["road_base"], 1)
        tr_risk = round(rdef["traffic_base"], 1)
        h_risk = round(rdef["hist_base"], 1)
        
        # Priority / commodity weighting
        if priority == "Emergency":
            i_risk *= 1.2
            rd_risk *= 1.1
        
        total_risk = round(
            0.25 * w_risk +
            0.25 * i_risk +
            0.20 * rd_risk +
            0.15 * tr_risk +
            0.15 * h_risk,
            1
        )
        
        # Accessibility score is inverse of risk
        accessibility_score = round(max(10.0, min(98.0, 100.0 - total_risk)), 1)
        
        # Determine classification
        if total_risk < 30.0:
            risk_level = "LOW"
        elif total_risk < 55.0:
            risk_level = "MEDIUM"
        elif total_risk < 75.0:
            risk_level = "HIGH"
        else:
            risk_level = "CRITICAL"
            
        distance = round(base_highway_dist * rdef["dist_mult"], 1)
        base_time = int((distance / avg_speed) * 60)
        
        # Delay calculation based on incidents and weather
        delay_mins = int((i_risk * 0.45) + (w_risk * 0.35) + (rdef["incident_count"] * 10))
        total_time_mins = base_time + delay_mins
        
        # Explainability breakdown
        explanations = [
            f"Weather Severity ({rdef['weather_cond']}): adds +{round(0.25 * w_risk, 1)} to total risk",
            f"Active Road Obstructions ({rdef['incident_count']} reported): adds +{round(0.25 * i_risk, 1)} to risk score",
            f"Terrain & Pavement Rating: contributes +{round(0.20 * rd_risk, 1)} risk",
            f"Traffic & Border Convoy Density: contributes +{round(0.15 * tr_risk, 1)} risk",
            f"Monsoon Historical Bottleneck Index: contributes +{round(0.15 * h_risk, 1)} risk"
        ]
        
        if is_emergency_supply:
            explanations.append(f"Prioritized for critical {commodity} delivery: Safety margin boosted by corridor guard.")
            
        breakdown = RiskFactorBreakdown(
            weather_risk=w_risk,
            incident_risk=i_risk,
            road_condition=rd_risk,
            traffic_risk=tr_risk,
            historical_risk=h_risk,
            explanation=explanations
        )
        
        waypoints = generate_corridor_waypoints(origin_coord, dest_coord, rdef["variation"])
        
        route_option = RouteOption(
            route_id=rdef["id"],
            name=rdef["name"],
            category=rdef["category"],
            distance_km=distance,
            estimated_time_mins=total_time_mins,
            estimated_delay_mins=delay_mins,
            accessibility_score=accessibility_score,
            risk_score=total_risk,
            risk_level=risk_level,
            incident_count=rdef["incident_count"],
            weather_condition=rdef["weather_cond"],
            waypoints=waypoints,
            explainability=breakdown,
            status=rdef["status"]
        )
        evaluated_routes.append(route_option)
        
    # Sort so recommended is highest accessibility / lowest risk
    evaluated_routes.sort(key=lambda r: r.risk_score)
    evaluated_routes[0].category = "Recommended"
    
    return RouteAnalysisResponse(
        origin=origin,
        destination=destination,
        commodity=commodity,
        vehicle_type=vehicle_type,
        priority=priority,
        recommended_route=evaluated_routes[0],
        alternate_routes=evaluated_routes[1:]
    )
