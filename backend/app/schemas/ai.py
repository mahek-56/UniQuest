"""
AI feature request/response schemas.
"""

from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel


class TutorRequest(BaseModel):
    question: str
    context: Optional[str] = None        # lesson content or subject context
    subject: Optional[str] = None


class TutorResponse(BaseModel):
    answer: str
    follow_up_suggestions: list[str] = []


class StudyPlanRequest(BaseModel):
    subjects: list[str]
    exam_date: Optional[str] = None      # ISO date string
    daily_hours: float = 2.0
    goals: Optional[str] = None


class StudyPlanResponse(BaseModel):
    plan_id: UUID
    plan_data: dict[str, Any]
    generated_at: datetime
    expires_at: Optional[datetime] = None


class RecommendationResponse(BaseModel):
    id: UUID
    recommendation_type: str
    content: dict[str, Any]
    ai_explanation: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ExplainAnswerRequest(BaseModel):
    question_text: str
    options: list[dict]
    correct_answer: str
    user_answer: str
    subject: Optional[str] = None


class ExplainAnswerResponse(BaseModel):
    explanation: str
    correct_answer_text: str
    why_wrong: str
