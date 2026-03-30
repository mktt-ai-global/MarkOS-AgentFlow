from __future__ import annotations

from pathlib import Path
from typing import TypedDict

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.agent import Agent, AgentRole, AgentStatus
from app.models.skill import SkillLibraryItem
from app.models.team import AgentTeam, AgentTeamMembership
from app.schemas.agent import AgentCreate, AgentRead

PROMPT_DIR = Path(__file__).resolve().parent.parent / "prompts"


class DefaultAgentDefinition(TypedDict):
    id: str
    name: str
    role: AgentRole
    skills: list[str]
    prompt_file: str
    status: AgentStatus


DEFAULT_AGENTS: tuple[DefaultAgentDefinition, ...] = (
    {
        "id": "agent-pm",
        "name": "PM Agent",
        "role": AgentRole.PM,
        "skills": ["requirements", "planning", "acceptance-criteria"],
        "prompt_file": "pm_agent.md",
        "status": AgentStatus.ONLINE,
    },
    {
        "id": "agent-dev",
        "name": "Dev Agent",
        "role": AgentRole.DEV,
        "skills": ["implementation", "unit-test", "artifact-output"],
        "prompt_file": "dev_agent.md",
        "status": AgentStatus.IDLE,
    },
    {
        "id": "agent-qa",
        "name": "QA Agent",
        "role": AgentRole.QA,
        "skills": ["integration-test", "bug-report", "risk-review"],
        "prompt_file": "qa_agent.md",
        "status": AgentStatus.IDLE,
    },
)


class MissingAgentSkillsError(Exception):
    def __init__(self, skill_slugs: list[str]):
        self.skill_slugs = skill_slugs

    def __str__(self) -> str:
        return f"Missing skills: {', '.join(self.skill_slugs)}"


class MissingAgentTeamsError(Exception):
    def __init__(self, team_ids: list[str]):
        self.team_ids = team_ids

    def __str__(self) -> str:
        return f"Missing teams: {', '.join(self.team_ids)}"


