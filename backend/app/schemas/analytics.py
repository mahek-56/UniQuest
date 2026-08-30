"""
Analytics response schemas.
"""

from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel


class AnalyticsOverview(BaseModel):
    total_lessons_completed: int
    total_quizzes_taken: int
    total_study_time_minutes: int
    avg_quiz_score: float
    current_streak: int
    xp: int
    level: int
    enrolled_courses: int
    completed_courses: int


class ProgressPoint(BaseModel):
    date: str        # ISO date string
    lessons_completed: int
    xp_earned: int


class SubjectPerformance(BaseModel):
    subject: str
    quizzes_taken: int
    avg_score: float
    best_score: float


class WeakTopic(BaseModel):
    topic: str
    subject: str
    performance_score: float
    next_revision_date: str


class StudyTimeBreakdown(BaseModel):
    date: str
    minutes: int


class MLPredictionResponse(BaseModel):
    """
    ML performance prediction response.
    Frontend analyticsApi.getMLPrediction() expects this structure.
    """
    prediction: str                          # "at_risk" | "average" | "strong" | "insufficient_data"
    confidence: Optional[float] = None
    key_factors: list[str] = []
    timestamp: datetime
    features_used: Optional[dict[str, Any]] = None
    message: Optional[str] = None
