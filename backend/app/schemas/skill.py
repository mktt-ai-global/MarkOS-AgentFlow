from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class SkillCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=255)
    category: str = Field(default="general", min_length=1, max_length=64)
    description: str = ""
    prompt_hint: str = ""
    is_core: bool = False

    @field_validator("name", "category", "description", "prompt_hint", mode="before")
    @classmethod
    def strip_strings(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()

        return value


class SkillRead(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    name: str
    slug: str
    category: str
    description: str
    prompt_hint: str
    is_core: bool
    usage_count: int = 0
    created_at: datetime
    updated_at: datetime
