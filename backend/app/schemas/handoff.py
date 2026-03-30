from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class HandoffOutput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    kind: Literal["doc", "code", "test", "report", "artifact", "log"]
    path: str
    description: str
    is_required: bool = True


class HandoffDecision(BaseModel):
    model_config = ConfigDict(extra="forbid")

    decision: str
    rationale: str
    impact: str | None = None


class HandoffIssue(BaseModel):
    model_config = ConfigDict(extra="forbid")

    issue: str
    severity: Literal["low", "medium", "high", "critical"]
    owner_hint: str | None = None


class HandoffPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    summary: str
    outputs: list[HandoffOutput] = Field(default_factory=list)
    decisions: list[HandoffDecision] = Field(default_factory=list)
    open_issues: list[HandoffIssue] = Field(default_factory=list)
    next_hints: list[str] = Field(default_factory=list)
