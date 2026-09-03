import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import engine, Base, BASE_DIR
from .seed import seed_database
from .routes import (
    auth_router,
    dashboard_router,
    districts_router,
    incidents_router,
    vehicles_router,
    deliveries_router,
    routes_router,
    alerts_router,
    emergency_router,
    weather_router,
    analytics_router,
    system_router
)

# Lifespan context manager for database creation and automatic seeding on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create DB tables
    Base.metadata.create_all(bind=engine)
    # Seed realistic North Eastern Region logistics dataset
    seed_database()
    yield

app = FastAPI(
    title="NER Logistics Intelligence API",
    description="AI-Powered Accessibility & Logistics Monitoring Platform for North Eastern Region (NER)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration for smooth local dev and demo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static directory for incident photos
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# Include modular REST routers
app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(districts_router)
app.include_router(incidents_router)
app.include_router(vehicles_router)
app.include_router(deliveries_router)
app.include_router(routes_router)
app.include_router(alerts_router)
app.include_router(emergency_router)
app.include_router(weather_router)
app.include_router(analytics_router)
app.include_router(system_router)

@app.get("/api/health")
def api_health():
    return {
        "success": True,
        "status": "healthy",
        "service": "NER Logistics Intelligence API",
        "region": "North Eastern Region (NER), India",
        "database": "SQLite (Cloud PostgreSQL/PostGIS Ready)",
        "simulation": "active",
        "demo_mode": True
    }

@app.get("/")
def root():
    return {
        "platform": "NER Logistics Intelligence",
        "subtitle": "AI-Powered Accessibility & Logistics Monitoring Platform",
        "region": "North Eastern Region (NER), India",
        "version": "1.0.0-hackathon-mvp",
        "documentation": "/docs",
        "health_check": "/api/health",
        "demo_account": "admin@nerlogistics.gov.in"
    }
