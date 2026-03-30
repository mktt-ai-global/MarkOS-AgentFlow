from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.task import Task, TaskStatus
from app.schemas.handoff import HandoffPayload


class OrchestratorService:
    """Task orchestration rules for dependency sequencing and handoff lifecycle."""

    def __init__(self) -> None:
        self.settings = get_settings()

    def can_start_task(self, dependency_statuses: list[TaskStatus]) -> bool:
        return all(status == TaskStatus.DONE for status in dependency_statuses)

    def should_autorun_task(self, task: Task) -> bool:
        return task.assigned_agent.strip().upper() in {"AUTO", "PM", "DEV", "QA"}

    def validate_handoff(self, payload: HandoffPayload) -> HandoffPayload:
        normalized = {
            "summary": self._truncate_text(payload.summary, 720),
            "outputs": [
                {
                    "kind": output.kind,
                    "path": self._truncate_text(output.path, 240),
                    "description": self._truncate_text(output.description, 180),
                    "is_required": output.is_required,
                }
                for output in payload.outputs[:6]
            ],
            "decisions": [
                {
                    "decision": self._truncate_text(decision.decision, 140),
                    "rationale": self._truncate_text(decision.rationale, 240),
                    "impact": self._truncate_text(decision.impact, 180)
                    if decision.impact
                    else None,
                }
                for decision in payload.decisions[:5]
            ],
            "open_issues": [
                {
                    "issue": self._truncate_text(issue.issue, 220),
                    "severity": issue.severity,
                    "owner_hint": self._truncate_text(issue.owner_hint, 120)
                    if issue.owner_hint
                    else None,
                }
                for issue in payload.open_issues[:5]
            ],
            "next_hints": [self._truncate_text(hint, 160) for hint in payload.next_hints[:6]],
        }

        normalized = self._shrink_to_token_budget(normalized)
        return HandoffPayload.model_validate(normalized)

    def estimate_handoff_tokens(self, payload: HandoffPayload | dict[str, Any]) -> int:
        if isinstance(payload, HandoffPayload):
            data = payload.model_dump(mode="json")
        else:
            data = payload

        return max(1, round(len(json.dumps(data, ensure_ascii=False)) / 4))

    def merge_upstream_handoff(
        self,
        existing_context: dict[str, Any],
        *,
        source_task: Task,
        handoff: HandoffPayload,
    ) -> dict[str, Any]:
        upstream_handoffs = existing_context.get("upstream_handoffs", [])
        if not isinstance(upstream_handoffs, list):
            upstream_handoffs = []

        transitive_entries = source_task.handoff_context.get("upstream_handoffs", [])
        if not isinstance(transitive_entries, list):
            transitive_entries = []

        merged = [
            item
            for item in upstream_handoffs
            if isinstance(item, dict) and item.get("source_task_id")
        ]
        merged.extend(
            item
            for item in transitive_entries
            if isinstance(item, dict) and item.get("source_task_id")
        )
        merged.append(
            {
                "source_task_id": source_task.id,
                "source_title": source_task.title,
                "received_at": datetime.now(timezone.utc).isoformat(),
                "handoff": self.validate_handoff(handoff).model_dump(mode="json"),
            }
        )

        deduped: list[dict[str, Any]] = []
        seen_ids: set[str] = set()
        for item in reversed(merged):
            source_task_id = str(item.get("source_task_id", ""))
            if not source_task_id or source_task_id in seen_ids:
                continue

            seen_ids.add(source_task_id)
            deduped.append(item)

        return {
            **existing_context,
            "upstream_handoffs": list(reversed(deduped))[-8:],
        }

    def list_direct_downstream_tasks(self, session: Session, source_task_id: str) -> list[Task]:
        statement = select(Task).order_by(Task.created_at.asc(), Task.id.asc())
        return [
            task
            for task in session.scalars(statement)
            if source_task_id in task.depends_on
        ]

    def list_ready_downstream_tasks(self, session: Session, source_task_id: str) -> list[Task]:
        tasks = self.list_direct_downstream_tasks(session, source_task_id)

        return [
            task
            for task in tasks
            if task.status == TaskStatus.PENDING
            and self.can_start_task(
                [
                    dependency.status
                    for dependency in self._load_dependency_tasks(session, task.depends_on)
                ]
            )
        ]

    def _load_dependency_tasks(self, session: Session, dependency_ids: list[str]) -> list[Task]:
        if not dependency_ids:
            return []

        statement = select(Task).where(Task.id.in_(dependency_ids))
        dependency_map = {task.id: task for task in session.scalars(statement)}
        return [dependency_map[dependency_id] for dependency_id in dependency_ids if dependency_id in dependency_map]

    def _truncate_text(self, value: str | None, limit: int) -> str:
        if not value:
            return ""

        text = value.strip()
        if len(text) <= limit:
            return text

        return f"{text[: max(limit - 3, 0)]}..."

    def _shrink_to_token_budget(self, data: dict[str, Any]) -> dict[str, Any]:
        while self.estimate_handoff_tokens(data) > self.settings.handoff_max_tokens:
            if len(data["next_hints"]) > 1:
                data["next_hints"] = data["next_hints"][:-1]
                continue

            if len(data["outputs"]) > 1:
                data["outputs"] = data["outputs"][:-1]
                continue

            if len(data["decisions"]) > 1:
                data["decisions"] = data["decisions"][:-1]
                continue

            if len(data["open_issues"]) > 1:
                data["open_issues"] = data["open_issues"][:-1]
                continue

            data["summary"] = self._truncate_text(data["summary"], max(len(data["summary"]) // 2, 80))

            if data["outputs"]:
                data["outputs"][0]["description"] = self._truncate_text(
                    data["outputs"][0]["description"],
                    96,
                )

            if data["decisions"]:
                data["decisions"][0]["rationale"] = self._truncate_text(
                    data["decisions"][0]["rationale"],
                    120,
                )

            if self.estimate_handoff_tokens(data) <= self.settings.handoff_max_tokens:
                break

            break

        return data
