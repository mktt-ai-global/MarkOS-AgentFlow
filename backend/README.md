# AgentFlow Backend

FastAPI service foundation for AgentFlow.

Phase 2 establishes:

- settings and database session management
- Alembic migration baseline
- `Task` persistence with dependency validation
- `Agent` persistence with default seed data
- thin REST routes for health, tasks, and agents

Phase 4 adds:

- `POST /api/v1/tasks/{task_id}/run` for single-task execution
- prompt loading and task prompt assembly
- artifact persistence under `data/artifacts/`
- token accounting on completed tasks
- Anthropic-backed execution when `ANTHROPIC_API_KEY` is present, with a local mock fallback otherwise

Phase 5 adds:

- strict dependency-aware sequencing for downstream tasks
- handoff propagation into downstream task context
- handoff truncation against the configured token budget
- retry-before-block behavior via `TASK_MAX_RETRIES`
- blocked routing when a downstream task is ready but not yet supported for auto-run

Phase 6 adds:

- PM / Dev / QA all participate in the execution chain
- `GET /api/v1/ws/workspace` for realtime workspace snapshots
- artifact outputs for Dev and QA stages
- workspace-ready sequential auto-run for PM -> Dev -> QA dependencies
- agent catalog APIs for custom agents, teams, and skills library records

Useful local commands:

```bash
python3 -m pip install -e ".[dev]"
alembic upgrade head
uvicorn app.main:app --reload
pytest
```
