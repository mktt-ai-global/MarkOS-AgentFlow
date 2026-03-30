# Multi-stage Dockerfile for Python Orchestrator
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
COPY services/orchestrator/requirements.txt .
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
COPY services/orchestrator /app/services/orchestrator
# COPY packages /app/packages  # Uncomment when shared packages exist

ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Orchestrator runs a long-lived loop
CMD ["python", "-m", "services.orchestrator.loop"]
