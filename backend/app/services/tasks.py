from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.task import Task
from app.schemas.task import TaskCreate


@dataclass(slots=True)
class MissingDependenciesError(Exception):
    dependency_ids: list[str]

    def __str__(self) -> str:
        return f"Missing task dependencies: {', '.join(self.dependency_ids)}"


class TaskService:
    def __init__(self, session: Session):
        self.session = session

    def list_tasks(self) -> list[Task]:
        statement = select(Task).order_by(Task.created_at.desc(), Task.id.desc())
        return list(self.session.scalars(statement))

    def get_task(self, task_id: str) -> Task | None:
        return self.session.get(Task, task_id)

    def create_task(self, payload: TaskCreate) -> Task:
        dependency_ids = list(dict.fromkeys(payload.depends_on))
        self._validate_dependencies(dependency_ids)

        task = Task(
            title=payload.title.strip(),
            description=payload.description.strip(),
            assigned_agent=payload.assigned_agent.strip(),
            depends_on=dependency_ids,
            handoff_context=payload.handoff_context,
            output=payload.output,
        )
        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)
        return task

    def _validate_dependencies(self, dependency_ids: list[str]) -> None:
        if not dependency_ids:
            return

        statement = select(Task.id).where(Task.id.in_(dependency_ids))
        existing_ids = set(self.session.scalars(statement))
        missing_ids = [
            dependency_id for dependency_id in dependency_ids if dependency_id not in existing_ids
        ]

        if missing_ids:
            raise MissingDependenciesError(missing_ids)
