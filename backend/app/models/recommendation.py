"""AI recommendation model."""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, CrossDBJSON, CrossDBUUID, UUIDMixin


class AIRecommendation(UUIDMixin, Base):
    __tablename__ = "ai_recommendations"

    user_id: Mapped[uuid.UUID] = mapped_column(
        CrossDBUUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    recommendation_type: Mapped[str] = mapped_column(String(100), nullable=False)
    content: Mapped[dict] = mapped_column(CrossDBJSON, nullable=False)
    ai_explanation: Mapped[Optional[str]] = mapped_column(Text)
    is_dismissed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
