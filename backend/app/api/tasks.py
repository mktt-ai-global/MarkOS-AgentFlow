from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.api.deps import DbSession
from app.schemas.task import TaskCreate, TaskRead
from app.services.execution import (
    TaskExecutionConflictError,
    TaskExecutionNotFoundError,
    TaskExecutionService,
)
from app.services.tasks import MissingDependenciesError, TaskService

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskRead])
def list_tasks(session: DbSession) -> list[TaskRead]:
    service = TaskService(session)
    return [TaskRead.model_validate(task) for task in service.list_tasks()]


@router.get("/{task_id}", response_model=TaskRead)
def get_task(task_id: str, session: DbSession) -> TaskRead:
    service = TaskService(session)
    task = service.get_task(task_id)

    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    return TaskRead.model_validate(task)


@router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate, session: DbSession) -> TaskRead:
    service = TaskService(session)

    try:
        task = service.create_task(payload)
        return TaskRead.model_validate(task)
    except MissingDependenciesError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "message": "Task dependencies must exist before persistence",
                "missing_dependency_ids": exc.dependency_ids,
            },
        ) from exc


@router.post("/{task_id}/run", response_model=TaskRead)
def run_task(task_id: str, session: DbSession) -> TaskRead:
    service = TaskExecutionService(session)

    try:
        task = service.run_task(task_id)
        return TaskRead.model_validate(task)
    except TaskExecutionNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except TaskExecutionConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
