from __future__ import annotations

from dataclasses import dataclass
import re

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.agent import Agent
from app.models.skill import SkillLibraryItem
from app.schemas.skill import SkillCreate, SkillRead


@dataclass(slots=True)
class DuplicateSkillSlugError(Exception):
    slug: str

    def __str__(self) -> str:
        return f"Skill slug already exists: {self.slug}"


DEFAULT_SKILLS: tuple[dict[str, object], ...] = (
    {
        "id": "skill-requirements",
        "name": "Requirements",
        "slug": "requirements",
        "category": "product",
        "description": "负责收敛需求背景、边界和验收标准。",
        "prompt_hint": "适合 PM Agent 做需求拆解和验收条件冻结。",
        "is_core": True,
    },
    {
        "id": "skill-planning",
        "name": "Planning",
        "slug": "planning",
        "category": "product",
        "description": "负责任务拆分、依赖顺序和执行节奏规划。",
        "prompt_hint": "适合多 Agent handoff 前的顺序编排。",
        "is_core": True,
    },
    {
        "id": "skill-acceptance-criteria",
        "name": "Acceptance Criteria",
        "slug": "acceptance-criteria",
        "category": "product",
        "description": "负责定义明确的交付标准和验证口径。",
        "prompt_hint": "适合 PM 与 QA 共用验收语言。",
        "is_core": True,
    },
    {
        "id": "skill-implementation",
        "name": "Implementation",
        "slug": "implementation",
        "category": "engineering",
        "description": "负责主链路实现、结构化代码输出与改动说明。",
        "prompt_hint": "适合 Dev Agent 承接核心开发任务。",
        "is_core": True,
    },
    {
        "id": "skill-unit-test",
        "name": "Unit Test",
        "slug": "unit-test",
        "category": "engineering",
        "description": "负责单测编写、自测清单和边界验证。",
        "prompt_hint": "适合 Dev 自测和 QA 上游验证。",
        "is_core": True,
    },
    {
        "id": "skill-artifact-output",
        "name": "Artifact Output",
        "slug": "artifact-output",
        "category": "engineering",
        "description": "负责产物归档、输出结构和交付目录规范。",
        "prompt_hint": "适合 Dev/QA 持续输出 artifacts。",
        "is_core": False,
    },
    {
        "id": "skill-integration-test",
        "name": "Integration Test",
        "slug": "integration-test",
        "category": "quality",
        "description": "负责端到端链路验证和集成回归。",
        "prompt_hint": "适合 QA Agent 做主链路回归。",
        "is_core": True,
    },
    {
        "id": "skill-bug-report",
        "name": "Bug Report",
        "slug": "bug-report",
        "category": "quality",
        "description": "负责结构化输出风险、阻塞和复现路径。",
        "prompt_hint": "适合 QA 与人工介入环节共享问题上下文。",
        "is_core": False,
    },
    {
        "id": "skill-risk-review",
        "name": "Risk Review",
        "slug": "risk-review",
        "category": "quality",
        "description": "负责收敛高风险节点并给出复验建议。",
        "prompt_hint": "适合 QA 收尾和 Phase 7 审计链路。",
        "is_core": False,
    },
)


def slugify_skill_name(value: str) -> str:
    normalized = re.sub(r"[^a-z0-9]+", "-", value.strip().lower())
    return normalized.strip("-") or "skill"


class SkillService:
    def __init__(self, session: Session):
        self.session = session

    def list_skill_reads(self) -> list[SkillRead]:
        self.ensure_default_skills()
        statement = select(SkillLibraryItem).order_by(
            SkillLibraryItem.is_core.desc(),
            SkillLibraryItem.category.asc(),
            SkillLibraryItem.created_at.asc(),
            SkillLibraryItem.id.asc(),
        )
        skills = list(self.session.scalars(statement))
        agents = list(self.session.scalars(select(Agent)))

        return [
            SkillRead(
                id=skill.id,
                name=skill.name,
                slug=skill.slug,
                category=skill.category,
                description=skill.description,
                prompt_hint=skill.prompt_hint,
                is_core=skill.is_core,
                usage_count=sum(1 for agent in agents if skill.slug in agent.skills),
                created_at=skill.created_at,
                updated_at=skill.updated_at,
            )
            for skill in skills
        ]

    def create_skill(self, payload: SkillCreate) -> SkillRead:
        self.ensure_default_skills()
        slug = slugify_skill_name(payload.name)
        exists = self.session.scalar(select(SkillLibraryItem.id).where(SkillLibraryItem.slug == slug))
        if exists is not None:
            raise DuplicateSkillSlugError(slug)

        skill = SkillLibraryItem(
            name=payload.name,
            slug=slug,
            category=payload.category or "general",
            description=payload.description,
            prompt_hint=payload.prompt_hint,
            is_core=payload.is_core,
        )
        self.session.add(skill)
        self.session.commit()
        self.session.refresh(skill)

        return SkillRead(
            id=skill.id,
            name=skill.name,
            slug=skill.slug,
            category=skill.category,
            description=skill.description,
            prompt_hint=skill.prompt_hint,
            is_core=skill.is_core,
            usage_count=0,
            created_at=skill.created_at,
            updated_at=skill.updated_at,
        )

    def ensure_default_skills(self) -> None:
        has_skills = self.session.scalar(select(SkillLibraryItem.id).limit(1))
        if has_skills is not None:
            return

        self.session.add_all(
            SkillLibraryItem(
                id=str(definition["id"]),
                name=str(definition["name"]),
                slug=str(definition["slug"]),
                category=str(definition["category"]),
                description=str(definition["description"]),
                prompt_hint=str(definition["prompt_hint"]),
                is_core=bool(definition["is_core"]),
            )
            for definition in DEFAULT_SKILLS
        )
        self.session.commit()
