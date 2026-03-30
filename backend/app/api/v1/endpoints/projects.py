from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
import uuid

from app.db.session import get_db_session
from app.models.project import Project
from app.schemas import ProjectCreate, ProjectRead, ProjectUpdate

router = APIRouter()

@router.get("/", response_model=List[ProjectRead])
def read_projects(
    db: Session = Depends(get_db_session),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    projects = db.exec(select(Project).offset(skip).limit(limit)).all()
    return projects

@router.post("/", response_model=ProjectRead)
def create_project(
    *,
    db: Session = Depends(get_db_session),
    project_in: ProjectCreate,
) -> Any:
    project = Project.from_orm(project_in)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.put("/{id}", response_model=ProjectRead)
def update_project(
    *,
    db: Session = Depends(get_db_session),
    id: uuid.UUID,
    project_in: ProjectUpdate,
) -> Any:
    project = db.get(Project, id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project_data = project_in.dict(exclude_unset=True)
    for key, value in project_data.items():
        setattr(project, key, value)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.get("/{id}", response_model=ProjectRead)
def read_project(
    *,
    db: Session = Depends(get_db_session),
    id: uuid.UUID,
) -> Any:
    project = db.get(Project, id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.delete("/{id}", response_model=ProjectRead)
def delete_project(
    *,
    db: Session = Depends(get_db_session),
    id: uuid.UUID,
) -> Any:
    project = db.get(Project, id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return project
