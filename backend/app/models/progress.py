"""
User progress and study session tracking.
"""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, CrossDBUUID, UUIDMixin


class UserProgress(UUIDMixin, Base):
    __tablename__ = "user_progress"
    __table_args__ = (
        UniqueConstraint("user_id", "lesson_id", name="uq_progress_user_lesson"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        CrossDBUUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    lesson_id: Mapped[uuid.UUID] = mapped_column(
        CrossDBUUID, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, index=True
    )
    is_completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    time_spent_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_accessed: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))


class StudySession(UUIDMixin, Base):
    __tablename__ = "study_sessions"

    user_id: Mapped[uuid.UUID] = mapped_column(
        CrossDBUUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    lesson_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        CrossDBUUID, ForeignKey("lessons.id", ondelete="SET NULL"), nullable=True
    )
    course_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        CrossDBUUID, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True
    )
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    xp_earned: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
