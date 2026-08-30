"""
Application configuration loaded from environment variables.
Uses pydantic-settings for type-safe config with validation.
"""

from functools import lru_cache
from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # App
    APP_NAME: str = "UniQuest"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: Literal["development", "production", "testing"] = "development"

    # Database
    DATABASE_URL: str

    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # AI
    GEMINI_API_KEY: str = ""

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    @field_validator("JWT_SECRET_KEY")
    @classmethod
    def secret_key_min_length(cls, v: str) -> str:
        if len(v) < 16:
            raise ValueError("JWT_SECRET_KEY must be at least 16 characters")
        return v

    @property
    def allowed_origins(self) -> list[str]:
        origins = [self.FRONTEND_URL]
        if self.ENVIRONMENT == "development":
            origins += [
                "http://localhost:5173",
                "http://localhost:3000",
                "http://127.0.0.1:5173",
            ]
        return origins

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def testing_database_url(self) -> str:
        """SQLite in-memory URL used by the test suite."""
        return "sqlite+aiosqlite:///./test_uniquest.db"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
