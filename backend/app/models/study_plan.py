"""
AI-generated study plan model.
"""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, CrossDBJSON, CrossDBUUID, UUIDMixin


class StudyPlan(UUIDMixin, Base):
    __tablename__ = "study_plans"

    user_id: Mapped[uuid.UUID] = mapped_column(
        CrossDBUUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    plan_data: Mapped[dict] = mapped_column(CrossDBJSON, nullable=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
