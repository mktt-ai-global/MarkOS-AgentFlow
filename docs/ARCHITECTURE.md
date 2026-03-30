# AgentFlow Enterprise Architecture (v2.1)

## System Topology
AgentFlow follows a micro-services-inspired modular monorepo structure.

### 1. API Gateway (FastAPI)
The entry point for all client requests. It handles:
- Authentication & Authorization
- Rate limiting
- Routing to the Orchestrator or direct DB CRUD

### 2. Orchestrator Engine
A specialized control loop that manages the lifecycle of Agent Tasks.
- State Machine: `PENDING -> READY -> RUNNING -> REVIEW -> DONE`
- Dependency Resolver: Ensures tasks are executed in sequence based on Artifact Handoffs.

### 3. Data Layer
- **PostgreSQL 16**: Persistence for Tasks, Agents, Projects, and Artifacts.
- **Redis 7**: Pub/Sub for real-time updates and task queuing.

### 4. Frontend (Next.js 14)
A high-end "Frosted Glass" dashboard for real-time visualization.
- Zustand for global state.
- TanStack Query for server-state caching.

## Data Flow
1. User creates a Project via Frontend.
2. Architect Agent generates a Task Chain.
3. Orchestrator dispatches tasks to specific Agents.
4. Agents produce Artifacts.
5. Orchestrator verifies Handoff and triggers next task.
