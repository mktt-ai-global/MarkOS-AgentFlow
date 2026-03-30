from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.agent import AgentRole, AgentStatus


class AgentCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=255)
    role: AgentRole
    skills: list[str] = Field(default_factory=list)
    team_ids: list[str] = Field(default_factory=list)
    system_prompt: str = ""
    model: str | None = None
    max_tokens: int | None = Field(default=None, ge=256, le=16384)
    status: AgentStatus = AgentStatus.IDLE

    @field_validator("name", "system_prompt", "model", mode="before")
    @classmethod
    def strip_strings(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()

        return value

    @field_validator("skills", "team_ids")
    @classmethod
    def normalize_lists(cls, value: list[str]) -> list[str]:
        return list(dict.fromkeys(item.strip() for item in value if item.strip()))


class AgentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    role: AgentRole
    skills: list[str]
    team_ids: list[str] = Field(default_factory=list)
    team_names: list[str] = Field(default_factory=list)
    system_prompt: str
    model: str
    max_tokens: int
    status: AgentStatus
    created_at: datetime
    updated_at: datetime
