from __future__ import annotations

from collections import Counter
from datetime import date, timedelta
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.agent import Agent, AgentRole, AgentStatus
from app.models.task import Task, TaskStatus
from app.schemas.dashboard import (
    DashboardAgentRate,
    DashboardAgentSummary,
    DashboardRecentOutput,
    DashboardStatsRead,
    DashboardTaskSummary,
)
from app.schemas.task import TaskRead
from app.services.agents import AgentService


class DashboardService:
    def __init__(self, session: Session):
        self.session = session

    def get_stats(self) -> DashboardStatsRead:
        AgentService(self.session).ensure_default_agents()

        tasks = list(self.session.scalars(select(Task).order_by(Task.updated_at.desc(), Task.id.desc())))
        agents = list(self.session.scalars(select(Agent).order_by(Agent.created_at.asc(), Agent.id.asc())))

        return DashboardStatsRead(
            task_summary=self._build_task_summary(tasks),
            agent_summary=self._build_agent_summary(agents),
            tasks_by_agent=self._build_tasks_by_agent(tasks),
            activity_bars=self._build_activity_bars(tasks),
            recent_tasks=[TaskRead.model_validate(task) for task in tasks[:6]],
            recent_outputs=self._build_recent_outputs(tasks),
        )

    def _build_task_summary(self, tasks: list[Task]) -> DashboardTaskSummary:
        counts = Counter(task.status for task in tasks)
        total = len(tasks)
        skipped = counts[TaskStatus.SKIPPED]
        effective_total = max(total - skipped, 1)
        done = counts[TaskStatus.DONE]

        return DashboardTaskSummary(
            total=total,
            pending=counts[TaskStatus.PENDING],
            running=counts[TaskStatus.RUNNING],
            done=done,
            blocked=counts[TaskStatus.BLOCKED],
            failed=counts[TaskStatus.FAILED],
            skipped=skipped,
            active=counts[TaskStatus.PENDING] + counts[TaskStatus.RUNNING] + counts[TaskStatus.BLOCKED],
            success_rate=round((done / effective_total) * 100, 1) if total else 0.0,
            total_tokens=sum(task.token_used for task in tasks),
            total_retries=sum(task.retry_count for task in tasks),
            intervention_count=counts[TaskStatus.BLOCKED] + counts[TaskStatus.FAILED],
        )

    def _build_agent_summary(self, agents: list[Agent]) -> DashboardAgentSummary:
        counts = Counter(agent.status for agent in agents)
        return DashboardAgentSummary(
            total=len(agents),
            online=counts[AgentStatus.ONLINE],
            idle=counts[AgentStatus.IDLE],
            offline=counts[AgentStatus.OFFLINE],
        )

    def _build_tasks_by_agent(self, tasks: list[Task]) -> list[DashboardAgentRate]:
        items: list[DashboardAgentRate] = []

        for role in AgentRole:
            role_tasks = [task for task in tasks if task.assigned_agent.upper() == role.value]
            total = len(role_tasks)
            done = sum(1 for task in role_tasks if task.status == TaskStatus.DONE)
            running = sum(1 for task in role_tasks if task.status == TaskStatus.RUNNING)
            blocked = sum(
                1 for task in role_tasks if task.status in {TaskStatus.BLOCKED, TaskStatus.FAILED}
            )
            success_rate = round((done / total) * 100, 1) if total else 0.0

            items.append(
                DashboardAgentRate(
                    role=role.value,
                    label=f"{role.value} Agent",
                    total=total,
                    done=done,
                    running=running,
                    blocked=blocked,
                    success_rate=success_rate,
                )
            )

        return items

    def _build_activity_bars(self, tasks: list[Task]) -> list[int]:
        today = date.today()
        buckets = {today - timedelta(days=offset): 0 for offset in range(6, -1, -1)}

        for task in tasks:
            task_day = task.created_at.date()
            if task_day in buckets:
                buckets[task_day] += 1

        return [buckets[day] for day in sorted(buckets)]

    def _build_recent_outputs(self, tasks: list[Task]) -> list[DashboardRecentOutput]:
        outputs: list[DashboardRecentOutput] = []

        for task in tasks:
            for output_key, output_value in task.output.items():
                outputs.append(
                    DashboardRecentOutput(
                        task_id=task.id,
                        task_title=task.title,
                        output_key=output_key,
                        summary=self._summarize_output(output_value),
                        updated_at=task.updated_at,
                    )
                )

        outputs.sort(key=lambda item: item.updated_at, reverse=True)
        return outputs[:6]

    def _summarize_output(self, output_value: Any) -> str:
        if isinstance(output_value, dict):
            parts = [f"{key}: {value}" for key, value in list(output_value.items())[:2]]
            return " · ".join(parts) if parts else "结构化输出"

        if isinstance(output_value, list):
            return f"列表输出 · {len(output_value)} 项"

        text = str(output_value).strip()
        if len(text) <= 48:
            return text or "输出已生成"

        return f"{text[:45]}..."
