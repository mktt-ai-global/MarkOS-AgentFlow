from typing import Any, Dict
from fastapi import APIRouter, Depends
from app.config import settings

router = APIRouter()

@router.get("/")
def get_system_config() -> Any:
    """Get public system configuration for the UI settings panel."""
    return {
        "project_name": settings.PROJECT_NAME,
        "app_env": settings.APP_ENV,
        "api_v1_prefix": settings.API_V1_STR,
        "cors_origins": settings.CORS_ORIGINS,
        "features": {
            "orchestrator_enabled": True,
            "realtime_updates": True,
            "visual_config": True
        },
        "version": "0.2.2"
    }

@router.patch("/")
def update_system_config(config_in: Dict[str, Any]) -> Any:
    """Update system configuration (Mock implementation for UI demo)."""
    # In a real enterprise app, this would write to a DB or safe config file
    return {"status": "success", "message": "Settings updated (simulated)", "data": config_in}
