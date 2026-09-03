from .auth import router as auth_router
from .dashboard import router as dashboard_router
from .districts import router as districts_router
from .incidents import router as incidents_router
from .vehicles import router as vehicles_router
from .deliveries import router as deliveries_router
from .routes import router as routes_router
from .alerts import router as alerts_router
from .emergency import router as emergency_router
from .weather import router as weather_router
from .analytics import router as analytics_router
from .system import router as system_router

__all__ = [
    "auth_router",
    "dashboard_router",
    "districts_router",
    "incidents_router",
    "vehicles_router",
    "deliveries_router",
    "routes_router",
    "alerts_router",
    "emergency_router",
    "weather_router",
    "analytics_router",
    "system_router",
]
