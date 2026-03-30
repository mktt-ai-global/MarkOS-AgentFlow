from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
import uuid
import json

if TYPE_CHECKING:
    from .project import Project
    from .agent import Agent
    from .artifact import Artifact

class Task(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(index=True)
    description: Optional[str] = None
    status: str = Field(default="pending", index=True) # pending, in_progress, completed, failed
    priority: int = Field(default=0)
    
    project_id: uuid.UUID = Field(foreign_key="project.id")
    project: "Project" = Relationship(back_populates="tasks")
    
    agent_id: Optional[uuid.UUID] = Field(default=None, foreign_key="agent.id")
    agent: Optional["Agent"] = Relationship(back_populates="tasks")
    
    # JSON field for inputs/outputs
    input_data: str = Field(default="{}")
    output_data: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    artifacts: List["Artifact"] = Relationship(back_populates="task")
