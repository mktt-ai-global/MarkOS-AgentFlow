from __future__ import annotations

from fastapi import APIRouter

from app.api.deps import DbSession
from app.schemas.dashboard import DashboardStatsRead
from app.services.dashboard import DashboardService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStatsRead)
def get_dashboard_stats(session: DbSession) -> DashboardStatsRead:
    service = DashboardService(session)
    return service.get_stats()
