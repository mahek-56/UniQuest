"""
AI feature request/response schemas.
"""

from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel


class TutorRequest(BaseModel):
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
    reply: str
    answer: Optional[str] = None          # legacy field alias
    timestamp: Optional[str] = None
    suggestedFollowUps: list[str] = []
    follow_up_suggestions: list[str] = [] # legacy alias


class StudyPlanRequest(BaseModel):
    # Mode selection: "custom_range" | "exam_prep"
    mode: Optional[str] = "custom_range"

    # Custom Date Range Plan fields
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None

    # Exam Prep Plan fields
    exam_date: Optional[str] = None
    examDate: Optional[str] = None
    target_grade: Optional[str] = None
    targetGrade: Optional[str] = None
    preparation_level: Optional[str] = None
    preparationLevel: Optional[str] = None

    # Shared parameters
    dailyHours: Optional[float] = None
    daily_hours: Optional[float] = None
    subjects: Optional[list[str]] = None
    weakTopics: Optional[list[str]] = None
    weak_topics: Optional[list[str]] = None
    weakFocus: Optional[str] = None
    goals: Optional[str] = None

    # Resolved fields computed in init
    effective_mode: str = "custom_range"
    effective_daily_hours: float = 2.0
    effective_subjects: list[str] = []

    model_config = {"populate_by_name": True}

    def __init__(self, **data):
        super().__init__(**data)
        self.effective_mode = self.mode or ("exam_prep" if (self.exam_date or self.examDate) else "custom_range")
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
