from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.api.deps import DbSession
from app.schemas.skill import SkillCreate, SkillRead
from app.services.skills import DuplicateSkillSlugError, SkillService

router = APIRouter(prefix="/skills", tags=["skills"])


@router.get("", response_model=list[SkillRead])
def list_skills(session: DbSession) -> list[SkillRead]:
    return SkillService(session).list_skill_reads()


@router.post("", response_model=SkillRead, status_code=status.HTTP_201_CREATED)
def create_skill(payload: SkillCreate, session: DbSession) -> SkillRead:
    service = SkillService(session)

    try:
        return service.create_skill(payload)
    except DuplicateSkillSlugError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
