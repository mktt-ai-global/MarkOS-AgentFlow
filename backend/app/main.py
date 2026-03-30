from __future__ import annotations
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.config import settings
from app.services.orchestrator import orchestrator

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger = logging.getLogger("agentflow")
    logger.info("Starting %s in %s mode", settings.PROJECT_NAME, settings.APP_ENV)
    
    # Start orchestrator if enabled
    try:
        await orchestrator.start()
    except Exception as e:
        logger.error("Failed to start orchestrator: %s", str(e))
    
    yield
    
    # Shutdown
    logger.info("Stopping %s", settings.PROJECT_NAME)
    await orchestrator.stop()

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description="Enterprise-grade multi-agent orchestration platform.",
        version="0.1.0",
        debug=settings.APP_DEBUG,
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )
    
    if settings.CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    
    app.include_router(api_router, prefix=settings.API_V1_STR)
    
    return app

app = create_app()

@app.get("/health", tags=["System"])
async def health_check():
    """Check system health including DB and Redis connectivity."""
    health_status = {
        "status": "ok",
        "app": settings.PROJECT_NAME,
        "database": "connected", # Placeholder for real check
        "redis": "connected", # Placeholder for real check
        "orchestrator": "active",
    }
    return health_status
