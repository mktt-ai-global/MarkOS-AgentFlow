from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "AgentFlow"
    app_env: str = "development"
    app_debug: bool = True
    log_level: str = "INFO"

    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    api_prefix: str = "/api/v1"
    cors_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:5173", "http://127.0.0.1:5173"]
    )

    database_url: str = (
        "postgresql+psycopg://agentflow:agentflow@localhost:5432/agentflow"
    )
    redis_url: str = "redis://localhost:6379/0"

    default_model: str = "claude-sonnet-4-6"
    anthropic_api_key: str | None = None
    handoff_max_tokens: int = Field(default=2000, ge=100, le=16000)
    task_max_retries: int = Field(default=1, ge=0, le=5)
    artifacts_dir: Path = Path("./data/artifacts")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]

        return value


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
