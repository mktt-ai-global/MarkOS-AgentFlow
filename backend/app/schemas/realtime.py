from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.agent import AgentRead
from app.schemas.dashboard import DashboardStatsRead
from app.schemas.skill import SkillRead
from app.schemas.task import TaskRead
from app.schemas.team import TeamRead


class WorkspaceSnapshotRead(BaseModel):
    model_config = ConfigDict(extra="forbid")

    emitted_at: datetime
    tasks: list[TaskRead] = Field(default_factory=list)
    agents: list[AgentRead] = Field(default_factory=list)
    teams: list[TeamRead] = Field(default_factory=list)
    skills: list[SkillRead] = Field(default_factory=list)
    dashboard_stats: DashboardStatsRead


class WorkspaceRealtimeMessage(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: str = "workspace.snapshot"
    payload: WorkspaceSnapshotRead
