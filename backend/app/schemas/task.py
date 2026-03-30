from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field
from pydantic import field_validator

from app.models.task import TaskStatus


class TaskCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=1, max_length=255)
    description: str = ""
    assigned_agent: str = Field(default="AUTO", min_length=1, max_length=16)
    depends_on: list[str] = Field(default_factory=list)
    handoff_context: dict[str, Any] = Field(default_factory=dict)
    output: dict[str, Any] = Field(default_factory=dict)

    @field_validator("title", "assigned_agent", mode="before")
    @classmethod
    def strip_required_strings(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()

        return value

    @field_validator("depends_on")
    @classmethod
    def normalize_dependency_ids(cls, value: list[str]) -> list[str]:
        return [dependency_id.strip() for dependency_id in value if dependency_id.strip()]


class TaskRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: str
    assigned_agent: str
    status: TaskStatus
    depends_on: list[str]
    handoff_context: dict[str, Any]
    output: dict[str, Any]
    token_used: int
    retry_count: int
    created_at: datetime
    updated_at: datetime
