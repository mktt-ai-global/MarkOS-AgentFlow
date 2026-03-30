from typing import Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class TaskBase(BaseModel):
    description: str
    project_id: UUID
    agent_id: Optional[UUID] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    description: Optional[str] = None
    status: Optional[str] = None
    result: Optional[str] = None
    agent_id: Optional[UUID] = None


class Task(TaskBase):
    id: UUID
    status: str
    result: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
