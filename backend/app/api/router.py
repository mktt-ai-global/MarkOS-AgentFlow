from fastapi import APIRouter

from app.api.agents import router as agents_router
from app.api.dashboard import router as dashboard_router
from app.api.health import router as health_router
from app.api.skills import router as skills_router
from app.api.tasks import router as tasks_router
from app.api.teams import router as teams_router
from app.api.ws import router as ws_router

api_router = APIRouter()
api_router.include_router(tasks_router)
api_router.include_router(agents_router)
api_router.include_router(teams_router)
api_router.include_router(skills_router)
api_router.include_router(dashboard_router)
api_router.include_router(health_router)
api_router.include_router(ws_router)
