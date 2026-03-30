from __future__ import annotations

from datetime import datetime
from enum import Enum
from uuid import uuid4

from sqlalchemy import JSON, DateTime, Enum as SqlEnum, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class AgentRole(str, Enum):
    PM = "PM"
    DEV = "DEV"
    QA = "QA"


class AgentStatus(str, Enum):
    ONLINE = "ONLINE"
    IDLE = "IDLE"
    OFFLINE = "OFFLINE"


class Agent(Base):
    __tablename__ = "agents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[AgentRole] = mapped_column(SqlEnum(AgentRole), nullable=False, index=True)
    skills: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    system_prompt: Mapped[str] = mapped_column(Text, nullable=False)
    model: Mapped[str] = mapped_column(String(255), nullable=False)
    max_tokens: Mapped[int] = mapped_column(Integer, nullable=False, default=4096)
    status: Mapped[AgentStatus] = mapped_column(
        SqlEnum(AgentStatus),
        nullable=False,
        default=AgentStatus.IDLE,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
