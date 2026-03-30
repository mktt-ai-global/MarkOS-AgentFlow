from typing import Any, List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
import uuid

from app.db.session import get_db_session
from app.models.artifact import Artifact
from app.schemas import ArtifactCreate, ArtifactRead, ArtifactUpdate
from app.core.exceptions import NotFoundException

router = APIRouter()

@router.get("/", response_model=List[ArtifactRead])
def read_artifacts(
    db: Session = Depends(get_db_session),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    artifacts = db.exec(select(Artifact).offset(skip).limit(limit)).all()
    return artifacts

@router.post("/", response_model=ArtifactRead)
def create_artifact(
    *,
    db: Session = Depends(get_db_session),
    artifact_in: ArtifactCreate,
) -> Any:
    artifact = Artifact.from_orm(artifact_in)
    db.add(artifact)
    db.commit()
    db.refresh(artifact)
    return artifact

@router.put("/{id}", response_model=ArtifactRead)
def update_artifact(
    *,
    db: Session = Depends(get_db_session),
    id: uuid.UUID,
    artifact_in: ArtifactUpdate,
) -> Any:
    artifact = db.get(Artifact, id)
    if not artifact:
        raise NotFoundException(entity="Artifact", entity_id=id)
    artifact_data = artifact_in.dict(exclude_unset=True)
    for key, value in artifact_data.items():
        setattr(artifact, key, value)
    db.add(artifact)
    db.commit()
    db.refresh(artifact)
    return artifact

@router.get("/{id}", response_model=ArtifactRead)
def read_artifact(
    *,
    db: Session = Depends(get_db_session),
    id: uuid.UUID,
) -> Any:
    artifact = db.get(Artifact, id)
    if not artifact:
        raise NotFoundException(entity="Artifact", entity_id=id)
    return artifact

@router.delete("/{id}", response_model=ArtifactRead)
def delete_artifact(
    *,
    db: Session = Depends(get_db_session),
    id: uuid.UUID,
) -> Any:
    artifact = db.get(Artifact, id)
    if not artifact:
        raise NotFoundException(entity="Artifact", entity_id=id)
    db.delete(artifact)
    db.commit()
    return artifact
