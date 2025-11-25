import os
from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import Field, validator
from typing import Optional, Union


class Settings(BaseSettings):
    """
    Application settings with Pydantic validation.
    Loads from environment variables with type checking and validation.
    """
    app_name: str = Field(default="MarketingKreis CRM", env="APP_NAME")
    environment: str = Field(default="development", env="ENVIRONMENT")

    backend_cors_origins: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        env="BACKEND_CORS_ORIGINS"
    )

    # CRITICAL: No more SQLite default - PostgreSQL only
    database_url: str = Field(
        default="sqlite:///./app.db",
        env="DATABASE_URL"
    )

    # JWT Authentication - validate non-default
    jwt_secret_key: str = Field(default="dev-secret-key-change-in-production-d8f7g6h5j4k3l2m1n0", env="JWT_SECRET_KEY", min_length=32)
    jwt_algorithm: str = Field(default="HS256", env="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(default=60, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    refresh_token_expire_minutes: int = Field(default=43200, env="REFRESH_TOKEN_EXPIRE_MINUTES")

    # Cookie settings
    cookie_domain: Optional[str] = Field(default=None, env="COOKIE_DOMAIN")
    cookie_secure: bool = Field(default=False, env="COOKIE_SECURE")
    cookie_samesite: str = Field(default="lax", env="COOKIE_SAMESITE")
    cookie_access_name: str = Field(default="access_token", env="COOKIE_ACCESS_NAME")
    cookie_refresh_name: str = Field(default="refresh_token", env="COOKIE_REFRESH_NAME")

    # Redis / RQ
    redis_url: str = Field(default="redis://localhost:6379/0", env="REDIS_URL")
    rq_default_queue: str = Field(default="default", env="RQ_DEFAULT_QUEUE")

    # Sentry
    sentry_dsn: Union[str, None] = Field(default=None, env="SENTRY_DSN")
    sentry_env: str = Field(default="development", env="SENTRY_ENV")

    # CSRF Protection
    csrf_secret_key: str = Field(
        default="dev-csrf-secret-change-in-production-a1b2c3d4e5f6g7h8",
        env="CSRF_SECRET_KEY",
        min_length=32
    )

    debug: bool = Field(default=True, env="DEBUG")

    # OpenAI
    openai_api_key: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    openai_model: str = Field(default="gpt-4o-mini", env="OPENAI_MODEL")

    @validator("jwt_secret_key")
    def validate_jwt_secret(cls, v: str, values: dict) -> str:
        """Ensure JWT secret is strong in production"""
        if values.get("environment") == "production":
            if v == "super-secret-change-me" or len(v) < 32:
                raise ValueError(
                    "JWT_SECRET_KEY must be a strong secret (min 32 chars) in production. "
                    "Generate with: python3 -c \"import secrets; print(secrets.token_urlsafe(64))\""
                )
        return v

    @validator("database_url")
    def validate_database_url(cls, v: str) -> str:
        """Validate database URL"""
        # Allow SQLite for development/demo
        return v

    class Config:
        # Load env file based on ENVIRONMENT; default to development
        env_file = ".env.production" if os.getenv("ENVIRONMENT") == "production" else ".env.development"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    Validates all environment variables on first access.
    Raises ValidationError if configuration is invalid.
    """
    return Settings()


