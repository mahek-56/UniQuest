"""
Revision / spaced-repetition schemas.
"""

from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class RevisionTopicResponse(BaseModel):
    id: UUID
    topic: str
    subject: str
    difficulty: str
    performance_score: float
    next_revision_date: date
    interval_days: int
    repetitions: int
    last_revised_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class RevisionCompleteResponse(BaseModel):
    message: str
    next_revision_date: date
    new_interval_days: int
    xp_earned: int


class RevisionReviewRequest(BaseModel):
    """Frontend sends {rating: 'again'|'hard'|'good'|'easy'}"""
    rating: str