class AgentService:
    def __init__(self, session: Session):
        self.session = session

    def list_agents(self) -> list[Agent]:
        self.ensure_default_agents()
        statement = select(Agent).order_by(Agent.created_at.asc(), Agent.id.asc())
        return list(self.session.scalars(statement))

    def list_agent_reads(self) -> list[AgentRead]:
        self.ensure_default_agents()
        from app.services.teams import TeamService

        TeamService(self.session).ensure_default_teams()
        agents = self.list_agents()
        team_map = self._build_agent_team_map()

        return [
            AgentRead(
                id=agent.id,
                name=agent.name,
                role=agent.role,
                skills=list(agent.skills),
                team_ids=[team.id for team in team_map.get(agent.id, [])],
                team_names=[team.name for team in team_map.get(agent.id, [])],
                system_prompt=agent.system_prompt,
                model=agent.model,
                max_tokens=agent.max_tokens,
                status=agent.status,
                created_at=agent.created_at,
                updated_at=agent.updated_at,
            )
            for agent in agents
        ]

    def create_agent(self, payload: AgentCreate) -> AgentRead:
        self.ensure_default_agents()
        from app.services.skills import SkillService
        from app.services.teams import TeamService

        SkillService(self.session).ensure_default_skills()
        TeamService(self.session).ensure_default_teams()
        normalized_skills = list(dict.fromkeys(payload.skills))
        normalized_team_ids = list(dict.fromkeys(payload.team_ids))
        self._validate_skill_slugs(normalized_skills)
        self._validate_team_ids(normalized_team_ids)

        settings = get_settings()
        agent = Agent(
            name=payload.name,
            role=payload.role,
            skills=normalized_skills,
            system_prompt=payload.system_prompt,
            model=payload.model or settings.default_model,
            max_tokens=payload.max_tokens or 4096,
            status=payload.status,
        )
        self.session.add(agent)
        self.session.commit()
        self.session.refresh(agent)

        if normalized_team_ids:
            self.session.add_all(
                AgentTeamMembership(agent_id=agent.id, team_id=team_id)
                for team_id in normalized_team_ids
            )
            self.session.commit()

        return self._build_agent_read(agent.id)

    def set_active_agent(self, active_agent_id: str) -> None:
        self.ensure_default_agents()
        agents = self.list_agents()

        for agent in agents:
            if agent.status == AgentStatus.OFFLINE:
                continue

            agent.status = AgentStatus.ONLINE if agent.id == active_agent_id else AgentStatus.IDLE

        self.session.commit()

    def set_agent_idle(self, agent_id: str) -> None:
        self.ensure_default_agents()
        agent = self.session.get(Agent, agent_id)

        if agent is None or agent.status == AgentStatus.OFFLINE:
            return

        agent.status = AgentStatus.IDLE
        self.session.commit()

    def resolve_execution_agent(self, role: AgentRole) -> Agent:
        self.ensure_default_agents()
        candidates = [
            agent
            for agent in self.list_agents()
            if agent.role == role and agent.status != AgentStatus.OFFLINE
        ]
        if not candidates:
            raise RuntimeError(f"No agent configured for role: {role.value}")

        def sort_key(agent: Agent) -> tuple[int, object, object, str]:
            status_priority = 0 if agent.status == AgentStatus.ONLINE else 1
            return (status_priority, agent.updated_at, agent.created_at, agent.id)

        return sorted(candidates, key=sort_key)[0]

    def ensure_default_agents(self) -> None:
        has_agents = self.session.scalar(select(Agent.id).limit(1))
        if has_agents is not None:
            return

        settings = get_settings()
        default_agents = [
            Agent(
                id=definition["id"],
                name=definition["name"],
                role=definition["role"],
                skills=list(definition["skills"]),
                system_prompt=self._read_prompt(definition["prompt_file"]),
                model=settings.default_model,
                max_tokens=4096,
                status=definition["status"],
            )
            for definition in DEFAULT_AGENTS
        ]

        self.session.add_all(default_agents)
        self.session.commit()

    def _read_prompt(self, filename: str) -> str:
        return (PROMPT_DIR / filename).read_text(encoding="utf-8")

    def _build_agent_read(self, agent_id: str) -> AgentRead:
        for agent in self.list_agent_reads():
            if agent.id == agent_id:
                return agent

        raise RuntimeError(f"Agent not found after creation: {agent_id}")

    def _build_agent_team_map(self) -> dict[str, list[AgentTeam]]:
        memberships = list(self.session.scalars(select(AgentTeamMembership)))
        teams = {
            team.id: team
            for team in self.session.scalars(select(AgentTeam).order_by(AgentTeam.created_at.asc()))
        }
        mapping: dict[str, list[AgentTeam]] = {}

        for membership in memberships:
            team = teams.get(membership.team_id)
            if team is None:
                continue
            mapping.setdefault(membership.agent_id, []).append(team)

        return mapping

    def _validate_skill_slugs(self, skill_slugs: list[str]) -> None:
        if not skill_slugs:
            return

        statement = select(SkillLibraryItem.slug).where(SkillLibraryItem.slug.in_(skill_slugs))
        existing_slugs = set(self.session.scalars(statement))
        missing_slugs = [slug for slug in skill_slugs if slug not in existing_slugs]
        if missing_slugs:
            raise MissingAgentSkillsError(missing_slugs)

    def _validate_team_ids(self, team_ids: list[str]) -> None:
        if not team_ids:
            return

        statement = select(AgentTeam.id).where(AgentTeam.id.in_(team_ids))
        existing_ids = set(self.session.scalars(statement))
        missing_ids = [team_id for team_id in team_ids if team_id not in existing_ids]
        if missing_ids:
            raise MissingAgentTeamsError(missing_ids)
