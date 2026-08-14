"""
Quiz, Question, and QuizAttempt schemas.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, field_validator


# ── Question ─────────────────────────────────────────────────────────────────

class QuestionOption(BaseModel):
    key: str          # e.g. "a", "b", "c", "d"
    text: str


class QuestionCreate(BaseModel):
    text: str
    options: list[QuestionOption]
    correct_answer: str
    explanation: Optional[str] = None
    order_index: int = 0

    @field_validator("options")
    @classmethod
    def at_least_two_options(cls, v: list) -> list:
        if len(v) < 2:
            raise ValueError("Each question must have at least 2 options")
        return v


class QuestionResponse(BaseModel):
    id: UUID
    quiz_id: UUID
    text: str
    options: list[QuestionOption]
    order_index: int
    # correct_answer and explanation are intentionally omitted from list views
    # and only included in attempt results

    model_config = {"from_attributes": True}


class QuestionWithAnswerResponse(QuestionResponse):
    correct_answer: str
    explanation: Optional[str] = None


# ── Quiz ─────────────────────────────────────────────────────────────────────

class QuizCreate(BaseModel):
    title: str
    description: Optional[str] = None
    subject: Optional[str] = None
    difficulty: str = "medium"
    time_limit_minutes: Optional[int] = None
    pass_score: float = 60.0
    module_id: Optional[UUID] = None
    lesson_id: Optional[UUID] = None
    questions: list[QuestionCreate] = []


class QuizResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    subject: Optional[str] = None
    difficulty: str
    time_limit_minutes: Optional[int] = None
    pass_score: float
    module_id: Optional[UUID] = None
    lesson_id: Optional[UUID] = None
    question_count: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}


class QuizDetailResponse(QuizResponse):
    questions: list[QuestionResponse] = []


# ── Attempt ───────────────────────────────────────────────────────────────────

class QuizAttemptRequest(BaseModel):
    answers: dict[str, str]    # {question_id: chosen_key}
    time_taken_seconds: Optional[int] = None


class AttemptResultResponse(BaseModel):
    attempt_id: UUID
    quiz_id: UUID
    score: float
    correct_count: int
    total_questions: int
    passed: bool
    xp_earned: int
    coins_earned: int
    completed_at: datetime
    question_results: list[dict]   # [{question_id, correct, your_answer, correct_answer, explanation}]


class QuizHistoryItem(BaseModel):
    attempt_id: UUID
    quiz_id: UUID
    quiz_title: str
    score: float
    passed: bool
    completed_at: datetime

    model_config = {"from_attributes": True}
