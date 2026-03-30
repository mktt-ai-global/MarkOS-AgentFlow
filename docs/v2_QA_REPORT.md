# AgentFlow Enterprise (v2.0) QA Audit Report

**Date:** March 30, 2026
**Role:** QA Auditor
**Scope:** Backend Services, Task/Handoff Models, Dashboard Frontend, DevOps/Docker

---

## 1. Backend Services Audit (`services/`)

### 1.1 Hardcoded Secrets & Configuration
- **[CRITICAL]** `docker-compose.yml` contains default credentials: `POSTGRES_PASSWORD: ${DB_PASSWORD:-secret_password}`.
- **[MEDIUM]** `api-gateway/main.py` uses `allow_origins=["*"]` for CORS. This should be restricted to specific domains in production.

### 1.2 Input Validation
- **[LOW]** In `services/common/models/handoff.py`, the `Artifact` model defines `type: str` instead of using the `ArtifactType` Enum. This bypasses Pydantic's enum validation.
- **[LOW]** `TaskCreate` in `task.py` lacks specific validation to ensure initial tasks start in `PENDING` or `READY` status.

### 1.3 Error Handling
- **[MEDIUM]** The orchestrator control loop (`loop.py`) uses a broad `except Exception` block. While good for keeping the loop alive, it lacks specialized handling for connection errors vs. logic errors.
- **[LOW]** Legacy backend components (if still referenced) were found to use `raise HTTPException(..., detail=str(exc))`, which can leak database schema or internal logic details.

---

## 2. Model & Logic Audit (`services/common/models/`)

### 2.1 TaskStatus State Machine
- **[HIGH]** Missing State Transition Logic: The `update_task_status` endpoint allows moving a task from any state to any other state (e.g., `COMPLETED` -> `PENDING`). A formal state machine should be implemented to enforce valid transitions.
- **[MEDIUM]** `READY` vs `PENDING`: The logic for moving tasks from `PENDING` to `READY` in `orchestrator/loop.py` is currently a placeholder and needs robust dependency checking.

### 2.2 Handoff Protocol
- **[MEDIUM]** The `Handoff` model is data-only. There is no logic ensuring that an agent *must* provide a `Handoff` payload before a task can be marked as `COMPLETED`.
- **[LOW]** `HandoffMetadata` uses `datetime.utcnow()`, which is deprecated in Python 3.12. Recommendation: Use `datetime.now(timezone.utc)`.

---

## 3. Frontend Dashboard Audit (`apps/dashboard/`)

### 3.1 Best Practices & Security
- **[MEDIUM]** `next.config.mjs` is empty. It should be configured with secure HTTP headers:
    - `Content-Security-Policy`
    - `Strict-Transport-Security`
    - `X-Content-Type-Options: nosniff`
    - `X-Frame-Options: DENY`
- **[LOW]** Missing `.env.example`: Developers joining the project don't have a template for required environment variables.
- **[LOW]** Hardcoded API URL: `NEXT_PUBLIC_API_URL` defaults to `localhost:8000` in docker-compose, which may fail in multi-host deployments or custom network setups.

---

## 4. DevOps & Docker Audit (`docker/`)

### 4.1 Container Security
- **[HIGH]** **Root Usage**: `api-gateway.Dockerfile` and `orchestrator.Dockerfile` do not define a non-root user. Processes are running as `root` inside the container.
- **[MEDIUM]** **Unnecessary Port Exposure**: `docker-compose.yml` exposes Postgres (5432) and Redis (6379) to the host machine. These should be kept internal to the docker bridge network unless external access is specifically required.

### 4.2 Build Optimization
- **[LOW]** Multi-stage builds are used correctly for both Python and Next.js services, which is a good practice for reducing image size and attack surface.

---

## Summary of Recommendations

1. **Secrets**: Move all default passwords to a `.env.example` and remove them from `docker-compose.yml`.
2. **Docker**: Add `USER` instructions to all Dockerfiles to follow the principle of least privilege.
3. **Logic**: Implement a `validate_transition` method in the `Task` model or a dedicated service.
4. **Headers**: Update `next.config.mjs` with recommended security headers.
5. **Validation**: Fix the `Artifact` model to use the `ArtifactType` enum.

**Status:** Audit Completed. Remediation required for [CRITICAL] and [HIGH] findings before v2 release.
