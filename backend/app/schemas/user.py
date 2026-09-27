"""
User request/response schemas.
"""

from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    university: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[int] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    interests: Optional[str] = None
    learning_goals: Optional[str] = None
    preferred_study_time: Optional[str] = None
    difficulty_preference: Optional[str] = None
    onboarding_completed: bool = False
    daily_study_target_minutes: int = 30
    target_grade: Optional[str] = None


class UserResponse(UserBase):
    id: UUID
    role: str
    xp: int
    level: int
    coins: int
    is_active: bool
    is_verified: bool
    last_login: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    name: Optional[str] = None
    university: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[int] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    avatar: Optional[str] = None
    interests: Optional[str] = None
    learning_goals: Optional[str] = None
    learningGoals: Optional[str] = None
    preferred_study_time: Optional[str] = None
    preferredStudyTime: Optional[str] = None
    difficulty_preference: Optional[str] = None
    difficultyPreference: Optional[str] = None
    daily_study_target_minutes: Optional[int] = None
    dailyStudyTargetMinutes: Optional[int] = None
    target_grade: Optional[str] = None
    targetGrade: Optional[str] = None


class OnboardingRequest(BaseModel):
    """Payload sent by frontend onboarding flow."""
    name: Optional[str] = None
    avatar: Optional[str] = None
    university: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[int] = None
    interests: Optional[str] = None          # comma-separated or JSON string
    dailyStudyTargetMinutes: Optional[int] = None
    targetGrade: Optional[str] = None
    preferredStudyTime: Optional[str] = None
    onboardingCompleted: Optional[bool] = True  # Frontend sends this field


class UserStatsResponse(BaseModel):
    xp: int
    level: int
    coins: int
    current_streak: int
    longest_streak: int
    total_lessons_completed: int
    total_quizzes_taken: int
    total_study_time_minutes: int


class ActivityItem(BaseModel):
    type: str
    description: str
    xp_earned: Optional[int] = None
    created_at: datetime


class PeerSummary(BaseModel):
    id: UUID
    full_name: str
    avatar_url: Optional[str] = None
    university: Optional[str] = None
    department: Optional[str] = None
    level: int = 1
    xp: int = 0
    current_streak: int = 0


class StudentComparisonCard(BaseModel):
    id: UUID
    full_name: str
    avatar_url: Optional[str] = None
    university: Optional[str] = None
    department: Optional[str] = None
    level: int
    xp: int
    current_streak: int
    total_quizzes_taken: int
    avg_quiz_accuracy: float
    total_lessons_completed: int
    total_study_time_minutes: int
    strong_topics: list[str] = []
    weak_topics: list[str] = []


class ComparisonMetricItem(BaseModel):
    metric: str
    you: Any
    peer: Any
    winner: str  # "you" | "peer" | "tie"


class UserComparisonResponse(BaseModel):
    you: StudentComparisonCard
    peer: StudentComparisonCard
    comparison_metrics: list[ComparisonMetricItem]
    insights: list[str] = []
