from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
import uuid

class ArtifactType(str, Enum):
    CODE = "CODE"
    DOC = "DOC"
    TEST = "TEST"
    REPORT = "REPORT"

class Artifact(BaseModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    type: str  # CODE, DOC, TEST, etc.
    path: str
    metadata: Dict[str, Any] = Field(default_factory=dict)

class Decision(BaseModel):
    text: str
    rationale: str

class HandoffMetadata(BaseModel):
    version: str = "2.0"
    task_id: uuid.UUID
    agent_id: uuid.UUID
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class HandoffPayload(BaseModel):
    summary: str
    artifacts: List[Artifact] = Field(default_factory=list)
    decisions: List[Decision] = Field(default_factory=list)
    remaining_debt: List[str] = Field(default_factory=list)
    next_steps_hint: Optional[str] = None

class Handoff(BaseModel):
    version: str = "2.0"
    metadata: HandoffMetadata
    payload: HandoffPayload

    model_config = ConfigDict(from_attributes=True)
