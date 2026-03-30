# API Boundaries

This document describes ownership and shape, not final implementation detail.

## API Ownership

The backend is the only public application API. The frontend talks only to:

- REST endpoints under `/api/v1`
- WebSocket streams under `/ws`

No direct provider, database, or queue access is permitted from the browser.

## Planned REST Surface

### Tasks

- `POST /api/v1/tasks`
- `GET /api/v1/tasks`
- `GET /api/v1/tasks/{task_id}`
- `POST /api/v1/tasks/{task_id}/run`
- `POST /api/v1/tasks/{task_id}/intervene`

### Agents

- `GET /api/v1/agents`
- `POST /api/v1/agents`
- `PUT /api/v1/agents/{agent_id}/skills`

### Teams

- `GET /api/v1/teams`
- `POST /api/v1/teams`

### Skills

- `GET /api/v1/skills`
- `POST /api/v1/skills`

### Dashboard

- `GET /api/v1/dashboard/stats`

### System

- `GET /api/v1/health`

## WebSocket Surface

- `GET /api/v1/ws/workspace`

Expected event families:

- `workspace.snapshot`

## Contract Rules

- REST returns normalized JSON only.
- WebSocket messages must include an event type and payload object.
- The realtime stream may ship aggregated workspace snapshots so the frontend can refresh multiple panels without custom fan-out logic.
- Task write APIs must validate dependency integrity before persistence.
- Task read APIs must support returning handoff context without exposing provider secrets or raw credentials.
- Dashboard responses may provide aggregate read models tailored for the workspace UI.
- Task run APIs may orchestrate ready downstream tasks in the same request, but must still preserve strict sequential ordering.
