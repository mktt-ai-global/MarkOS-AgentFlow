from __future__ import annotations
from typing import Any, Dict, Optional
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

class AgentFlowException(Exception):
    """Base exception for all AgentFlow errors."""
    def __init__(
        self,
        message: str,
        code: str = "INTERNAL_SERVER_ERROR",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}

class UnauthorizedException(AgentFlowException):
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, "UNAUTHORIZED", status.HTTP_401_UNAUTHORIZED)

class ForbiddenException(AgentFlowException):
    def __init__(self, message: str = "Forbidden"):
        super().__init__(message, "FORBIDDEN", status.HTTP_403_FORBIDDEN)

class NotFoundException(AgentFlowException):
    def __init__(self, entity: str, entity_id: Any):
        super().__init__(f"{entity} with id {entity_id} not found", "NOT_FOUND", status.HTTP_404_NOT_FOUND)

def register_exception_handlers(app: FastAPI):
    @app.exception_handler(AgentFlowException)
    async def agentflow_exception_handler(request: Request, exc: AgentFlowException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": exc.code,
                    "message": exc.message,
                    "details": exc.details
                }
            }
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": "HTTP_ERROR",
                    "message": str(exc.detail)
                }
            }
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Input validation failed",
                    "details": exc.errors()
                }
            }
        )
