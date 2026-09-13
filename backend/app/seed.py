import json
import random
import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text
from .database import Base, engine, SessionLocal
from .models.models import (
    User, District, Incident, Vehicle, Delivery, Route, Alert, WeatherRecord
)
from .utils.auth_utils import hash_password

def seed_database():
    """Seed comprehensive realistic NER logistics and accessibility data."""
    Base.metadata.create_all(bind=engine)
    
    # Safe auto-migrations for incidents table
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE incidents ADD COLUMN sync_status VARCHAR(50) DEFAULT 'Synced'"))
            conn.commit()
    except Exception:
        pass

    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE incidents ADD COLUMN affected_route VARCHAR(100)"))
            conn.commit()
    except Exception:
        pass

    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE incidents ADD COLUMN incident_time DATETIME"))
            conn.commit()
    except Exception:
        pass

    db: Session = SessionLocal()

    try:
        # Ensure all RBAC demo accounts are seeded (Super Admin, Normal User, and supporting roles)
        demo_users = [
            {
                "email": "admin@nerlogistics.gov.in",
                "name": "Dr. A. Sharma (Super Admin)",
                "role": "super_admin",
                "department": "North Eastern Council & MoRTH Logistics Wing"
            },
            {
                "email": "citizen@nerlogistics.gov.in",
                "name": "Priya Sharma (Normal User / Commuter)",
                "role": "normal_user",
                "department": "Public Commuter & Citizen Transit Portal"
            },
            {
                "email": "state@nerlogistics.gov.in",
                "name": "Rajesh Kalita (Assam State Director)",
                "role": "state_admin",
                "department": "Assam State Logistics Coordination Agency"
            },
            {
                "email": "field@nerlogistics.gov.in",
                "name": "K. Meitei (Field Incident Officer)",
                "role": "field_officer",
                "department": "NHIDCL Mountain Rapid Incident Unit"
            },
            {
                "email": "logistics@nerlogistics.gov.in",
                "name": "Vikram Das (Logistics & Fleet Operator)",
                "role": "logistics_operator",
                "department": "NER Central Supply Dispatch Center"
            },
            {
                "email": "driver@nerlogistics.gov.in",
                "name": "Pranab Gogoi (Highway Convoy Driver)",
                "role": "driver",
                "department": "Assam-Arunachal Cold-Chain Express Fleet"
            }
        ]

        for udata in demo_users:
            existing = db.query(User).filter(User.email == udata["email"]).first()
            if not existing:
                db.add(User(
                    name=udata["name"],
                    email=udata["email"],
                    password_hash=hash_password("admin123"),
                    role=udata["role"],
                    department=udata["department"]
                ))
            else:
                existing.role = udata["role"]
                existing.password_hash = hash_password("admin123")
        db.commit()

        # Update existing incidents affected_route if empty
        route_mappings = {
            "Sela Pass": "NH-13",
            "Bogibeel": "NH-37",
            "Zubza": "NH-29",
            "Kangpokpi": "NH-2",
            "Sonapur": "NH-6",
            "Silchar": "NH-306",
            "Rangpo": "NH-10",
            "Khanapara": "NH-27",
            "Shillong": "NH-106",
            "Tuirial": "NH-54",
            "Papum": "NH-415",
            "Chumukedima": "NH-29",
            "Torhung": "Tiddim Road",
            "Tezpur": "NH-715",
            "Lunglei": "NH-54",
            "Agartala": "NH-8",
            "South Sikkim": "SH-7",
            "Jorhat": "NH-715",
            "Siang": "NH-515",
            "Garo Hills": "NH-217",
            "Jung Waterfall": "NH-13",
            "Cachar": "NH-37",
            "Udaipur": "NH-8",
            "Kohima": "NH-29",
            "Imphal": "NH-102",
            "Dikchu": "NH-10"
        }
        for inc in db.query(Incident).all():
            if not inc.affected_route:
                matched = False
                for key, route_val in route_mappings.items():
                    if key.lower() in (inc.location_name or "").lower() or key.lower() in (inc.description or "").lower():
                        inc.affected_route = route_val
                        matched = True
                        break
                if not matched:
                    inc.affected_route = "NH-27 Corridor"
        db.commit()

        # Check if rest of data is already seeded
        if db.query(District).first():
            print("Districts and operational datasets already present. Seeded SUPER_ADMIN & NORMAL_USER accounts with routes.")
            return

        print("Seeding database with realistic North Eastern Region logistics data...")

        # 2. Districts across all 8 NER states
        districts_data = [
            # Assam
            {"name": "Kamrup Metropolitan", "state": "Assam", "lat": 26.1445, "lng": 91.7362, "acc": 94.2, "risk": 14.5, "inc": 2, "veh": 14, "conn": "High", "weather": "Partly Cloudy"},
            {"name": "Dibrugarh", "state": "Assam", "lat": 27.4728, "lng": 94.9120, "acc": 81.5, "risk": 42.0, "inc": 3, "veh": 9, "conn": "Moderate", "weather": "Heavy Rain"},
            {"name": "Cachar", "state": "Assam", "lat": 24.8333, "lng": 92.7789, "acc": 76.8, "risk": 48.2, "inc": 4, "veh": 8, "conn": "Moderate", "weather": "Waterlogging"},
            {"name": "Sonitpur", "state": "Assam", "lat": 26.6338, "lng": 92.7926, "acc": 89.0, "risk": 22.0, "inc": 1, "veh": 6, "conn": "High", "weather": "Clear"},
            {"name": "Jorhat", "state": "Assam", "lat": 26.7509, "lng": 94.2037, "acc": 91.2, "risk": 18.0, "inc": 1, "veh": 7, "conn": "High", "weather": "Scattered Clouds"},
            
            # Arunachal Pradesh
            {"name": "Papum Pare", "state": "Arunachal Pradesh", "lat": 27.0844, "lng": 93.6053, "acc": 79.4, "risk": 38.0, "inc": 2, "veh": 5, "conn": "Moderate", "weather": "Hill Fog"},
            {"name": "Tawang", "state": "Arunachal Pradesh", "lat": 27.5861, "lng": 91.8594, "acc": 58.2, "risk": 74.5, "inc": 4, "veh": 3, "conn": "Low", "weather": "Landslide Alert / Cold Rain"},
            {"name": "East Siang", "state": "Arunachal Pradesh", "lat": 28.0665, "lng": 95.3268, "acc": 72.0, "risk": 45.0, "inc": 2, "veh": 4, "conn": "Moderate", "weather": "Moderate Rain"},

            # Meghalaya
            {"name": "East Khasi Hills", "state": "Meghalaya", "lat": 25.5788, "lng": 91.8933, "acc": 88.5, "risk": 28.0, "inc": 2, "veh": 11, "conn": "High", "weather": "Misty Drizzle"},
            {"name": "West Garo Hills", "state": "Meghalaya", "lat": 25.5144, "lng": 90.2201, "acc": 77.0, "risk": 39.5, "inc": 2, "veh": 4, "conn": "Moderate", "weather": "Overcast"},
            {"name": "West Jaintia Hills", "state": "Meghalaya", "lat": 25.4533, "lng": 92.2033, "acc": 71.4, "risk": 52.0, "inc": 3, "veh": 5, "conn": "Moderate", "weather": "Heavy Downpour"},

            # Manipur
            {"name": "Imphal West", "state": "Manipur", "lat": 24.8170, "lng": 93.9368, "acc": 82.0, "risk": 36.0, "inc": 2, "veh": 8, "conn": "Moderate", "weather": "Light Showers"},
            {"name": "Churachandpur", "state": "Manipur", "lat": 24.3333, "lng": 93.6667, "acc": 66.5, "risk": 61.0, "inc": 3, "veh": 4, "conn": "Low", "weather": "Torrential Rain"},

            # Nagaland
            {"name": "Kohima", "state": "Nagaland", "lat": 25.6751, "lng": 94.1086, "acc": 74.0, "risk": 54.0, "inc": 3, "veh": 6, "conn": "Moderate", "weather": "Dense Fog"},
            {"name": "Dimapur", "state": "Nagaland", "lat": 25.9042, "lng": 93.7275, "acc": 92.0, "risk": 19.5, "inc": 1, "veh": 10, "conn": "High", "weather": "Partly Cloudy"},

            # Mizoram
            {"name": "Aizawl", "state": "Mizoram", "lat": 23.7271, "lng": 92.7176, "acc": 73.5, "risk": 51.5, "inc": 3, "veh": 6, "conn": "Moderate", "weather": "Hill Fog & Rain"},
            {"name": "Lunglei", "state": "Mizoram", "lat": 22.8800, "lng": 92.7300, "acc": 64.0, "risk": 63.0, "inc": 2, "veh": 3, "conn": "Low", "weather": "Continuous Rain"},

            # Tripura
            {"name": "West Tripura", "state": "Tripura", "lat": 23.8315, "lng": 91.2868, "acc": 93.5, "risk": 16.0, "inc": 1, "veh": 9, "conn": "High", "weather": "Clear Sky"},
            {"name": "Gomati", "state": "Tripura", "lat": 23.5333, "lng": 91.4833, "acc": 88.0, "risk": 24.0, "inc": 1, "veh": 4, "conn": "High", "weather": "Partly Cloudy"},

            # Sikkim
            {"name": "East Sikkim", "state": "Sikkim", "lat": 27.3389, "lng": 88.6065, "acc": 75.0, "risk": 49.0, "inc": 3, "veh": 6, "conn": "Moderate", "weather": "Heavy Mist"},
            {"name": "South Sikkim", "state": "Sikkim", "lat": 27.1667, "lng": 88.3500, "acc": 80.2, "risk": 35.0, "inc": 1, "veh": 4, "conn": "Moderate", "weather": "Passing Showers"},
        ]

        districts_objs = []
        for d in districts_data:
            dist = District(
                name=d["name"],
                state=d["state"],
                latitude=d["lat"],
                longitude=d["lng"],
                accessibility_score=d["acc"],
                risk_score=d["risk"],
                incident_count=d["inc"],
                vehicle_count=d["veh"],
                connectivity_level=d["conn"],
                weather_summary=d["weather"]
            )
            districts_objs.append(dist)
        db.add_all(districts_objs)
        db.commit()

        # 3. Weather Records
        weather_objs = []
        for d in districts_data:
            w = WeatherRecord(
                district_name=d["name"],
                state=d["state"],
                temperature=round(18.0 + (d["lat"] - 22.0) * 1.5, 1),
                rainfall_mm=round(d["risk"] * 1.8, 1),
                humidity=round(70.0 + (d["risk"] * 0.3), 1),
                wind_speed_kmh=round(10.0 + (d["risk"] * 0.25), 1),
                weather_condition=d["weather"],
                risk_level="High" if d["risk"] > 60 else ("Medium" if d["risk"] > 30 else "Low")
            )
            weather_objs.append(w)
        db.add_all(weather_objs)

        # 4. Realistic Incidents across NER Highways (26 incidents)
        incidents_data = [
            {"type": "Landslide", "desc": "Massive rockfall and earth slide blocking both carriageways on NH-13 near Sela Pass.", "sev": "Critical", "lat": 27.5020, "lng": 92.1030, "loc": "NH-13 Sela Pass Sector, Tawang", "est": "18 Hours", "dist": "Tawang"},
            {"type": "Flood", "desc": "Brahmaputra overflow submerging 400m stretch of highway with 2.5ft rushing water.", "sev": "Critical", "lat": 27.4200, "lng": 94.8500, "loc": "NH-37 Near Bogibeel Link, Dibrugarh", "est": "12 Hours", "dist": "Dibrugarh"},
            {"type": "Bridge Damage", "desc": "Structural fissure detected on abutment piers of bailey bridge due to river scour.", "sev": "Critical", "lat": 25.7500, "lng": 94.0200, "loc": "NH-29 Zubza Valley Bridge, Kohima", "est": "24 Hours", "dist": "Kohima"},
            {"type": "Road Damage", "desc": "Subsidence of hillside outer lane causing heavy commercial vehicle restriction.", "sev": "High", "lat": 24.9500, "lng": 93.8800, "loc": "NH-2 Kangpokpi-Imphal Mountain Pass", "est": "8 Hours", "dist": "Imphal West"},
            {"type": "Landslide", "desc": "Mudslide with uprooted pines blocking single lane; clearing crews deployed.", "sev": "High", "lat": 25.4800, "lng": 92.1800, "loc": "NH-6 Sonapur Tunnel Approach, Jaintia Hills", "est": "6 Hours", "dist": "West Jaintia Hills"},
            {"type": "Flood", "desc": "Barak river flash flood breached embankment causing diversion for heavy trucks.", "sev": "High", "lat": 24.8100, "lng": 92.7200, "loc": "NH-306 Silchar Bypass Corridor", "est": "10 Hours", "dist": "Cachar"},
            {"type": "Road Damage", "desc": "Severe road cratering and surface slippage near Teesta riverside highway.", "sev": "High", "lat": 27.2200, "lng": 88.5200, "loc": "NH-10 Rangpo-Singtam Sector, East Sikkim", "est": "7 Hours", "dist": "East Sikkim"},
            {"type": "Traffic", "desc": "Overturned petroleum tanker creating 4km tailback near Khanapara junction.", "sev": "Medium", "lat": 26.1150, "lng": 91.8100, "loc": "NH-27 Khanapara Border, Guwahati", "est": "3 Hours", "dist": "Kamrup Metropolitan"},
            {"type": "Weather", "desc": "Dense mountain fog reducing driver visibility below 10 meters on hairpin curves.", "sev": "Medium", "lat": 25.6200, "lng": 91.9300, "loc": "Shillong Peak Bypass, East Khasi Hills", "est": "4 Hours", "dist": "East Khasi Hills"},
            {"type": "Bridge Damage", "desc": "Single-lane load restriction imposed on old steel arch span (max 16T).", "sev": "Medium", "lat": 23.6800, "lng": 92.6800, "loc": "Tuirial River Crossing, Aizawl", "est": "14 Hours", "dist": "Aizawl"},
            {"type": "Landslide", "desc": "Boulders on shoulder from blast excavation; alternating convoy traffic.", "sev": "Medium", "lat": 27.1200, "lng": 93.6800, "loc": "Trans-Arunachal Highway, Papum Pare", "est": "5 Hours", "dist": "Papum Pare"},
            {"type": "Road Damage", "desc": "Culvert collapse due to heavy agricultural drainage runoff.", "sev": "Medium", "lat": 25.8800, "lng": 93.7000, "loc": "Chumukedima Sector, Dimapur", "est": "6 Hours", "dist": "Dimapur"},
            {"type": "Traffic", "desc": "Convoy security checkpoint causing 45-minute processing delays.", "sev": "Low", "lat": 24.3100, "lng": 93.6400, "loc": "Torhung Checkpost, Churachandpur", "est": "2 Hours", "dist": "Churachandpur"},
            {"type": "Weather", "desc": "Heavy squall with tree branch debris on road margins.", "sev": "Low", "lat": 26.6500, "lng": 92.8100, "loc": "Kalia Bhomora Bridge Link, Tezpur", "est": "1.5 Hours", "dist": "Sonitpur"},
            {"type": "Road Damage", "desc": "Bitumen peeling on steep gradient; reduced speed advisory 20 km/h.", "sev": "Low", "lat": 22.9200, "lng": 92.7500, "loc": "Hnahthial Access Road, Lunglei", "est": "5 Hours", "dist": "Lunglei"},
            {"type": "Flood", "desc": "Drainage overflow across 50m pavement in industrial bypass.", "sev": "Low", "lat": 23.8200, "lng": 91.3100, "loc": "Bodhjungnagar Industrial Zone, Agartala", "est": "2 Hours", "dist": "West Tripura"},
            {"type": "Landslide", "desc": "Loose gravel slide cleared; caution signs erected for descending traffic.", "sev": "Low", "lat": 27.1800, "lng": 88.3700, "loc": "Jorethang Ridge Road, South Sikkim", "est": "2 Hours", "dist": "South Sikkim"},
            {"type": "Traffic", "desc": "Heavy tea garden truck movement causing intermittent slow crawl.", "sev": "Low", "lat": 26.7600, "lng": 94.2200, "loc": "Mariani Highway Junction, Jorhat", "est": "1 Hour", "dist": "Jorhat"},
            {"type": "Bridge Damage", "desc": "Deck expansion joint inspection underway with flagmen control.", "sev": "Medium", "lat": 28.0800, "lng": 95.3400, "loc": "Siang Bridge West Bank, Pasighat", "est": "4 Hours", "dist": "East Siang"},
            {"type": "Road Damage", "desc": "Erosion of hill slope shoulder under ongoing monsoon retaining wall work.", "sev": "Medium", "lat": 25.5300, "lng": 90.2500, "loc": "Tura-Rongram Corridor, West Garo Hills", "est": "8 Hours", "dist": "West Garo Hills"},
            {"type": "Landslide", "desc": "Secondary mud flow cleared by JCB; escorts required for petroleum tankers.", "sev": "High", "lat": 27.5600, "lng": 91.8800, "loc": "Jung Waterfall Hairpin, Tawang", "est": "9 Hours", "dist": "Tawang"},
            {"type": "Weather", "desc": "High wind alert with thunderstorm gusts up to 65 km/h.", "sev": "Medium", "lat": 24.8500, "lng": 92.8100, "loc": "Kumbhirgram Link Highway, Cachar", "est": "3 Hours", "dist": "Cachar"},
            {"type": "Traffic", "desc": "Fruit and vegetable market spillover during peak morning hours.", "sev": "Low", "lat": 23.5500, "lng": 91.5000, "loc": "Matabari Temple Arterial, Udaipur", "est": "1.5 Hours", "dist": "Gomati"},
            {"type": "Road Damage", "desc": "Deep ruts formed by overloaded timber trailers; grader assigned.", "sev": "Medium", "lat": 25.6500, "lng": 94.1400, "loc": "Jakhama Highway Approach, Kohima", "est": "5 Hours", "dist": "Kohima"},
            {"type": "Flood", "desc": "Low-lying valley road water accumulation 1.2ft high.", "sev": "High", "lat": 24.7800, "lng": 93.9100, "loc": "Nambul River Overflow Sector, Imphal", "est": "6 Hours", "dist": "Imphal West"},
            {"type": "Landslide", "desc": "Hill crevice monitoring with active geological sensor alert.", "sev": "Critical", "lat": 27.3100, "lng": 88.5800, "loc": "Dikchu Hydel Road Cut, East Sikkim", "est": "16 Hours", "dist": "East Sikkim"},
        ]

        incident_objs = []
        for inc in incidents_data:
            incident_objs.append(Incident(
                type=inc["type"],
                description=inc["desc"],
                severity=inc["sev"],
                latitude=inc["lat"],
                longitude=inc["lng"],
                location_name=inc["loc"],
                reported_by="District PWD & Logistics Monitor",
                status="Active",
                estimated_restoration=inc["est"],
                district_name=inc["dist"]
            ))
        db.add_all(incident_objs)
        db.commit()

        # 5. Active Logistics Vehicles (32 vehicles)
        vehicles_data = [
            {"num": "AS-01-GC-4412", "driver": "Pranab Gogoi", "cargo": "Essential Medicines", "orig": "Guwahati", "dest": "Dibrugarh", "lat": 26.850, "lng": 93.200, "spd": 48.0, "stat": "Moving", "eta": "2h 45m", "cor": "NH-27 / NH-37"},
            {"num": "AS-11-BC-8921", "driver": "Ratan Das", "cargo": "Rice & Pulses (FCI)", "orig": "Guwahati", "dest": "Silchar", "lat": 25.200, "lng": 92.150, "spd": 22.0, "stat": "Delayed", "eta": "5h 10m", "cor": "NH-6 Hill Corridor"},
            {"num": "NL-07-A-3319", "driver": "Toshi Ao", "cargo": "Cold-Chain Vaccines", "orig": "Dimapur", "dest": "Kohima", "lat": 25.780, "lng": 93.910, "spd": 18.0, "stat": "At Risk", "eta": "1h 50m", "cor": "NH-29 Bypass"},
            {"num": "MN-01-D-5544", "driver": "Biren Singh", "cargo": "Baby Food & Formula", "orig": "Silchar", "dest": "Imphal", "lat": 24.890, "lng": 93.300, "spd": 35.0, "stat": "Moving", "eta": "3h 20m", "cor": "NH-37 Western Access"},
            {"num": "AR-01-F-7102", "driver": "Dorjee Khandu", "cargo": "Emergency Relief Kits", "orig": "Tezpur", "dest": "Tawang", "lat": 27.250, "lng": 92.400, "spd": 0.0, "stat": "Stopped", "eta": "Delayed (Pass Clear)", "cor": "NH-13 Sela Route"},
            {"num": "ML-05-K-6671", "driver": "Bahun Marwein", "cargo": "Hospital Oxygen Cylinders", "orig": "Guwahati", "dest": "Shillong", "lat": 25.880, "lng": 91.850, "spd": 52.0, "stat": "Moving", "eta": "45 mins", "cor": "NH-106 4-Lane Highway"},
            {"num": "MZ-01-H-9011", "driver": "Lalremruata", "cargo": "Petroleum Tanker", "orig": "Silchar", "dest": "Aizawl", "lat": 24.250, "lng": 92.740, "spd": 28.0, "stat": "Delayed", "eta": "4h 00m", "cor": "NH-306 Corridor"},
            {"num": "TR-01-B-2245", "driver": "Subrata Debbarma", "cargo": "Agricultural Produce", "orig": "Agartala", "dest": "Udaipur", "lat": 23.680, "lng": 91.380, "spd": 55.0, "stat": "Moving", "eta": "30 mins", "cor": "NH-8 South Corridor"},
            {"num": "SK-01-P-1188", "driver": "Karma Bhutia", "cargo": "Essential Medicines", "orig": "Siliguri", "dest": "Gangtok", "lat": 27.180, "lng": 88.510, "spd": 15.0, "stat": "At Risk", "eta": "3h 40m", "cor": "NH-10 Teesta Valley"},
            {"num": "AS-03-E-4901", "driver": "Dipankar Saikia", "cargo": "Construction Materials", "orig": "Jorhat", "dest": "Pasighat", "lat": 27.350, "lng": 94.750, "spd": 42.0, "stat": "Moving", "eta": "4h 15m", "cor": "NH-15 East Sector"},
            {"num": "AR-12-C-8032", "driver": "Tage Tado", "cargo": "Disaster Relief Food", "orig": "Itanagar", "dest": "Pasighat", "lat": 27.600, "lng": 94.400, "spd": 38.0, "stat": "Moving", "eta": "3h 10m", "cor": "Trans-Arunachal Highway"},
            {"num": "MN-04-T-1923", "driver": "Somorjit Meitei", "cargo": "Dialysis Medical Supplies", "orig": "Imphal", "dest": "Churachandpur", "lat": 24.580, "lng": 93.800, "spd": 44.0, "stat": "Moving", "eta": "50 mins", "cor": "Tiddim Road Arterial"},
            {"num": "NL-01-M-6622", "driver": "Vikato Sema", "cargo": "Seeds & Fertilizers", "orig": "Dimapur", "dest": "Mokokchung", "lat": 26.150, "lng": 94.200, "spd": 32.0, "stat": "Moving", "eta": "3h 30m", "cor": "NH-702D"},
            {"num": "ML-08-W-3489", "driver": "Pringrang Sangma", "cargo": "Wheat Flour & Rice", "orig": "Guwahati", "dest": "Tura", "lat": 25.800, "lng": 90.750, "spd": 40.0, "stat": "Moving", "eta": "3h 45m", "cor": "NH-217 West Highway"},
            {"num": "MZ-02-C-7741", "driver": "Zonunsanga", "cargo": "Drinking Water Cans", "orig": "Aizawl", "dest": "Lunglei", "lat": 23.300, "lng": 92.720, "spd": 24.0, "stat": "Delayed", "eta": "4h 30m", "cor": "NH-54 South Spine"},
            {"num": "TR-03-K-5509", "driver": "Manik Saha", "cargo": "Emergency Kits", "orig": "Guwahati", "dest": "Agartala", "lat": 24.400, "lng": 92.200, "spd": 36.0, "stat": "Moving", "eta": "6h 15m", "cor": "NH-8 North-South Link"},
            {"num": "AS-01-HH-9923", "driver": "Bhupen Bora", "cargo": "Petroleum Tanker", "orig": "Numaligarh", "dest": "Guwahati", "lat": 26.450, "lng": 92.500, "spd": 50.0, "stat": "Moving", "eta": "2h 10m", "cor": "NH-27 Expressway"},
            {"num": "SK-04-R-2301", "driver": "Pema Lepcha", "cargo": "Hospital Linen & Kits", "orig": "Gangtok", "dest": "Namchi", "lat": 27.250, "lng": 88.450, "spd": 33.0, "stat": "Moving", "eta": "1h 15m", "cor": "State Highway 7"},
            {"num": "AR-02-L-4411", "driver": "Kaling Moyong", "cargo": "Bridge Repair Steel", "orig": "Guwahati", "dest": "Itanagar", "lat": 26.900, "lng": 93.100, "spd": 46.0, "stat": "Moving", "eta": "1h 45m", "cor": "NH-415 Corridor"},
            {"num": "NL-02-J-5012", "driver": "Alem Kichu", "cargo": "LPG Gas Cylinders", "orig": "Guwahati", "dest": "Dimapur", "lat": 26.050, "lng": 93.300, "spd": 45.0, "stat": "Moving", "eta": "1h 20m", "cor": "NH-27 / NH-29"},
            {"num": "AS-12-D-7709", "driver": "Hitesh Deka", "cargo": "Livestock Feed", "orig": "Tezpur", "dest": "Jorhat", "lat": 26.680, "lng": 93.400, "spd": 52.0, "stat": "Moving", "eta": "1h 10m", "cor": "NH-715 Corridor"},
            {"num": "MN-02-B-9988", "driver": "Herojit Luwang", "cargo": "Emergency Medical Blood Units", "orig": "Guwahati", "dest": "Imphal", "lat": 25.100, "lng": 93.650, "spd": 58.0, "stat": "Moving", "eta": "Emergency Express (2h)", "cor": "Emergency Air-Land Corridor"},
            {"num": "ML-01-N-4422", "driver": "Kyrshan Lyngdoh", "cargo": "Essential Medicines", "orig": "Shillong", "dest": "Jowai", "lat": 25.510, "lng": 92.050, "spd": 41.0, "stat": "Moving", "eta": "40 mins", "cor": "NH-6 Jowai Route"},
            {"num": "MZ-04-A-1104", "driver": "Chawngthanmawia", "cargo": "Baby Food", "orig": "Silchar", "dest": "Champhai", "lat": 23.850, "lng": 93.050, "spd": 26.0, "stat": "Delayed", "eta": "5h 20m", "cor": "NH-102B Hill Link"},
            {"num": "TR-02-P-8812", "driver": "Pradip Bhowmik", "cargo": "Rice & Food Grains", "orig": "Agartala", "dest": "Dharmanagar", "lat": 24.100, "lng": 91.850, "spd": 44.0, "stat": "Moving", "eta": "2h 30m", "cor": "NH-8 Northern Arterial"},
            {"num": "SK-02-G-7044", "driver": "Sonam Wangdi", "cargo": "Emergency Road Clearing Tools", "orig": "Mangan", "dest": "Gangtok", "lat": 27.420, "lng": 88.580, "spd": 20.0, "stat": "At Risk", "eta": "2h 15m", "cor": "North Sikkim Highway"},
            {"num": "AS-25-CC-3321", "driver": "Jiten Kalita", "cargo": "Milk & Dairy", "orig": "Guwahati", "dest": "Tezpur", "lat": 26.400, "lng": 92.300, "spd": 60.0, "stat": "Moving", "eta": "1h 05m", "cor": "NH-15 High Speed"},
            {"num": "AR-07-K-9901", "driver": "Lobsang Tsering", "cargo": "Dry Ration Kits", "orig": "Bomdila", "dest": "Tawang", "lat": 27.350, "lng": 92.250, "spd": 12.0, "stat": "Stopped", "eta": "Delayed (Road Slip)", "cor": "NH-13 Mountain Pass"},
            {"num": "NL-03-B-6190", "driver": "Keviletuo Angami", "cargo": "Construction Materials", "orig": "Dimapur", "dest": "Phek", "lat": 25.720, "lng": 94.350, "spd": 30.0, "stat": "Moving", "eta": "3h 40m", "cor": "Phek Highway Link"},
            {"num": "MN-07-H-3388", "driver": "Sanatomba Singh", "cargo": "Essential Medicines", "orig": "Imphal", "dest": "Ukhrul", "lat": 25.020, "lng": 94.250, "spd": 32.0, "stat": "Moving", "eta": "1h 45m", "cor": "NH-202 Eastern Sector"},
            {"num": "ML-04-F-8201", "driver": "Wanshanlang Dkhar", "cargo": "Vegetable Carts", "orig": "Jowai", "dest": "Dawki", "lat": 25.250, "lng": 92.100, "spd": 38.0, "stat": "Moving", "eta": "1h 10m", "cor": "NH-206 Border Route"},
            {"num": "AS-01-KL-5566", "driver": "Nayan Baruah", "cargo": "Heavy Earth-Moving Spares", "orig": "Guwahati", "dest": "Silchar", "lat": 25.400, "lng": 92.350, "spd": 0.0, "stat": "Delivered", "eta": "Completed", "cor": "NH-6 Primary Corridor"},
        ]

        vehicle_objs = []
        for v in vehicles_data:
            veh = Vehicle(
                vehicle_number=v["num"],
                driver=v["driver"],
                driver_contact=f"+91 98{random.randint(100,999)} {random.randint(10000,99999)}",
                commodity=v["cargo"],
                origin=v["orig"],
                destination=v["dest"],
                latitude=v["lat"],
                longitude=v["lng"],
                speed=v["spd"],
                status=v["stat"],
                eta=v["eta"],
                current_corridor=v["cor"],
                heading=float(random.randint(45, 270)),
                updated_at=datetime.datetime.utcnow()
            )
            vehicle_objs.append(veh)
        db.add_all(vehicle_objs)
        db.commit()

        # 6. Deliveries (28 supply missions)
        deliveries_data = [
            {"code": "DLV-NER-001", "cargo": "Essential Medicines", "orig": "Guwahati", "dest": "Dibrugarh", "veh_idx": 0, "prio": "High", "stat": "In Transit", "eta": "Today, 17:30", "risk": 22.0},
            {"code": "DLV-NER-002", "cargo": "Rice & Pulses (FCI)", "orig": "Guwahati", "dest": "Silchar", "veh_idx": 1, "prio": "Normal", "stat": "Delayed", "eta": "Today, 21:00", "risk": 48.0},
            {"code": "DLV-NER-003", "cargo": "Cold-Chain Vaccines", "orig": "Dimapur", "dest": "Kohima", "veh_idx": 2, "prio": "Emergency", "stat": "At Risk", "eta": "Today, 15:45", "risk": 68.5},
            {"code": "DLV-NER-004", "cargo": "Baby Food & Formula", "orig": "Silchar", "dest": "Imphal", "veh_idx": 3, "prio": "High", "stat": "In Transit", "eta": "Today, 19:15", "risk": 34.0},
            {"code": "DLV-NER-005", "cargo": "Emergency Relief Kits", "orig": "Tezpur", "dest": "Tawang", "veh_idx": 4, "prio": "Emergency", "stat": "Delayed", "eta": "Tomorrow, 10:00", "risk": 82.0},
            {"code": "DLV-NER-006", "cargo": "Hospital Oxygen Cylinders", "orig": "Guwahati", "dest": "Shillong", "veh_idx": 5, "prio": "Emergency", "stat": "In Transit", "eta": "Today, 14:15", "risk": 18.0},
            {"code": "DLV-NER-007", "cargo": "Petroleum Tanker", "orig": "Silchar", "dest": "Aizawl", "veh_idx": 6, "prio": "High", "stat": "Delayed", "eta": "Today, 22:30", "risk": 55.0},
            {"code": "DLV-NER-008", "cargo": "Agricultural Produce", "orig": "Agartala", "dest": "Udaipur", "veh_idx": 7, "prio": "Normal", "stat": "In Transit", "eta": "Today, 13:45", "risk": 12.0},
            {"code": "DLV-NER-009", "cargo": "Essential Medicines", "orig": "Siliguri", "dest": "Gangtok", "veh_idx": 8, "prio": "High", "stat": "At Risk", "eta": "Today, 18:00", "risk": 62.0},
            {"code": "DLV-NER-010", "cargo": "Construction Materials", "orig": "Jorhat", "dest": "Pasighat", "veh_idx": 9, "prio": "Normal", "stat": "In Transit", "eta": "Today, 20:30", "risk": 28.0},
            {"code": "DLV-NER-011", "cargo": "Disaster Relief Food", "orig": "Itanagar", "dest": "Pasighat", "veh_idx": 10, "prio": "High", "stat": "In Transit", "eta": "Today, 19:00", "risk": 31.0},
            {"code": "DLV-NER-012", "cargo": "Dialysis Medical Supplies", "orig": "Imphal", "dest": "Churachandpur", "veh_idx": 11, "prio": "Emergency", "stat": "In Transit", "eta": "Today, 14:30", "risk": 26.0},
            {"code": "DLV-NER-013", "cargo": "Seeds & Fertilizers", "orig": "Dimapur", "dest": "Mokokchung", "veh_idx": 12, "prio": "Normal", "stat": "In Transit", "eta": "Today, 18:45", "risk": 29.0},
            {"code": "DLV-NER-014", "cargo": "Wheat Flour & Rice", "orig": "Guwahati", "dest": "Tura", "veh_idx": 13, "prio": "Normal", "stat": "In Transit", "eta": "Today, 19:30", "risk": 35.0},
            {"code": "DLV-NER-015", "cargo": "Drinking Water Cans", "orig": "Aizawl", "dest": "Lunglei", "veh_idx": 14, "prio": "High", "stat": "Delayed", "eta": "Today, 21:15", "risk": 58.0},
            {"code": "DLV-NER-016", "cargo": "Emergency Kits", "orig": "Guwahati", "dest": "Agartala", "veh_idx": 15, "prio": "Normal", "stat": "In Transit", "eta": "Tomorrow, 06:00", "risk": 30.0},
            {"code": "DLV-NER-017", "cargo": "Petroleum Tanker", "orig": "Numaligarh", "dest": "Guwahati", "veh_idx": 16, "prio": "Normal", "stat": "In Transit", "eta": "Today, 16:30", "risk": 15.0},
            {"code": "DLV-NER-018", "cargo": "Hospital Linen & Kits", "orig": "Gangtok", "dest": "Namchi", "veh_idx": 17, "prio": "Normal", "stat": "In Transit", "eta": "Today, 14:45", "risk": 20.0},
            {"code": "DLV-NER-019", "cargo": "Bridge Repair Steel", "orig": "Guwahati", "dest": "Itanagar", "veh_idx": 18, "prio": "High", "stat": "In Transit", "eta": "Today, 16:15", "risk": 24.0},
            {"code": "DLV-NER-020", "cargo": "LPG Gas Cylinders", "orig": "Guwahati", "dest": "Dimapur", "veh_idx": 19, "prio": "Normal", "stat": "In Transit", "eta": "Today, 15:50", "risk": 22.0},
            {"code": "DLV-NER-021", "cargo": "Livestock Feed", "orig": "Tezpur", "dest": "Jorhat", "veh_idx": 20, "prio": "Normal", "stat": "In Transit", "eta": "Today, 15:30", "risk": 16.0},
            {"code": "DLV-NER-022", "cargo": "Emergency Blood Units", "orig": "Guwahati", "dest": "Imphal", "veh_idx": 21, "prio": "Emergency", "stat": "In Transit", "eta": "Today, 16:00", "risk": 14.0},
            {"code": "DLV-NER-023", "cargo": "Essential Medicines", "orig": "Shillong", "dest": "Jowai", "veh_idx": 22, "prio": "Normal", "stat": "In Transit", "eta": "Today, 14:20", "risk": 19.0},
            {"code": "DLV-NER-024", "cargo": "Baby Food", "orig": "Silchar", "dest": "Champhai", "veh_idx": 23, "prio": "High", "stat": "Delayed", "eta": "Today, 23:00", "risk": 52.0},
            {"code": "DLV-NER-025", "cargo": "Rice & Food Grains", "orig": "Agartala", "dest": "Dharmanagar", "veh_idx": 24, "prio": "Normal", "stat": "In Transit", "eta": "Today, 17:00", "risk": 25.0},
            {"code": "DLV-NER-026", "cargo": "Road Clearing Tools", "orig": "Mangan", "dest": "Gangtok", "veh_idx": 25, "prio": "Emergency", "stat": "At Risk", "eta": "Today, 17:30", "risk": 70.0},
            {"code": "DLV-NER-027", "cargo": "Milk & Dairy", "orig": "Guwahati", "dest": "Tezpur", "veh_idx": 26, "prio": "Normal", "stat": "In Transit", "eta": "Today, 15:15", "risk": 14.0},
            {"code": "DLV-NER-028", "cargo": "Heavy Earth-Moving Spares", "orig": "Guwahati", "dest": "Silchar", "veh_idx": 31, "prio": "Normal", "stat": "Delivered", "eta": "Delivered", "risk": 10.0},
        ]

        delivery_objs = []
        for d in deliveries_data:
            veh_id = vehicle_objs[d["veh_idx"]].id if d["veh_idx"] < len(vehicle_objs) else None
            deliv = Delivery(
                delivery_code=d["code"],
                commodity=d["cargo"],
                origin=d["orig"],
                destination=d["dest"],
                vehicle_id=veh_id,
                priority=d["prio"],
                status=d["stat"],
                eta=d["eta"],
                risk_score=d["risk"],
                notes=f"Government priority dispatch corridor mission ({d['prio']})."
            )
            delivery_objs.append(deliv)
        db.add_all(delivery_objs)
        db.commit()

        # 7. Live Alerts (24 alerts)
        alerts_data = [
            {"title": "NH-13 Sela Pass Complete Blockage", "desc": "Massive landslide at Km 72; both carriageways blocked. Tawang logistics convoy diverted to alternate transit depot.", "sev": "Critical", "loc": "Tawang / West Kameng border", "type": "route", "id": "NH-13"},
            {"title": "Teesta River High Water Alert — NH-10", "desc": "River scouring near 29th Mile corridor. Heavy goods traffic restricted between Rangpo and Sevoke.", "sev": "Critical", "loc": "Rangpo, East Sikkim", "type": "route", "id": "NH-10"},
            {"title": "Vaccine Express NL-07-A-3319 In Distress Zone", "desc": "Temperature-controlled vaccine truck delayed near Zubza bridge fissure. Immediate corridor escort dispatched.", "sev": "Critical", "loc": "Kohima-Dimapur Corridor", "type": "vehicle", "id": "NL-07-A-3319"},
            {"title": "Brahmaputra Flood Surging at Bogibeel Link", "desc": "Water level 0.8m above highway sub-grade. Trucks advised to park at Moranhat holding yard.", "sev": "Critical", "loc": "Dibrugarh, Assam", "type": "incident", "id": "INC-002"},
            {"title": "NH-6 Sonapur Tunnel Mudflow Warning", "desc": "Continuous heavy rainfall triggering intermittent mud slides. One-way pilot vehicle escorts operational.", "sev": "Warning", "loc": "East Jaintia Hills, Meghalaya", "type": "route", "id": "NH-6"},
            {"title": "Barak Valley Flood Alert Issued", "desc": "Silchar-Badarpur link waterlogged. Essential food supply trucks rerouted through Karimganj loop.", "sev": "Warning", "loc": "Cachar, Assam", "type": "district", "id": "Cachar"},
            {"title": "High Landslide Vulnerability Forecast — Mizoram Spine", "desc": "IMD predicts 140mm rainfall in next 24 hours. NH-306 transport operators advised to limit night movement.", "sev": "Warning", "loc": "Kolasib - Aizawl", "type": "weather", "id": "Mizoram"},
            {"title": "Bailey Bridge Load Restriction (16 Tonnes)", "desc": "Tuirial bridge structural limit enforced by border police. Overloaded vehicles held at Kolasib checkpost.", "sev": "Warning", "loc": "Aizawl Access Corridor", "type": "route", "id": "NH-54"},
            {"title": "Kangpokpi Mountain Pass Single-Lane Restriction", "desc": "Road margin slippage repair underway. Expect 45-60 min transit delay for Imphal-bound goods.", "sev": "Warning", "loc": "NH-2, Manipur", "type": "route", "id": "NH-2"},
            {"title": "Dense Fog Advisory on Shillong Plateau", "desc": "Visibility < 15m along Mawlyngkneng sector. Convoys ordered to maintain 100m separation distance.", "sev": "Warning", "loc": "East Khasi Hills", "type": "weather", "id": "Shillong"},
            {"title": "Emergency Blood Express MN-02-B-9988 Reached Checkpoint", "desc": "Green corridor established across Nagaon and Karbi Anglong sectors; vehicle running on schedule.", "sev": "Information", "loc": "Dimapur Checkpost", "type": "vehicle", "id": "MN-02-B-9988"},
            {"title": "Heavy Earth-Moving Spares Successfully Delivered", "desc": "Delivery mission DLV-NER-028 for PWD Silchar bridge restoration arrived and offloaded.", "sev": "Information", "loc": "Silchar Depot", "type": "delivery", "id": "DLV-NER-028"},
            {"title": "NH-27 Khanapara Tanker Clearance Complete", "desc": "Overturned petroleum tanker recovered by crane. Normal four-lane traffic resumed toward Guwahati.", "sev": "Information", "loc": "Guwahati Gateway", "type": "route", "id": "NH-27"},
            {"title": "Agartala-Udaipur Corridor High Mobility Confirmed", "desc": "Road surface condition rated 94% accessible. Zero active disruptions on NH-8 South sector.", "sev": "Information", "loc": "Tripura Corridor", "type": "district", "id": "West Tripura"},
            {"title": "Trans-Arunachal Road Grader Operation Underway", "desc": "Papum Pare sector shoulder clearance completed. Both lanes reopened for light and medium goods vehicles.", "sev": "Information", "loc": "Itanagar Bypass", "type": "incident", "id": "INC-011"},
            {"title": "Emergency Corridors Health Index: 8 Active Corridors", "desc": "All designated life-line emergency corridors across 8 states verified with 24/7 telemetry monitoring.", "sev": "Information", "loc": "NER Command Centre", "type": "system", "id": "SYS-001"},
            {"title": "Petroleum Tanker Convoy Cleared Through Kolasib", "desc": "14 fuel tankers cleared toward Aizawl depot under state police escort.", "sev": "Information", "loc": "Mizoram Border", "type": "vehicle", "id": "CONVOY-04"},
            {"title": "Hospital Oxygen Express AS-01-HH-9923 On Green Track", "desc": "Traversing Jorabat-Umiam expressway with average speed 54 km/h.", "sev": "Information", "loc": "Meghalaya Inbound", "type": "vehicle", "id": "ML-05-K-6671"},
            {"title": "Tezpur-Jorhat Ferry Alternative Ready as Contingency", "desc": "River vessel standby activated if Kalia Bhomora bridge experiences squall wind closures.", "sev": "Warning", "loc": "Sonitpur / Brahmaputra", "type": "route", "id": "FERRY-01"},
            {"title": "Emergency Medical Supplies Mission DLV-NER-012 Approved", "desc": "Priority dispatch authorized for Churachandpur dialysis patients with police pilot escort.", "sev": "Information", "loc": "Imphal Command", "type": "delivery", "id": "DLV-NER-012"},
            {"title": "Cold-Chain Backup Generator Dispatched to Zubza", "desc": "Mobile auxiliary refrigeration unit routed to assist delayed vaccine consignment.", "sev": "Critical", "loc": "Kohima District", "type": "vehicle", "id": "NL-07-A-3319"},
            {"title": "Sikku-Rangpo Rail-Head Bypass Open for Light Pickups", "desc": "Light utility vehicles allowed to divert through railway alignment link.", "sev": "Warning", "loc": "Sikkim Border", "type": "route", "id": "NH-10"},
            {"title": "Disaster Relief Food Consignment Reached Pasighat Outskirts", "desc": "Truck AR-12-C-8032 reached Pasighat municipal warehouse for immediate distribution.", "sev": "Information", "loc": "East Siang", "type": "delivery", "id": "DLV-NER-011"},
            {"title": "Satellite Weather Radar Predicts Intense Cloudburst", "desc": "Doppler radar at Cherrapunji flags severe convective cell moving east over Jaintia hills.", "sev": "Warning", "loc": "Meghalaya Plateau", "type": "weather", "id": "RADAR-01"},
        ]

        alert_objs = []
        for a in alerts_data:
            alert_objs.append(Alert(
                title=a["title"],
                description=a["desc"],
                severity=a["sev"],
                location=a["loc"],
                related_type=a["type"],
                related_id=a["id"],
                is_read=False,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=random.randint(5, 720))
            ))
        db.add_all(alert_objs)

        # 8. Routes & Emergency Corridors (8 major NER corridors)
        routes_data = [
            {
                "name": "Guwahati - Shillong Life-Line Expressway (NH-106)",
                "orig": "Guwahati", "dest": "Shillong",
                "dist": 98.0, "time": 130, "risk": 16.5, "acc": 92.5, "stat": "Emergency Corridor", "is_emerg": True,
                "way": [[26.1445, 91.7362], [26.0100, 91.8200], [25.8500, 91.8800], [25.6800, 91.9100], [25.5788, 91.8933]]
            },
            {
                "name": "Guwahati - Tezpur - Dibrugarh Northern Trunk (NH-27 / NH-37)",
                "orig": "Guwahati", "dest": "Dibrugarh",
                "dist": 440.0, "time": 540, "risk": 38.0, "acc": 76.5, "stat": "Caution", "is_emerg": False,
                "way": [[26.1445, 91.7362], [26.4500, 92.4000], [26.6338, 92.7926], [26.7509, 94.2037], [27.4728, 94.9120]]
            },
            {
                "name": "Shillong - Silchar Southern Mountain Lifeline (NH-6)",
                "orig": "Shillong", "dest": "Silchar",
                "dist": 215.0, "time": 380, "risk": 48.5, "acc": 68.0, "stat": "High Risk", "is_emerg": False,
                "way": [[25.5788, 91.8933], [25.4533, 92.2033], [25.1800, 92.4200], [24.9500, 92.6500], [24.8333, 92.7789]]
            },
            {
                "name": "Silchar - Imphal Strategic Lifeline Corridor (NH-37 West)",
                "orig": "Silchar", "dest": "Imphal",
                "dist": 255.0, "time": 420, "risk": 35.0, "acc": 80.0, "stat": "Emergency Corridor", "is_emerg": True,
                "way": [[24.8333, 92.7789], [24.8900, 93.1500], [24.8200, 93.5500], [24.8170, 93.9368]]
            },
            {
                "name": "Dimapur - Kohima - Imphal Central Highway (NH-29 / NH-2)",
                "orig": "Dimapur", "dest": "Imphal",
                "dist": 208.0, "time": 360, "risk": 58.0, "acc": 62.0, "stat": "Caution", "is_emerg": False,
                "way": [[25.9042, 93.7275], [25.7500, 93.9500], [25.6751, 94.1086], [25.2500, 94.0200], [24.8170, 93.9368]]
            },
            {
                "name": "Silchar - Aizawl Mizoram Main Supply Artery (NH-306)",
                "orig": "Silchar", "dest": "Aizawl",
                "dist": 178.0, "time": 310, "risk": 46.0, "acc": 71.0, "stat": "Caution", "is_emerg": False,
                "way": [[24.8333, 92.7789], [24.4500, 92.6800], [24.0800, 92.6900], [23.7271, 92.7176]]
            },
            {
                "name": "Guwahati - Itanagar Capital Expressway (NH-415)",
                "orig": "Guwahati", "dest": "Itanagar",
                "dist": 328.0, "time": 390, "risk": 22.0, "acc": 88.0, "stat": "Emergency Corridor", "is_emerg": True,
                "way": [[26.1445, 91.7362], [26.6338, 92.7926], [26.9500, 93.3500], [27.0844, 93.6053]]
            },
            {
                "name": "Tezpur - Bhalukpong - Tawang Strategic Frontier Road (NH-13)",
                "orig": "Tezpur", "dest": "Tawang",
                "dist": 330.0, "time": 560, "risk": 82.0, "acc": 42.0, "stat": "Blocked", "is_emerg": False,
                "way": [[26.6338, 92.7926], [27.0200, 92.6000], [27.3500, 92.2500], [27.5020, 92.1030], [27.5861, 91.8594]]
            },
            {
                "name": "Agartala - Sabroom South Border Corridor (NH-8)",
                "orig": "Agartala", "dest": "Udaipur",
                "dist": 55.0, "time": 75, "risk": 12.0, "acc": 95.0, "stat": "Emergency Corridor", "is_emerg": True,
                "way": [[23.8315, 91.2868], [23.6800, 91.3800], [23.5333, 91.4833]]
            },
            {
                "name": "Siliguri - Sevoke - Gangtok Teesta Valley Spine (NH-10)",
                "orig": "Siliguri", "dest": "Gangtok",
                "dist": 114.0, "time": 240, "risk": 64.0, "acc": 59.0, "stat": "Caution", "is_emerg": False,
                "way": [[26.7271, 88.3953], [26.9200, 88.4800], [27.1800, 88.5100], [27.3389, 88.6065]]
            }
        ]

        route_objs = []
        for r in routes_data:
            route_objs.append(Route(
                name=r["name"],
                origin=r["orig"],
                destination=r["dest"],
                distance_km=r["dist"],
                estimated_time_mins=r["time"],
                risk_score=r["risk"],
                accessibility_score=r["acc"],
                status=r["stat"],
                waypoints_json=json.dumps(r["way"]),
                is_emergency_corridor=r["is_emerg"],
                weather_risk=round(r["risk"] * 0.9, 1),
                incident_risk=round(r["risk"] * 1.1, 1)
            ))
        db.add_all(route_objs)
        db.commit()

        print("Database seeded successfully with 21 districts, 26 incidents, 32 vehicles, 28 deliveries, 24 alerts, 10 routes!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
