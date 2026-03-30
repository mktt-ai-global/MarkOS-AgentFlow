from typing import Optional, TYPE_CHECKING
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
import uuid

if TYPE_CHECKING:
    from .task import Task

class Artifact(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(index=True)
    type: str = Field(index=True)  # 'file', 'link', 'code', 'data'
    content_path: str  # Path in storage or external URL
    
    task_id: uuid.UUID = Field(foreign_key="task.id")
    task: "Task" = Relationship(back_populates="artifacts")
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
