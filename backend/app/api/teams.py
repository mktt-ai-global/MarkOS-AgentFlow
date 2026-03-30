from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.api.deps import DbSession
from app.schemas.team import TeamCreate, TeamRead
from app.services.teams import MissingTeamAgentsError, TeamService

router = APIRouter(prefix="/teams", tags=["teams"])


@router.get("", response_model=list[TeamRead])
def list_teams(session: DbSession) -> list[TeamRead]:
    return TeamService(session).list_team_reads()


@router.post("", response_model=TeamRead, status_code=status.HTTP_201_CREATED)
def create_team(payload: TeamCreate, session: DbSession) -> TeamRead:
    service = TeamService(session)

    try:
        return service.create_team(payload)
    except MissingTeamAgentsError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
