# Multi-stage Dockerfile for FastAPI Gateway
# Stage 1: Dependency Builder
FROM python:3.12-slim as builder

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir --upgrade pip
COPY services/api-gateway/requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Final Runtime
FROM python:3.12-slim

WORKDIR /app

# Install runtime dependencies for psycopg2 (libpq)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy application code (Assuming context is root)
COPY services/api-gateway /app/services/api-gateway
# COPY packages /app/packages  # Uncomment when shared packages exist

ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# Using gunicorn for production
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "services.api-gateway.main:app", "--bind", "0.0.0.0:8000", "--workers", "4"]
