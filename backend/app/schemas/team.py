from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class TeamCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=255)
    focus: str = Field(default="", max_length=255)
    description: str = ""
    color: str = Field(default="blue", min_length=1, max_length=32)
    agent_ids: list[str] = Field(default_factory=list)

    @field_validator("name", "focus", "description", "color", mode="before")
    @classmethod
    def strip_strings(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()

        return value

    @field_validator("agent_ids")
    @classmethod
    def normalize_agent_ids(cls, value: list[str]) -> list[str]:
        return list(dict.fromkeys(item.strip() for item in value if item.strip()))


class TeamRead(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    name: str
    focus: str
    description: str
    color: str
    agent_ids: list[str] = Field(default_factory=list)
    agent_names: list[str] = Field(default_factory=list)
    member_count: int = 0
    created_at: datetime
    updated_at: datetime
