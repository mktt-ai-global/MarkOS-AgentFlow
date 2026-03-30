from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.agent import Agent
from app.models.team import AgentTeam, AgentTeamMembership
from app.schemas.team import TeamCreate, TeamRead


@dataclass(slots=True)
class MissingTeamAgentsError(Exception):
    agent_ids: list[str]

    def __str__(self) -> str:
        return f"Missing agents for team membership: {', '.join(self.agent_ids)}"


DEFAULT_TEAM = {
    "id": "team-core-delivery",
    "name": "Core Delivery Team",
    "focus": "主链路交付",
    "description": "负责默认的 PM -> Dev -> QA 交付主链。",
    "color": "blue",
    "agent_ids": ["agent-pm", "agent-dev", "agent-qa"],
}


class TeamService:
    def __init__(self, session: Session):
        self.session = session

    def list_team_reads(self) -> list[TeamRead]:
        self.ensure_default_teams()
        return self._build_team_reads()

    def create_team(self, payload: TeamCreate) -> TeamRead:
        agent_ids = list(dict.fromkeys(payload.agent_ids))
        self._validate_agents_exist(agent_ids)

        team = AgentTeam(
            name=payload.name,
            focus=payload.focus,
            description=payload.description,
            color=payload.color or "blue",
        )
        self.session.add(team)
        self.session.commit()
        self.session.refresh(team)

        if agent_ids:
            self.session.add_all(
                AgentTeamMembership(agent_id=agent_id, team_id=team.id)
                for agent_id in agent_ids
            )
            self.session.commit()

        return self._build_team_read(team.id)

    def ensure_default_teams(self) -> None:
        has_teams = self.session.scalar(select(AgentTeam.id).limit(1))
        if has_teams is not None:
            return

        from app.services.agents import AgentService

        AgentService(self.session).ensure_default_agents()

        team = AgentTeam(
            id=str(DEFAULT_TEAM["id"]),
            name=str(DEFAULT_TEAM["name"]),
            focus=str(DEFAULT_TEAM["focus"]),
            description=str(DEFAULT_TEAM["description"]),
            color=str(DEFAULT_TEAM["color"]),
        )
        self.session.add(team)
        self.session.commit()

        self._validate_agents_exist(list(DEFAULT_TEAM["agent_ids"]))
        self.session.add_all(
            AgentTeamMembership(agent_id=agent_id, team_id=team.id)
            for agent_id in DEFAULT_TEAM["agent_ids"]
        )
        self.session.commit()

    def _build_team_reads(self) -> list[TeamRead]:
        statement = select(AgentTeam).order_by(AgentTeam.created_at.asc(), AgentTeam.id.asc())
        teams = list(self.session.scalars(statement))
        memberships = list(self.session.scalars(select(AgentTeamMembership)))
        agents = {
            agent.id: agent
            for agent in self.session.scalars(select(Agent).order_by(Agent.created_at.asc()))
        }

        membership_map: dict[str, list[str]] = {}
        for membership in memberships:
            membership_map.setdefault(membership.team_id, []).append(membership.agent_id)

        return [
            TeamRead(
                id=team.id,
                name=team.name,
                focus=team.focus,
                description=team.description,
                color=team.color,
                agent_ids=membership_map.get(team.id, []),
                agent_names=[
                    agents[agent_id].name
                    for agent_id in membership_map.get(team.id, [])
                    if agent_id in agents
                ],
                member_count=len(membership_map.get(team.id, [])),
                created_at=team.created_at,
                updated_at=team.updated_at,
            )
            for team in teams
        ]

    def _build_team_read(self, team_id: str) -> TeamRead:
        for team in self._build_team_reads():
            if team.id == team_id:
                return team

        raise RuntimeError(f"Team not found after creation: {team_id}")

    def _validate_agents_exist(self, agent_ids: list[str]) -> None:
        if not agent_ids:
            return

        statement = select(Agent.id).where(Agent.id.in_(agent_ids))
        existing_ids = set(self.session.scalars(statement))
        missing_ids = [agent_id for agent_id in agent_ids if agent_id not in existing_ids]
        if missing_ids:
            raise MissingTeamAgentsError(missing_ids)
