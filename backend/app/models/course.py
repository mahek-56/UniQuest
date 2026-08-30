"""
Course, Module, Lesson, and Enrollment models.
"""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, CrossDBUUID, TimestampMixin, UUIDMixin


class Course(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "courses"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    subject: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    difficulty: Mapped[str] = mapped_column(String(50), nullable=False, default="medium")
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(512))
    is_published: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        CrossDBUUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    modules: Mapped[list["Module"]] = relationship(
        "Module", back_populates="course", order_by="Module.order_index",
        cascade="all, delete-orphan"
    )
    enrollments: Mapped[list["CourseEnrollment"]] = relationship(
        "CourseEnrollment", back_populates="course", cascade="all, delete-orphan"
    )


class Module(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "modules"

    course_id: Mapped[uuid.UUID] = mapped_column(
        CrossDBUUID, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    course: Mapped["Course"] = relationship("Course", back_populates="modules")
    lessons: Mapped[list["Lesson"]] = relationship(
        "Lesson", back_populates="module", order_by="Lesson.order_index",
        cascade="all, delete-orphan"
    )


class Lesson(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "lessons"

    module_id: Mapped[uuid.UUID] = mapped_column(
        CrossDBUUID, ForeignKey("modules.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[Optional[str]] = mapped_column(Text)
    video_url: Mapped[Optional[str]] = mapped_column(String(512))
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    xp_reward: Mapped[int] = mapped_column(Integer, nullable=False, default=20)

    module: Mapped["Module"] = relationship("Module", back_populates="lessons")


class CourseEnrollment(UUIDMixin, Base):
    __tablename__ = "course_enrollments"
    __table_args__ = (
        UniqueConstraint("user_id", "course_id", name="uq_enrollment_user_course"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        CrossDBUUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        CrossDBUUID, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    course: Mapped["Course"] = relationship("Course", back_populates="enrollments")
