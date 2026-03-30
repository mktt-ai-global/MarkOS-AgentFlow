from fastapi import APIRouter, HTTPException, Depends
from typing import List
from uuid import UUID
import uuid
from datetime import datetime

# Assume database access and service communication methods are available
# from ..models.project import Project, ProjectCreate

router = APIRouter()

from ...common.models.project import Project, ProjectCreate

# In-memory store for demonstration
projects_db = []

@router.post("/", response_model=Project)
async def create_project(project_in: ProjectCreate):
    project = Project(
        id=uuid.uuid4(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        **project_in.model_dump()
    )
    projects_db.append(project)
    return project

@router.get("/", response_model=List[Project])
async def list_projects():
    return projects_db

@router.get("/{project_id}", response_model=Project)
async def get_project(project_id: UUID):
    for project in projects_db:
        if project.id == project_id:
            return project
    raise HTTPException(status_code=404, detail="Project not found")

@router.delete("/{project_id}")
async def delete_project(project_id: UUID):
    for i, project in enumerate(projects_db):
        if project.id == project_id:
            del projects_db[i]
            return {"message": f"Project {project_id} deleted."}
    raise HTTPException(status_code=404, detail="Project not found")
