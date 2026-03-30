# AgentFlow Enterprise (v2.0) Architecture

## 1. System Overview
AgentFlow Enterprise is designed with a **decoupled, modular architecture**. It separates concerns between the Frontend (Presentation), Backend (Orchestration/API), and the Agent execution environment.

## 2. Orchestrator Pattern
The Orchestrator is the central "brain" that manages the lifecycle of tasks.

### 2.1 Centralized Control Loop
- **Listen**: Watch for task state changes (e.g., PENDING -> READY).
- **Evaluate**: Check dependency satisfaction (DAG evaluation).
- **Dispatch**: Send task to the appropriate Agent Worker.
- **Record**: Log output, update artifacts, and manage handoff propagation.
- **Decision**: Determine next state (DONE, BLOCKED, or FAILED).

### 2.2 Task State Machine (Extended)
- `PENDING`: Waiting for prerequisites.
- `READY`: All dependencies met; ready for execution.
- `RUNNING`: Agent actively executing.
- `AWAITING_REVIEW`: Execution finished; waiting for human approval.
- `COMPLETED`: Verified success.
- `FAILED`: Fatal error or retry limit reached.
- `BLOCKED`: Dependency failure or manual pause.

## 3. API Boundaries (FastAPI)
The Backend follows a strict RESTful pattern with domain-driven endpoints.

### 3.1 Domain Modules
- `/v2/projects`: Project-level settings and isolation.
- `/v2/tasks`: CRUD, dependency graph management, and execution control.
- `/v2/agents`: Registry of agents and their configured skills/prompts.
- `/v2/artifacts`: Managed access to generated outputs.
- `/v2/audit`: Immutable stream of system events.

### 3.2 Real-time Interface
- **WebSocket (WS)**: Pushes granular task progress and agent "thinking" streams to the frontend.
- **SSE (Server-Sent Events)**: Optional lightweight alternative for status-only updates.

## 4. Frontend Architecture (Next.js 14)
The frontend utilizes the **Next.js 14 App Router** for optimized server-side rendering and client-side interactivity.

- **Server Components**: Used for static pages and initial data fetching (e.g., project lists).
- **Client Components**: Used for the dashboard, real-time logs, and interactive graph visualizations.
- **State Management**: Zustand for global UI state; TanStack Query (React Query) for server state caching.
- **UI Framework**: Tailwind CSS with Radix UI primitives for accessible, high-quality "Frosted Glass" components.

## 5. Handoff Protocol (Strict)
The v2.0 handoff protocol is formal and machine-enforced.

### 5.1 Protocol Structure
```json
{
  "version": "2.0",
  "metadata": {
    "task_id": "UUID",
    "agent_id": "UUID",
    "timestamp": "ISO-8601"
  },
  "payload": {
    "summary": "Concise executive summary",
    "artifacts": [
       { "id": "UUID", "type": "CODE|DOC|TEST", "path": "string" }
    ],
    "decisions": [
       { "text": "string", "rationale": "string" }
    ],
    "remaining_debt": ["string"],
    "next_steps_hint": "string"
  }
}
```

## 6. Directory Structure (Enterprise Best Practices)
```text
agentflow-enterprise/
├── packages/              # Shared monorepo packages
│   ├── core/              # Shared types, schemas, and logic
│   ├── ui-components/     # Shared Tailwind/Radix UI library
│   └── database/          # Shared Prisma/SQLAlchemy models
├── services/              # Microservices / Backend components
│   ├── api-gateway/       # FastAPI - Main API entry point
│   ├── orchestrator/      # Python - Central control loop
│   └── agent-workers/     # Python - Task execution workers
├── apps/                  # User-facing applications
│   ├── dashboard/         # Next.js 14 - Admin/Monitoring
│   └── docs/              # Documentation site
├── infra/                 # Infrastructure as Code (Terraform/Docker)
└── scripts/               # Maintenance and CI/CD scripts
```

## 7. Development Standards
- **Strict Typing**: TypeScript (Frontend) and Pydantic/Python 3.12+ (Backend).
- **Dependency Injection**: Use FastAPI's DI system or a dedicated library (e.g., `dependency-injector`).
- **Observability**: OpenTelemetry instrumentation for distributed tracing across services.
- **Testing**:
    - Backend: Pytest with 80%+ coverage target.
    - Frontend: Playwright for E2E testing of core user flows.
