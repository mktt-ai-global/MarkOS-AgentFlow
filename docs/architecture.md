# AgentFlow Architecture Freeze

This document captures the engineering baseline that Phase 1+ work must build on unless explicitly revised.

## Product Shape

AgentFlow is a vertical software-delivery system, not a general-purpose agent sandbox.

Core execution model:

1. Users create or import tasks.
2. The orchestrator evaluates dependency order and execution eligibility.
3. A role-specific agent runs against structured context.
4. The agent emits artifacts plus a strict handoff payload.
5. The orchestrator decides whether to continue, retry, block, or await intervention.
6. The dashboard visualizes current state, throughput, token cost, and artifacts.

## Bounded Contexts

### Frontend

- Owns interaction, dashboards, forms, settings, and realtime state visualization.
- Reads from backend APIs and WebSocket streams only.
- Does not call model providers directly.

### Backend API

- Owns authentication, task CRUD, agent configuration, dashboard aggregates, intervention actions.
- Provides the public application contract to the frontend.

### Orchestrator

- Owns execution sequencing and dependency enforcement.
- Owns task state transitions.
- Owns handoff packing and context truncation.
- Owns retries, blocking, and routing into human intervention.

### Agent Runner

- Executes a single role invocation against the configured provider model.
- Does not directly schedule sibling or downstream tasks.
- Returns structured usage stats and raw output artifacts to the orchestrator.

### Artifact Storage

- Stores generated documents, code output, test reports, and execution logs.
- Large outputs must be referenced by path from the handoff payload instead of being injected in full.

## Repository Baseline

```text
frontend/
  src/
backend/
  app/
    api/
    core/
    models/
    schemas/
    services/
    prompts/
  alembic/
docs/
```

## Frozen Technical Choices

- Frontend: React 18 + Vite + TypeScript + Tailwind CSS
- State management direction: lightweight client state with local stores in Phase 1, shared domain stores in later phases
- Backend: FastAPI + Pydantic Settings + SQLAlchemy + Alembic
- Database: PostgreSQL
- Queue / transient state: Redis
- Realtime transport: WebSocket
- Model provider integration path: Anthropic via backend only

## Domain Entities

### Task

Minimum required fields:

- `id`
- `title`
- `description`
- `assigned_agent`
- `status`
- `depends_on`
- `handoff_context`
- `output`
- `token_used`
- `retry_count`
- `created_at`
- `updated_at`

### Agent

Minimum required fields:

- `id`
- `name`
- `role`
- `skills`
- `system_prompt`
- `model`
- `max_tokens`
- `status`

## State Machine Freeze

Primary task states:

- `PENDING`
- `RUNNING`
- `DONE`
- `BLOCKED`
- `FAILED`
- `SKIPPED`

Rules:

- A dependency-bound task must not enter `RUNNING` until every prerequisite is `DONE`.
- Execution errors should route through retry or `BLOCKED` before final `FAILED`.
- Only the orchestrator can advance sequential flow to the next task.

## Handoff Contract Freeze

- Contract source of truth: `docs/handoff-schema.json`
- Required top-level keys:
  - `summary`
  - `outputs`
  - `decisions`
  - `open_issues`
  - `next_hints`
- Additional top-level keys are not allowed.
- Payload budget target: <= 2000 tokens before prompt injection.

## Storage Conventions

- Runtime-generated artifacts will live under `data/artifacts/` in local development.
- Artifact paths referenced in handoffs must be relative to the repository root or a known storage prefix.
- Prompt templates live in `backend/app/prompts/`.

## Phase 0 Exit Criteria

- Repository has a stable directory structure.
- Local environment variables are documented.
- Architecture boundaries are written down.
- Handoff schema is frozen and machine-readable.
- Frontend and backend baseline entry points exist.
