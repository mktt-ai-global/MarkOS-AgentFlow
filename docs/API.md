# API Documentation

The AgentFlow Enterprise API is built with FastAPI and follows RESTful principles.

## Endpoints (v1)

### System
- `GET /health`: Returns system and dependency status.
- `GET /docs`: Interactive Swagger UI.

### Projects
- `GET /api/v1/projects`: List all projects.
- `POST /api/v1/projects`: Create a new project.
- `GET /api/v1/projects/{id}`: Get project details.

### Tasks
- `GET /api/v1/tasks`: List tasks with filters.
- `POST /api/v1/tasks`: Submit a new task to the orchestrator.
- `PATCH /api/v1/tasks/{id}`: Update task status or data.

### Agents
- `GET /api/v1/agents`: List available agent profiles.
- `POST /api/v1/agents`: Register or update an agent.

## Authentication
All endpoints except `/health` and `/docs` require a Bearer Token (JWT).
`Authorization: Bearer <token>`
