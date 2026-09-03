from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_all():
    print("Testing Root API...")
    res = client.get("/")
    assert res.status_code == 200, res.text
    print(" Root API:", res.json()["platform"])

    print("Testing Login...")
    res = client.post("/api/auth/login", json={"email": "admin@nerlogistics.gov.in", "password": "admin123"})
    assert res.status_code == 200, res.text
    token = res.json()["access_token"]
    print(" Login successful, token generated.")

    print("Testing Dashboard API...")
    res = client.get("/api/dashboard?region=Entire NER")
    assert res.status_code == 200, res.text
    dash = res.json()
    print(f" Dashboard KPIs: Accessibility={dash['kpis']['network_accessibility_pct']}%, ActiveVehicles={dash['kpis']['active_vehicles']}")

    print("Testing Route AI Recommendation Engine...")
    res = client.post("/api/routes/analyze", json={
        "origin": "Guwahati",
        "destination": "Tawang",
        "commodity": "Medicine",
        "vehicle_type": "Truck",
        "priority": "Emergency"
    })
    assert res.status_code == 200, res.text
    routing = res.json()
    print(" Recommended Route:", routing["recommended_route"]["name"])
    print(" Risk Level:", routing["recommended_route"]["risk_level"], "Score:", routing["recommended_route"]["risk_score"])
    print(" Explainability factors:", len(routing["recommended_route"]["explainability"]["explanation"]))

    print("Testing Vehicles & Simulation Step...")
    res = client.post("/api/vehicles/simulate-step")
    assert res.status_code == 200, res.text
    print(f" Simulated step updated {res.json()['updated_vehicles_count']} vehicles.")

    print("Testing Incidents...")
    res = client.get("/api/incidents")
    assert res.status_code == 200, res.text
    print(f" Retrieved {len(res.json())} active incidents.")

    print("Testing Emergency Mode Overview...")
    res = client.get("/api/emergency/overview")
    assert res.status_code == 200, res.text
    print(f" Emergency corridors: {len(res.json()['safe_emergency_corridors'])}")

    print("Testing /api/health Endpoint...")
    res = client.get("/api/health")
    assert res.status_code == 200, res.text
    assert res.json()["success"] is True
    print(" /api/health verified: Healthy and operational.")

    print("Testing 5 RBAC Demo Logins...")
    roles = [
        ("admin@nerlogistics.gov.in", "super_admin"),
        ("state@nerlogistics.gov.in", "state_admin"),
        ("field@nerlogistics.gov.in", "field_officer"),
        ("logistics@nerlogistics.gov.in", "logistics_operator"),
        ("driver@nerlogistics.gov.in", "driver"),
    ]
    for email, expected_role in roles:
        res = client.post("/api/auth/login", json={"email": email, "password": "admin123"})
        assert res.status_code == 200, f"Login failed for {email}: {res.text}"
        user = res.json()["user"]
        assert user["role"] == expected_role, f"Expected role {expected_role}, got {user['role']}"
        print(f"  Verified {user['name']} ({expected_role})")

    print("Testing Vehicle GPS Telemetry Update...")
    res = client.post("/api/vehicles/1/gps", json={
        "latitude": 26.1550,
        "longitude": 91.7500,
        "speed": 52.5,
        "status": "Moving"
    })
    assert res.status_code == 200, res.text
    print(f" GPS update verified for vehicle 1: ({res.json()['latitude']}, {res.json()['longitude']})")

    print("\nALL BACKEND & RBAC TESTS PASSED CLEANLY!")

if __name__ == "__main__":
    test_all()
