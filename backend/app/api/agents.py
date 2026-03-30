from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.api.deps import DbSession
from app.schemas.agent import AgentCreate, AgentRead
from app.services.agents import AgentService, MissingAgentSkillsError, MissingAgentTeamsError

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("", response_model=list[AgentRead])
def list_agents(session: DbSession) -> list[AgentRead]:
    service = AgentService(session)
    return service.list_agent_reads()


@router.post("", response_model=AgentRead, status_code=status.HTTP_201_CREATED)
def create_agent(payload: AgentCreate, session: DbSession) -> AgentRead:
    service = AgentService(session)

    try:
        return service.create_agent(payload)
    except MissingAgentSkillsError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
    except MissingAgentTeamsError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
