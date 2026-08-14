"""
User request/response schemas.
"""

from datetime import datetime
from typing import Optional
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
    university: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[int] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    interests: Optional[str] = None
    learning_goals: Optional[str] = None
    preferred_study_time: Optional[str] = None
    difficulty_preference: Optional[str] = None


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
