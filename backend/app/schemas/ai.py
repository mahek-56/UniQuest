"""
AI feature request/response schemas.
"""

from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel


class TutorRequest(BaseModel):
    # Frontend sends: { message, subject, history }
    message: Optional[str] = None          # frontend field name
    question: Optional[str] = None         # legacy backend field
    context: Optional[str] = None
    subject: Optional[str] = None
    history: list[dict] = []               # conversation history from frontend

    @property
    def effective_question(self) -> str:
        """Return whichever question field is populated."""
        return self.message or self.question or ""


class TutorResponse(BaseModel):
    # Frontend expects: { reply, timestamp, suggestedFollowUps }
    reply: str
    answer: Optional[str] = None          # legacy field alias
    timestamp: Optional[str] = None
    suggestedFollowUps: list[str] = []
    follow_up_suggestions: list[str] = [] # legacy alias


class StudyPlanRequest(BaseModel):
    # Frontend fields (camelCase)
    dailyHours: Optional[float] = None
    targetGrade: Optional[str] = None
    weakTopics: Optional[list[str]] = None
    deadlines: Optional[list[str]] = None

    # Backend/legacy fields (snake_case)
    subjects: Optional[list[str]] = None
    exam_date: Optional[str] = None
    daily_hours: Optional[float] = None
    goals: Optional[str] = None

    # Resolved fields — computed after init
    effective_daily_hours: float = 2.0
    effective_subjects: list[str] = []

    model_config = {"populate_by_name": True}

    @classmethod
    def model_validate(cls, obj, **kwargs):
        instance = super().model_validate(obj, **kwargs)
        instance.effective_daily_hours = instance.dailyHours or instance.daily_hours or 2.0
        instance.effective_subjects = instance.subjects or [
            "DBMS", "Operating Systems", "DSA", "Computer Networks", "AI/ML"
        ]
        return instance

    def __init__(self, **data):
        super().__init__(**data)
        self.effective_daily_hours = self.dailyHours or self.daily_hours or 2.0
        self.effective_subjects = self.subjects or [
            "DBMS", "Operating Systems", "DSA", "Computer Networks", "AI/ML"
        ]


class StudyPlanResponse(BaseModel):
    plan_id: UUID
    plan_data: dict[str, Any]
    generated_at: datetime
    expires_at: Optional[datetime] = None


class RecommendationResponse(BaseModel):
    """
    Frontend expects: { id, type, subject, title, reason, duration, xpPotential,
                        difficulty, badge, actionUrl, actionLabel }
    """
    id: Any                               # UUID or string
    type: Optional[str] = None            # frontend field
    recommendation_type: Optional[str] = None  # backend field
    subject: Optional[str] = None
    title: Optional[str] = None
    reason: Optional[str] = None
    duration: Optional[str] = None
    xpPotential: Optional[int] = None
    difficulty: Optional[str] = None
    badge: Optional[str] = None
    actionUrl: Optional[str] = None
    actionLabel: Optional[str] = None
    content: Optional[dict[str, Any]] = None
    ai_explanation: Optional[str] = None
    created_at: Optional[datetime] = None

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
