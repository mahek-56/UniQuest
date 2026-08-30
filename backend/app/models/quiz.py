"""
Quiz, Question, and QuizAttempt models.
All quizzes are manually created — NO AI generation.
"""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, CrossDBJSON, CrossDBUUID, TimestampMixin, UUIDMixin


class Quiz(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "quizzes"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    subject: Mapped[Optional[str]] = mapped_column(String(100), index=True)
    difficulty: Mapped[str] = mapped_column(String(50), nullable=False, default="medium")
    time_limit_minutes: Mapped[Optional[int]] = mapped_column(Integer)
    pass_score: Mapped[float] = mapped_column(Float, nullable=False, default=60.0)

    module_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        CrossDBUUID, ForeignKey("modules.id", ondelete="SET NULL"), nullable=True, index=True
    )
    lesson_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        CrossDBUUID, ForeignKey("lessons.id", ondelete="SET NULL"), nullable=True, index=True
    )
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        CrossDBUUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    questions: Mapped[list["Question"]] = relationship(
        "Question", back_populates="quiz", cascade="all, delete-orphan"
    )
    attempts: Mapped[list["QuizAttempt"]] = relationship(
        "QuizAttempt", back_populates="quiz", cascade="all, delete-orphan"
    )


class Question(UUIDMixin, Base):
    __tablename__ = "questions"

    quiz_id: Mapped[uuid.UUID] = mapped_column(
        CrossDBUUID, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    text: Mapped[str] = mapped_column(Text, nullable=False)
    options: Mapped[list] = mapped_column(CrossDBJSON, nullable=False)
    correct_answer: Mapped[str] = mapped_column(String(10), nullable=False)
    explanation: Mapped[Optional[str]] = mapped_column(Text)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    quiz: Mapped["Quiz"] = relationship("Quiz", back_populates="questions")


class QuizAttempt(UUIDMixin, Base):
    __tablename__ = "quiz_attempts"

    user_id: Mapped[uuid.UUID] = mapped_column(
        CrossDBUUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    quiz_id: Mapped[uuid.UUID] = mapped_column(
        CrossDBUUID, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    answers: Mapped[dict] = mapped_column(CrossDBJSON, nullable=False)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    correct_count: Mapped[int] = mapped_column(Integer, nullable=False)
    total_questions: Mapped[int] = mapped_column(Integer, nullable=False)
    time_taken_seconds: Mapped[Optional[int]] = mapped_column(Integer)
    passed: Mapped[bool] = mapped_column(nullable=False, default=False)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    xp_earned: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    coins_earned: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    quiz: Mapped["Quiz"] = relationship("Quiz", back_populates="attempts")
