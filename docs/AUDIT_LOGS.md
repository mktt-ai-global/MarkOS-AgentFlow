# Operational Audit Strategy

## Overview
AgentFlow Enterprise implements an asynchronous audit logging strategy to track all significant operations performed by both human users and AI agents.

## 1. Audit Levels
- **INFO**: Standard business operations (Project creation, Task assignment).
- **WARNING**: Potential security risks or task failures.
- **CRITICAL**: System-wide failures or unauthorized access attempts.

## 2. Audit Structure
Every audit entry is captured with the following context:
- `timestamp`: UTC ISO-8601.
- `actor_type`: `USER` | `AGENT` | `SYSTEM`.
- `actor_id`: UUID of the user or agent.
- `action`: The operation name (e.g., `TASK_EXECUTE`, `ARTIFACT_GENERATE`).
- `resource_id`: The affected entity ID.
- `status`: `SUCCESS` | `FAILURE`.
- `metadata`: A JSON object for action-specific details.

## 3. Storage & Retention
- **Hot Storage**: Audit logs are initially written to PostgreSQL in the `audit_logs` table.
- **Warm Storage**: Logs older than 30 days are archived to object storage (e.g., AWS S3).
- **Retention**: Financial and security-related logs are retained for 7 years per enterprise compliance standards.

## 4. API Endpoint
Audit logs are accessible to authorized administrators via:
`GET /api/v1/audit`
