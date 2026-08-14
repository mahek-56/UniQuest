"""
Course, Module, Lesson, and Enrollment schemas.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


# ── Course ──────────────────────────────────────────────────────────────────

class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    subject: str
    difficulty: str = "medium"
    thumbnail_url: Optional[str] = None


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    subject: Optional[str] = None
    difficulty: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_published: Optional[bool] = None


class CourseResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    subject: str
    difficulty: str
    thumbnail_url: Optional[str] = None
    is_published: bool
    created_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CourseDetailResponse(CourseResponse):
    module_count: int = 0
    lesson_count: int = 0
    enrolled_count: int = 0


class CourseProgressResponse(BaseModel):
    course_id: UUID
    total_lessons: int
    completed_lessons: int
    completion_percentage: float
    enrolled_at: datetime
    completed_at: Optional[datetime] = None


# ── Module ───────────────────────────────────────────────────────────────────

class ModuleCreate(BaseModel):
    course_id: UUID
    title: str
    description: Optional[str] = None
    order_index: int = 0


class ModuleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order_index: Optional[int] = None


class LessonSummary(BaseModel):
    id: UUID
    title: str
    duration_minutes: int
    order_index: int
    xp_reward: int

    model_config = {"from_attributes": True}


class ModuleResponse(BaseModel):
    id: UUID
    course_id: UUID
    title: str
    description: Optional[str] = None
    order_index: int
    created_at: datetime
    lessons: list[LessonSummary] = []

    model_config = {"from_attributes": True}


# ── Lesson ───────────────────────────────────────────────────────────────────

class LessonCreate(BaseModel):
    module_id: UUID
    title: str
    content: Optional[str] = None
    video_url: Optional[str] = None
    duration_minutes: int = 10
    order_index: int = 0
    xp_reward: int = 20


class LessonUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    video_url: Optional[str] = None
    duration_minutes: Optional[int] = None
    order_index: Optional[int] = None
    xp_reward: Optional[int] = None


class LessonResponse(BaseModel):
    id: UUID
    module_id: UUID
    title: str
    content: Optional[str] = None
    video_url: Optional[str] = None
    duration_minutes: int
    order_index: int
    xp_reward: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Enrollment ───────────────────────────────────────────────────────────────

class EnrollResponse(BaseModel):
    message: str
    course_id: UUID
    enrolled_at: datetime
