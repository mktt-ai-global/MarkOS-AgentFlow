from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.schemas.agent import AgentRead
from app.schemas.realtime import WorkspaceSnapshotRead
from app.schemas.skill import SkillRead
from app.schemas.task import TaskRead
from app.schemas.team import TeamRead
from app.services.agents import AgentService
from app.services.dashboard import DashboardService
from app.services.skills import SkillService
from app.services.tasks import TaskService
from app.services.teams import TeamService


class WorkspaceSnapshotService:
    def __init__(self, session: Session):
        self.session = session

    def build_snapshot(self) -> WorkspaceSnapshotRead:
        tasks = TaskService(self.session).list_tasks()
        agents = AgentService(self.session).list_agent_reads()
        teams = TeamService(self.session).list_team_reads()
        skills = SkillService(self.session).list_skill_reads()
        dashboard_stats = DashboardService(self.session).get_stats()

        return WorkspaceSnapshotRead(
            emitted_at=datetime.now(timezone.utc),
            tasks=[TaskRead.model_validate(task) for task in tasks],
            agents=[AgentRead.model_validate(agent) for agent in agents],
            teams=[TeamRead.model_validate(team) for team in teams],
            skills=[SkillRead.model_validate(skill) for skill in skills],
            dashboard_stats=dashboard_stats,
        )
