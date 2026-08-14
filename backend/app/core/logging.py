"""
Structured logging configuration using structlog.
Sensitive fields (passwords, tokens, API keys) are never logged.
"""

import logging
import sys

import structlog
from structlog.types import EventDict, WrappedLogger

from app.core.config import settings

# Fields that must never appear in log output
_SENSITIVE_FIELDS = {
    "password",
    "hashed_password",
    "access_token",
    "refresh_token",
    "token",
    "api_key",
    "secret",
    "authorization",
}


def _drop_sensitive(
    logger: WrappedLogger,
    method: str,
    event_dict: EventDict,
) -> EventDict:
    """Structlog processor that removes sensitive keys from log records."""
    for field in _SENSITIVE_FIELDS:
        event_dict.pop(field, None)
    return event_dict


def setup_logging() -> None:
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO

    shared_processors: list = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        _drop_sensitive,
    ]

    if settings.is_production:
        # JSON output for production log aggregators
        renderer = structlog.processors.JSONRenderer()
    else:
        renderer = structlog.dev.ConsoleRenderer(colors=True)

    structlog.configure(
        processors=shared_processors
        + [
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            renderer,
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=log_level,
    )
    # Quiet noisy third-party loggers in production
    if settings.is_production:
        logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


def get_logger(name: str = __name__) -> structlog.stdlib.BoundLogger:
    return structlog.get_logger(name)
