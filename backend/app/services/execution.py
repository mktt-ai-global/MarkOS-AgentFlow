from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from collections.abc import Iterable

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.agent import AgentRole
from app.models.task import Task, TaskStatus
from app.schemas.handoff import HandoffPayload
from app.services.agent_runner import AgentRunnerService
from app.services.agents import AgentService
from app.services.orchestrator import OrchestratorService


@dataclass(slots=True)
class TaskExecutionConflictError(Exception):
    message: str

    def __str__(self) -> str:
        return self.message


@dataclass(slots=True)
class TaskExecutionNotFoundError(Exception):
    task_id: str

    def __str__(self) -> str:
        return f"Task not found: {self.task_id}"


class TaskExecutionService:
    def __init__(self, session: Session):
        self.session = session
        self.settings = get_settings()
        self.agent_service = AgentService(session)
        self.orchestrator = OrchestratorService()
        self.runner = AgentRunnerService()

    def run_task(self, task_id: str) -> Task:
        root_task = self._get_task_or_raise(task_id)
        queue: list[str] = [root_task.id]
        visited: set[str] = set()
        root_result: Task | None = None

        while queue:
            current_task_id = queue.pop(0)
            if current_task_id in visited:
                continue

            current_task = self._get_task_or_raise(current_task_id)
            executed_task = self._execute_single_task(current_task)
            visited.add(executed_task.id)

            if root_result is None and executed_task.id == root_task.id:
                root_result = executed_task

            queue.extend(self._advance_downstream(executed_task, visited, queue))

        return root_result or self._get_task_or_raise(task_id)

    def _execute_single_task(self, task: Task) -> Task:
        self._assert_task_can_run(task)
        dependencies = self._load_dependency_tasks(task.depends_on)
        agent_role = self._resolve_agent_role(task.assigned_agent)

        try:
            agent = self.agent_service.resolve_execution_agent(agent_role)
        except RuntimeError as exc:
            raise TaskExecutionConflictError(str(exc)) from exc

        while True:
            self.agent_service.set_active_agent(agent.id)
            task.status = TaskStatus.RUNNING
            task.assigned_agent = agent_role.value
            self.session.commit()
            self.session.refresh(task)

            try:
                result = self.runner.run_task(task=task, agent=agent, dependencies=dependencies)
            except Exception as exc:
                self.agent_service.set_agent_idle(agent.id)
                self._handle_retryable_failure(task, exc)
                if task.status == TaskStatus.PENDING:
                    continue
                raise TaskExecutionConflictError(str(exc)) from exc

            task.status = TaskStatus.DONE
            validated_handoff = self.orchestrator.validate_handoff(result.handoff).model_dump(
                mode="json"
            )
            task.handoff_context = {
                **validated_handoff,
                "upstream_handoffs": task.handoff_context.get("upstream_handoffs", []),
            }
            task.output = {**task.output, **result.output}
            task.token_used += result.total_tokens
            self.session.commit()
            self.session.refresh(task)
            self.agent_service.set_agent_idle(agent.id)
            return task

    def _advance_downstream(
        self,
        source_task: Task,
        visited: set[str],
        queued_ids: Iterable[str],
    ) -> list[str]:
        direct_downstream = self.orchestrator.list_direct_downstream_tasks(self.session, source_task.id)
        if not direct_downstream:
            return []

        handoff = self.orchestrator.validate_handoff(
            self._coerce_handoff_payload(source_task.handoff_context)
        )

        for downstream_task in direct_downstream:
            downstream_task.handoff_context = self.orchestrator.merge_upstream_handoff(
                downstream_task.handoff_context,
                source_task=source_task,
                handoff=handoff,
            )

        self.session.commit()

        next_task_ids: list[str] = []
        queued = set(queued_ids)
        ready_tasks = self.orchestrator.list_ready_downstream_tasks(self.session, source_task.id)
        for downstream_task in ready_tasks:
            if downstream_task.id in visited or downstream_task.id in queued:
                continue

            if self.orchestrator.should_autorun_task(downstream_task):
                next_task_ids.append(downstream_task.id)
                continue

            self._mark_task_blocked(
                downstream_task,
                "下游任务已满足依赖，但当前任务角色不在 Phase 6 的自动执行范围内。",
            )

        if next_task_ids:
            self.session.commit()

        return next_task_ids

    def _assert_task_can_run(self, task: Task) -> None:
        if task.status == TaskStatus.RUNNING:
            raise TaskExecutionConflictError("Task is already running")

        if task.status == TaskStatus.DONE:
            raise TaskExecutionConflictError("Task already completed successfully")

        dependencies = self._load_dependency_tasks(task.depends_on)
        dependency_statuses = [dependency.status for dependency in dependencies]
        if not self.orchestrator.can_start_task(dependency_statuses):
            waiting_ids = [
                dependency.id
                for dependency in dependencies
                if dependency.status != TaskStatus.DONE
            ]
            raise TaskExecutionConflictError(
                f"Task dependencies are not completed: {', '.join(waiting_ids)}"
            )

    def _handle_retryable_failure(self, task: Task, exc: Exception) -> None:
        task.retry_count += 1
        retry_message = {
            "message": str(exc),
            "occurred_at": datetime.now(timezone.utc).isoformat(),
            "retry_count": task.retry_count,
        }

        if task.retry_count <= self.settings.task_max_retries:
            task.status = TaskStatus.PENDING
            task.output = {
                **task.output,
                "last_error": retry_message,
                "last_retry_state": "scheduled",
            }
            self.session.commit()
            self.session.refresh(task)
            return

        self._mark_task_blocked(task, str(exc), extra={"last_error": retry_message})

    def _load_dependency_tasks(self, dependency_ids: list[str]) -> list[Task]:
        if not dependency_ids:
            return []

        statement = select(Task).where(Task.id.in_(dependency_ids))
        dependency_map = {task.id: task for task in self.session.scalars(statement)}
        return [dependency_map[dependency_id] for dependency_id in dependency_ids if dependency_id in dependency_map]

    def _resolve_agent_role(self, assigned_agent: str) -> AgentRole:
        normalized = assigned_agent.strip().upper() or "AUTO"
        if normalized == "AUTO":
            return AgentRole.PM

        try:
            return AgentRole(normalized)
        except ValueError as exc:
            raise TaskExecutionConflictError(f"Unsupported agent role: {assigned_agent}") from exc

    def _mark_task_blocked(
        self,
        task: Task,
        reason: str,
        *,
        extra: dict[str, object] | None = None,
    ) -> None:
        task.status = TaskStatus.BLOCKED
        task.output = {
            **task.output,
            "orchestrator_block": {
                "message": reason,
                "occurred_at": datetime.now(timezone.utc).isoformat(),
            },
            **(extra or {}),
        }
        self.session.commit()
        self.session.refresh(task)

    def _coerce_handoff_payload(self, payload: dict[str, object]) -> HandoffPayload:
        return HandoffPayload.model_validate(
            {
                "summary": payload.get("summary", ""),
                "outputs": payload.get("outputs", []),
                "decisions": payload.get("decisions", []),
                "open_issues": payload.get("open_issues", []),
                "next_hints": payload.get("next_hints", []),
            }
        )

    def _get_task_or_raise(self, task_id: str) -> Task:
        task = self.session.get(Task, task_id)
        if task is None:
            raise TaskExecutionNotFoundError(task_id)

        return task
