from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.task import TaskRead


class DashboardTaskSummary(BaseModel):
    model_config = ConfigDict(extra="forbid")

    total: int
    pending: int
    running: int
    done: int
    blocked: int
    failed: int
    skipped: int
    active: int
    success_rate: float
    total_tokens: int
    total_retries: int
    intervention_count: int


class DashboardAgentSummary(BaseModel):
    model_config = ConfigDict(extra="forbid")

    total: int
    online: int
    idle: int
    offline: int


class DashboardAgentRate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    role: str
    label: str
    total: int
    done: int
    running: int
    blocked: int
    success_rate: float


class DashboardRecentOutput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    task_id: str
    task_title: str
    output_key: str
    summary: str
    updated_at: datetime


class DashboardStatsRead(BaseModel):
    model_config = ConfigDict(extra="forbid")

    task_summary: DashboardTaskSummary
    agent_summary: DashboardAgentSummary
    tasks_by_agent: list[DashboardAgentRate] = Field(default_factory=list)
    activity_bars: list[int] = Field(default_factory=list)
    recent_tasks: list[TaskRead] = Field(default_factory=list)
    recent_outputs: list[DashboardRecentOutput] = Field(default_factory=list)
