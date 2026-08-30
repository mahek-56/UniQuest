"""
Auth request/response schemas.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, field_validator


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    university: str | None = None
    department: str | None = None
    semester: int | None = None

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("full_name")
    @classmethod
    def full_name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Full name cannot be empty")
        return v.strip()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthUserPayload(BaseModel):
    """User data embedded in auth responses (what frontend expects)."""
    id: UUID
    email: str
    full_name: str
    university: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[int] = None
    avatar_url: Optional[str] = None
    role: str
    xp: int
    level: int
    coins: int
    onboarding_completed: bool = False
    daily_study_target_minutes: int = 30
    target_grade: Optional[str] = None
    interests: Optional[str] = None
    preferred_study_time: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Optional[AuthUserPayload] = None


class RefreshRequest(BaseModel):
    refresh_token: str


class AccessTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
