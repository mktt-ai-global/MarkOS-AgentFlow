from fastapi import APIRouter, HTTPException, Depends
from typing import List
from uuid import UUID
import uuid
from datetime import datetime

# Assume database access and service communication methods are available
# from ..models.task import Task, TaskCreate, TaskStatus

router = APIRouter()

# Placeholder model for tasks
# We'll use the common models in the final version
# For now, we define simplified versions for demonstration

from ...common.models.task import Task, TaskCreate, TaskStatus

# In-memory store for demonstration
tasks_db = []

@router.post("/", response_model=Task)
async def create_task(task_in: TaskCreate):
    task = Task(
        id=uuid.uuid4(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        **task_in.model_dump()
    )
    tasks_db.append(task)
    return task

@router.get("/", response_model=List[Task])
async def list_tasks():
    return tasks_db

@router.get("/{task_id}", response_model=Task)
async def get_task(task_id: UUID):
    for task in tasks_db:
        if task.id == task_id:
            return task
    raise HTTPException(status_code=404, detail="Task not found")

@router.patch("/{task_id}/status", response_model=Task)
async def update_task_status(task_id: UUID, status: TaskStatus):
    for task in tasks_db:
        if task.id == task_id:
            task.status = status
            task.updated_at = datetime.utcnow()
            return task
    raise HTTPException(status_code=404, detail="Task not found")
