# AgentFlow Engineering Phases

## Phase 0

Goal: baseline setup and architecture freeze

Includes:

- repository skeleton
- local tooling
- docs freeze
- schema freeze
- dev workflow

Done when:

- frontend and backend entry points exist
- docs capture architecture boundaries
- handoff JSON schema is committed

## Phase 1

Goal: frontend engineering migration

Status: complete

Includes:

- migrate `agent-dashboard.html` into React
- component boundaries
- route and store setup
- mock-backed dashboard state
- multi-page workspace shell
- shared topbar search feedback
- empty-state handling for routed pages

Done when:

- prototype parity is achieved in the React app
- UI is no longer maintained as a single HTML file for core flow
- sidebar navigation maps to routed workspace pages
- shared shell interactions are reusable across pages

## Phase 2

Goal: backend service and data foundation

Status: complete

Includes:

- database setup
- task and agent models
- migration pipeline
- config and logging hardening
- seedable core agent records
- persisted task create/list/detail flow

Done when:

- backend can persist and retrieve core entities

## Phase 3

Goal: real task center and dashboard data

Status: complete

Includes:

- task CRUD APIs
- agent listing APIs
- dashboard stats APIs
- frontend wired to backend data
- task creation from the existing workspace shell
- API-backed dashboard, task center, and team view models

Done when:

- dashboard data survives refresh and is no longer static

## Phase 4

Goal: single-agent execution loop

Status: complete

Includes:

- provider client
- prompt loading
- PM agent execution
- output persistence
- token accounting
- local mock fallback when provider key is absent

Done when:

- one PM task can run end-to-end and generate artifacts

## Phase 5

Goal: orchestrator sequencing and handoff lifecycle

Status: complete

Includes:

- dependency enforcement
- strict sequential orchestration
- handoff creation and truncation
- retries and blocked routing
- downstream handoff propagation
- PM/AUTO auto-run policy with unsupported downstream roles routed to blocked state

Done when:

- downstream tasks only start after successful upstream completion

## Phase 6

Goal: multi-agent collaboration and realtime dashboard

Status: complete

Includes:

- PM -> Dev -> QA chain
- WebSocket updates
- live task state visualization
- artifact timeline
- task dependency creation from the workspace shell

Done when:

- a complete requirement can move through the three-agent chain

## Phase 7

Goal: production readiness

Includes:

- human intervention workflows
- auditability
- deployment packaging
- monitoring
- security hardening

Done when:

- the platform can be deployed as an MVP and operated with confidence
