from typing import Any, List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
import uuid

from app.db.session import get_db_session
from app.models.agent import Agent
from app.schemas import AgentCreate, AgentRead, AgentUpdate
from app.core.exceptions import NotFoundException

router = APIRouter()

@router.get("/", response_model=List[AgentRead])
def read_agents(
    db: Session = Depends(get_db_session),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    agents = db.exec(select(Agent).offset(skip).limit(limit)).all()
    return agents

@router.post("/", response_model=AgentRead)
def create_agent(
    *,
    db: Session = Depends(get_db_session),
    agent_in: AgentCreate,
) -> Any:
    agent = Agent.from_orm(agent_in)
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent

@router.put("/{id}", response_model=AgentRead)
def update_agent(
    *,
    db: Session = Depends(get_db_session),
    id: uuid.UUID,
    agent_in: AgentUpdate,
) -> Any:
    agent = db.get(Agent, id)
    if not agent:
        raise NotFoundException(entity="Agent", entity_id=id)
    agent_data = agent_in.dict(exclude_unset=True)
    for key, value in agent_data.items():
        setattr(agent, key, value)
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent

@router.get("/{id}", response_model=AgentRead)
def read_agent(
    *,
    db: Session = Depends(get_db_session),
    id: uuid.UUID,
) -> Any:
    agent = db.get(Agent, id)
    if not agent:
        raise NotFoundException(entity="Agent", entity_id=id)
    return agent

@router.delete("/{id}", response_model=AgentRead)
def delete_agent(
    *,
    db: Session = Depends(get_db_session),
    id: uuid.UUID,
) -> Any:
    agent = db.get(Agent, id)
    if not agent:
        raise NotFoundException(entity="Agent", entity_id=id)
    db.delete(agent)
    db.commit()
    return agent
