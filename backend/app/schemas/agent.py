from typing import Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class AgentBase(BaseModel):
    name: str
    role: str
    goal: str
    backstory: Optional[str] = None
    project_id: UUID


class AgentCreate(AgentBase):
    pass


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    goal: Optional[str] = None
    backstory: Optional[str] = None


class Agent(AgentBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
