from typing import Optional, List
from datetime import datetime
import uuid
from pydantic import BaseModel

# Project
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(ProjectBase):
    name: Optional[str] = None

class ProjectRead(ProjectBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Agent
class AgentBase(BaseModel):
    name: str
    type: str
    system_prompt: str
    status: str = "idle"

class AgentCreate(AgentBase):
    pass

class AgentUpdate(AgentBase):
    name: Optional[str] = None
    type: Optional[str] = None
    system_prompt: Optional[str] = None
    status: Optional[str] = None

class AgentRead(AgentBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Task
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "pending"
    priority: int = 0
    project_id: uuid.UUID
    agent_id: Optional[uuid.UUID] = None
    input_data: str = "{}"
    output_data: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(TaskBase):
    title: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[int] = None
    output_data: Optional[str] = None

class TaskRead(TaskBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Artifact
class ArtifactBase(BaseModel):
    name: str
    type: str
    content_path: str
    task_id: uuid.UUID

class ArtifactCreate(ArtifactBase):
    pass

class ArtifactUpdate(ArtifactBase):
    name: Optional[str] = None
    type: Optional[str] = None
    content_path: Optional[str] = None

class ArtifactRead(ArtifactBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
