# Development Workflow

## Goal of Phase 0

Phase 0 exists to remove ambiguity before implementation accelerates. It freezes:

- repository layout
- environment variable names
- API ownership
- orchestrator boundaries
- handoff payload format
- local development commands

## Local Setup

1. Copy `.env.example` to `.env`.
2. Start local infrastructure with `docker compose up -d`.
3. Run `make bootstrap`.
4. Apply database migrations with `make db-upgrade`.
5. Start apps with `make frontend-dev` and `make backend-dev`.

Frontend runtime API base can be overridden with `frontend/.env`:

- `VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1`

Backend execution tuning can be configured in `.env`:

- `HANDOFF_MAX_TOKENS`
- `TASK_MAX_RETRIES`

## Conventions

### Documentation First for Core Boundary Changes

If a change impacts:

- task state transitions
- handoff structure
- orchestrator ownership
- external API shape

then the matching doc in `docs/` should be updated in the same change.

### Frontend

- Phase 1 migrates the existing `agent-dashboard.html` prototype into React components.
- Prototype parity matters more than introducing new UI concepts too early.
- Browser-side code must treat backend responses as the only source of truth for runtime state.

### Backend

- FastAPI route modules stay thin.
- Orchestrator and runner logic belong in `backend/app/services/`.
- Prompt templates live outside Python code in `backend/app/prompts/`.
- Schema and migration changes should land together in Phase 2+ work.

## Logging Baseline

- Use structured application logging with level control from environment variables.
- Provider secrets and raw credentials must never be logged.
- Task lifecycle events should eventually be loggable with stable event names.

## Testing Direction

- Phase 0: health checks and import safety
- Phase 1: component rendering and state hydration
- Phase 2+: API, migration, and schema validation coverage
