# AgentFlow

AgentFlow is a multi-agent software delivery platform focused on an engineering workflow:

- `PM Agent` turns raw requirements into PRD output and executable tasks.
- `Dev Agent` turns approved tasks into code, tests, and artifacts.
- `QA Agent` validates implementation quality and produces bug reports.
- `Orchestrator` owns sequencing, handoff packaging, retries, blocking rules, and auditability.

The repository now includes the first end-to-end multi-agent MVP chain on top of the earlier frontend migration work.

## Current Status

- PRD source: `AgentFlow_PRD.docx`
- UI prototype reference: `agent-dashboard.html`
- Engineering baseline: complete
- Frontend migration: complete
- Backend foundation: task and agent persistence baseline in place
- Phase 3 runtime wiring: frontend now reads task, agent, and dashboard data from API when available
- Phase 4 execution loop: PM tasks can now run end-to-end and persist artifacts
- Phase 5 orchestration: downstream tasks now obey dependency order, handoff propagation, retry, and blocked routing rules
- Phase 6 collaboration loop: PM -> Dev -> QA tasks can now auto-chain and stream workspace snapshots over WebSocket
- Agent catalog foundation: workspace now supports creating additional agents, agent teams, and a reusable skills library

## Repository Layout

```text
.
├── AgentFlow_PRD.docx
├── agent-dashboard.html
├── backend
│   ├── alembic
│   └── app
├── docs
├── frontend
│   └── src
└── .github
    └── workflows
```

## Frozen Phase Plan

- `Phase 0`: baseline setup, repo structure, architecture freeze, schemas, tooling
- `Phase 1`: React frontend migration from the HTML prototype
- `Phase 2`: backend data layer and service foundation
- `Phase 3`: task CRUD and real dashboard data
- `Phase 4`: single-agent execution loop
- `Phase 5`: orchestrator sequencing and handoff lifecycle
- `Phase 6`: PM -> Dev -> QA chain and realtime monitoring
- `Phase 7`: human intervention, deployment, and production hardening

Detailed phase planning lives in `docs/phases.md`.

## Core Documents

- `docs/architecture.md`: architecture freeze and module boundaries
- `docs/api-boundaries.md`: backend ownership and contract surface
- `docs/handoff-schema.json`: strict JSON schema for task handoff payloads
- `docs/development.md`: local development workflow and conventions

## Local Development

Prerequisites:

- Node.js 20+
- pnpm 9+
- Python 3.12+
- PostgreSQL 16+
- Redis 7+

Suggested bootstrap flow:

```bash
make bootstrap
make frontend-dev
make backend-dev
```

## Baseline Rules

- Frontend must not call model providers directly.
- Agent-to-agent communication must flow through the orchestrator only.
- Handoff payloads must follow `docs/handoff-schema.json`.
- Sequential dependencies must not be bypassed by direct task execution.
- Architecture changes that break the current Phase 0 baseline should be captured in docs before implementation.
