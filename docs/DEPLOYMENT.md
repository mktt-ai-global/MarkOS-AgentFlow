# Deployment Guide

## Production Deployment (Docker)

The recommended way to deploy AgentFlow is using the provided `docker-compose.yml`.

### 1. Prepare Environment
Create a `.env` file based on `.env.example`. Ensure `SECRET_KEY` and database passwords are secure.

### 2. Build and Launch
```bash
docker-compose -f docker-compose.yml up --build -d
```

### 3. Database Migrations
Run migrations using Alembic:
```bash
docker exec -it agentflow-api alembic upgrade head
```

## Scaling
The orchestrator and api-gateway can be scaled horizontally. Ensure Redis is used for shared state.

## Monitoring
- Check logs: `docker-compose logs -f`
- Health check: `curl http://localhost:8000/health`
