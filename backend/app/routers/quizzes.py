"""
Quiz endpoints: /api/v1/quizzes
"""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.core.dependencies import AdminUser, CurrentUser, DBSession
from app.models.quiz import Question, Quiz, QuizAttempt
from app.schemas.quiz import (
    AttemptResultResponse,
    QuizAttemptRequest,
    QuizCreate,
    QuizDetailResponse,
    QuizHistoryItem,
    QuizResponse,
)
from app.services.quiz_service import submit_quiz_attempt

router = APIRouter(prefix="/quizzes", tags=["quizzes"])


@router.get("/history", response_model=list[QuizHistoryItem])
async def get_quiz_history(current_user: CurrentUser, db: DBSession):
    result = await db.execute(
        select(QuizAttempt, Quiz.title.label("quiz_title"))
        .join(Quiz, Quiz.id == QuizAttempt.quiz_id)
        .where(QuizAttempt.user_id == current_user.id)
        .order_by(QuizAttempt.completed_at.desc())
        .limit(50)
    )
    rows = result.all()
    return [
        QuizHistoryItem(
            attempt_id=row.QuizAttempt.id,
            quiz_id=row.QuizAttempt.quiz_id,
            quiz_title=row.quiz_title,
            score=row.QuizAttempt.score,
            passed=row.QuizAttempt.passed,
            completed_at=row.QuizAttempt.completed_at,
        )
        for row in rows
    ]


@router.get("/", response_model=list[QuizResponse])
async def list_quizzes(
    db: DBSession,
    subject: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
):
    q = select(Quiz)
    if subject:
        q = q.where(Quiz.subject == subject)
    if difficulty:
        q = q.where(Quiz.difficulty == difficulty)
    result = await db.execute(q.order_by(Quiz.created_at.desc()))
    quizzes = result.scalars().all()
    items = []
    for quiz in quizzes:
        count_r = await db.execute(
            select(func.count(Question.id))
            .where(Question.quiz_id == quiz.id)
        )
        items.append(QuizResponse(
            **{c.key: getattr(quiz, c.key) for c in quiz.__table__.columns},
            question_count=int(count_r.scalar() or 0),
        ))
    return items


@router.post("/", response_model=QuizResponse, status_code=status.HTTP_201_CREATED)
async def create_quiz(payload: QuizCreate, current_user: AdminUser, db: DBSession):
    quiz_data = payload.model_dump(exclude={"questions"})
    quiz = Quiz(**quiz_data, created_by=current_user.id)
    db.add(quiz)
    await db.flush()

    for idx, q in enumerate(payload.questions):
        question = Question(
            quiz_id=quiz.id,
            text=q.text,
            options=[opt.model_dump() for opt in q.options],
            correct_answer=q.correct_answer,
            explanation=q.explanation,
            order_index=q.order_index if q.order_index else idx,
        )
        db.add(question)

    return QuizResponse(
        **{c.key: getattr(quiz, c.key) for c in quiz.__table__.columns},
        question_count=len(payload.questions),
    )


@router.get("/{quiz_id}", response_model=QuizDetailResponse)
async def get_quiz(quiz_id: UUID, db: DBSession):
    result = await db.execute(
        select(Quiz).where(Quiz.id == quiz_id).options(selectinload(Quiz.questions))
    )
    quiz = result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    from app.schemas.quiz import QuestionResponse, QuestionOption
    questions_out = [
        QuestionResponse(
            id=q.id,
            quiz_id=q.quiz_id,
            text=q.text,
            options=[QuestionOption(**opt) for opt in q.options],
            order_index=q.order_index,
        )
        for q in sorted(quiz.questions, key=lambda x: x.order_index)
    ]
    return QuizDetailResponse(
        **{c.key: getattr(quiz, c.key) for c in quiz.__table__.columns},
        question_count=len(quiz.questions),
        questions=questions_out,
    )


@router.post("/{quiz_id}/attempt", response_model=AttemptResultResponse)
async def attempt_quiz(
    quiz_id: UUID,
    payload: QuizAttemptRequest,
    current_user: CurrentUser,
    db: DBSession,
):
    return await submit_quiz_attempt(db, current_user, quiz_id, payload)


# Frontend-compatible alias: POST /quizzes/{quiz_id}/submit
@router.post("/{quiz_id}/submit", response_model=AttemptResultResponse)
async def submit_quiz(
    quiz_id: UUID,
    payload: QuizAttemptRequest,
    current_user: CurrentUser,
    db: DBSession,
):
    """Alias for /attempt — matches frontend quizApi.submitQuiz contract."""
    return await submit_quiz_attempt(db, current_user, quiz_id, payload)


@router.get("/{quiz_id}/result/{attempt_id}", response_model=AttemptResultResponse)
async def get_result(quiz_id: UUID, attempt_id: UUID, current_user: CurrentUser, db: DBSession):
    result = await db.execute(
        select(QuizAttempt).where(
            QuizAttempt.id == attempt_id,
            QuizAttempt.quiz_id == quiz_id,
            QuizAttempt.user_id == current_user.id,
        )
    )
    attempt = result.scalar_one_or_none()
    if not attempt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attempt not found")

    # Rebuild question results from stored answers
    quiz_r = await db.execute(
        select(Quiz).where(Quiz.id == quiz_id).options(selectinload(Quiz.questions))
    )
    quiz = quiz_r.scalar_one_or_none()
    question_results = []
    if quiz:
        for q in quiz.questions:
            user_ans = attempt.answers.get(str(q.id), "")
            question_results.append({
                "question_id": str(q.id),
                "correct": user_ans == q.correct_answer,
                "your_answer": user_ans,
                "correct_answer": q.correct_answer,
                "explanation": q.explanation,
            })

    return AttemptResultResponse(
        attempt_id=attempt.id,
        quiz_id=attempt.quiz_id,
        score=attempt.score,
        correct_count=attempt.correct_count,
        total_questions=attempt.total_questions,
        passed=attempt.passed,
        xp_earned=attempt.xp_earned,
        coins_earned=attempt.coins_earned,
        completed_at=attempt.completed_at,
        question_results=question_results,
    )
