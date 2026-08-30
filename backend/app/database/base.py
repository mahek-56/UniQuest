"""
SQLAlchemy declarative base and shared mixins.
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, JSON, String, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.types import TypeDecorator


class CrossDBJSON(TypeDecorator):
    """
    JSON column: uses JSONB on PostgreSQL, JSON on SQLite/others.
    """
    impl = JSON
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            from sqlalchemy.dialects.postgresql import JSONB
            return dialect.type_descriptor(JSONB())
        return dialect.type_descriptor(JSON())


class CrossDBUUID(TypeDecorator):
    """
    UUID column: uses native UUID on PostgreSQL, String(36) on SQLite/others.
    Always returns Python uuid.UUID objects.
    """
    impl = String(36)
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        return dialect.type_descriptor(String(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if dialect.name == "postgresql":
            return value  # pass uuid.UUID directly
        return str(value)  # SQLite needs string

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, uuid.UUID):
            return value
        return uuid.UUID(str(value))


class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


class UUIDMixin:
    """Provides a UUID primary key column (works on both PostgreSQL and SQLite)."""
    id: Mapped[uuid.UUID] = mapped_column(
        CrossDBUUID,
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )


class TimestampMixin:
    """Provides created_at and updated_at timestamp columns."""
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
