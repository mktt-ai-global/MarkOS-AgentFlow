from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
import uuid

from app.db.session import get_db_session
from app.models.task import Task
from app.schemas import TaskCreate, TaskRead, TaskUpdate

router = APIRouter()

@router.get("/", response_model=List[TaskRead])
def read_tasks(
    db: Session = Depends(get_db_session),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    tasks = db.exec(select(Task).offset(skip).limit(limit)).all()
    return tasks

@router.post("/", response_model=TaskRead)
def create_task(
    *,
    db: Session = Depends(get_db_session),
    task_in: TaskCreate,
) -> Any:
    task = Task.from_orm(task_in)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.put("/{id}", response_model=TaskRead)
def update_task(
    *,
    db: Session = Depends(get_db_session),
    id: uuid.UUID,
    task_in: TaskUpdate,
) -> Any:
    task = db.get(Task, id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task_data = task_in.dict(exclude_unset=True)
    for key, value in task_data.items():
        setattr(task, key, value)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.get("/{id}", response_model=TaskRead)
def read_task(
    *,
    db: Session = Depends(get_db_session),
    id: uuid.UUID,
) -> Any:
    task = db.get(Task, id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.delete("/{id}", response_model=TaskRead)
def delete_task(
    *,
    db: Session = Depends(get_db_session),
    id: uuid.UUID,
) -> Any:
    task = db.get(Task, id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return task
