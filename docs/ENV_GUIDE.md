# Environment Variable Guide

This guide provides a detailed explanation of the variables used in `.env.example`.

## 1. Database (PostgreSQL)
- `DB_NAME`: The name of the database. Default is `agentflow`.
- `DB_USER`: The administrative user for the database.
- `DB_PASSWORD`: The password for the user. **Critical: Change this in production.**
- `DB_PORT`: The internal/external port for PostgreSQL. Default is `5432`.

## 2. Redis
- `REDIS_URL`: The full connection string for Redis. Used for task queuing and the orchestrator's state management.
  - Example: `redis://redis:6379/0`

## 3. Backend (FastAPI)
- `PROJECT_NAME`: The title of the app shown in the Swagger/OpenAPI docs.
- `API_V1_STR`: The prefix for all API endpoints. Default is `/api/v1`.
- `SECRET_KEY`: A high-entropy string used for JWT signing. **Critical: Change this in production.**
- `ACCESS_TOKEN_EXPIRE_MINUTES`: How long a JWT token remains valid.
- `CORS_ORIGINS`: A JSON array of allowed domains. Important for frontend communication.
  - Example: `["http://localhost:3000", "http://domain.com"]`
- `APP_ENV`: Deployment environment (`dev`, `stage`, `prod`).
- `APP_DEBUG`: If `true`, enables detailed error messages and FastAPI debug logs.

## 4. Frontend (Next.js)
- `NEXT_PUBLIC_API_URL`: The URL the browser uses to call the backend. 
  - Note: Use `localhost` for local dev and the public domain for production.

## 5. Security Best Practices
- **Never** commit your `.env` file to version control.
- Use a secrets manager (e.g., AWS Secrets Manager, GitHub Secrets) for production deployments.
- Periodically rotate the `SECRET_KEY`.
