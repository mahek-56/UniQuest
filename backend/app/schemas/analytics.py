"""
Analytics response schemas.
"""

from typing import Optional
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
