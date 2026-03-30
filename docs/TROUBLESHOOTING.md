# Troubleshooting Guide

## Common Issues

### 1. Database Connection Failure
- **Symptoms**: Backend logs show `ConnectionRefusedError` or `Timeout`.
- **Solution**: Ensure the `db` container is healthy (`docker ps`). Check if the `DATABASE_URL` in `.env` matches the service name in docker-compose (`db`).

### 2. Redis Connection Failure
- **Symptoms**: Orchestrator fails to start or task queue is stuck.
- **Solution**: Check the `redis` container status. Ensure `REDIS_URL` is correct.

### 3. Frontend "API Connection Error"
- **Symptoms**: Dashboard shows error notifications when fetching data.
- **Solution**: Check if `NEXT_PUBLIC_API_URL` is correctly set in `.env` and accessible from your browser.

### 4. Docker Build Errors
- **Symptoms**: `npm ci` fails or Python dependencies cannot be installed.
- **Solution**: Check your internet connection (proxies may be needed). Ensure you have enough disk space.

## Debugging
- Enable debug mode: Set `APP_DEBUG=true` in `.env`.
- Check backend logs: `docker logs agentflow-api`.
- Check browser console for frontend errors.
