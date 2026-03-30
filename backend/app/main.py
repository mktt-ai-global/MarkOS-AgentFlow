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
    # Startup: Start orchestrator
    logger = logging.getLogger("agentflow")
    logger.info(
        "Starting %s in %s mode",
        settings.PROJECT_NAME,
        settings.APP_ENV,
    )
    
    # Optional: Start background control loops or workers
    await orchestrator.start()
    
    yield
    
    # Shutdown: Stop orchestrator
    logger.info("Stopping %s", settings.PROJECT_NAME)
    await orchestrator.stop()

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        debug=settings.APP_DEBUG,
        lifespan=lifespan,
    )
    
    # Set all CORS enabled origins
    if settings.CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    
    # Domain routes
    app.include_router(api_router, prefix=settings.API_V1_STR)
    
    return app

app = create_app()

@app.get("/health")
def health_check():
    return {"status": "ok", "app": settings.PROJECT_NAME}
