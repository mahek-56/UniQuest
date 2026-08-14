"""AI recommendation model."""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, UUIDMixin


class AIRecommendation(UUIDMixin, Base):
    __tablename__ = "ai_recommendations"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    recommendation_type: Mapped[str] = mapped_column(
        String(100), nullable=False
    )  # "lesson", "revision", "study_plan", etc.
    content: Mapped[dict] = mapped_column(JSONB, nullable=False)
    ai_explanation: Mapped[Optional[str]] = mapped_column(Text)
    is_dismissed: Mapped[bool] = mapped_column(default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
