# Database Schema Guide (PostgreSQL 16)

This document describes the core data models for MarkOS-AgentFlow.

## Core Entities

### 1. Projects
Stores high-level metadata for a multi-agent delivery project.
- `id`: UUID (Primary Key)
- `name`: String (e.g., "Web App Scraper")
- `description`: Text
- `status`: Enum (PLANNING, IN_PROGRESS, COMPLETED, ARCHIVED)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### 2. Agents
Profiles for autonomous specialized agents.
- `id`: UUID (Primary Key)
- `name`: String (e.g., "PM Agent")
- `role`: Enum (PM, DEV, QA)
- `status`: Enum (IDLE, BUSY, OFFLINE)
- `system_prompt`: Text
- `skills`: List[UUID] (Foreign Key to Skills)

### 3. Tasks
A single unit of work assigned by the Orchestrator.
- `id`: UUID (Primary Key)
- `project_id`: UUID (Foreign Key to Projects)
- `agent_id`: UUID (Foreign Key to Agents)
- `subject`: String
- `description`: Text
- `status`: Enum (PENDING, READY, RUNNING, REVIEW, DONE, FAILED)
- `input_data`: JSON (Handoff payload)
- `output_data`: JSON (Result payload)

### 4. Artifacts
Outputs produced by an agent task (Code, Docs, Logs).
- `id`: UUID (Primary Key)
- `task_id`: UUID (Foreign Key to Tasks)
- `type`: Enum (CODE, DOCUMENT, LOG)
- `content`: Text (or link to storage)
- `version`: String (SemVer)

### 5. Skills
Tools and capabilities available to agents.
- `id`: UUID (Primary Key)
- `name`: String
- `description`: Text
- `tools`: JSON (Function definitions)

## Relationships
- A **Project** has many **Tasks**.
- A **Task** is assigned to one **Agent** and produces one **Artifact**.
- An **Agent** has many **Skills**.
