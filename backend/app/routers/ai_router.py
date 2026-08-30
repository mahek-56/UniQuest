"""
AI feature endpoints: /api/v1/ai
"""


from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.ai import tutor, study_planner, recommendations
from app.core.config import settings
from app.core.dependencies import CurrentUser, DBSession
from app.models.study_plan import StudyPlan
from app.schemas.ai import (
    ExplainAnswerRequest,
    ExplainAnswerResponse,
    RecommendationResponse,
    StudyPlanRequest,
    StudyPlanResponse,
    TutorRequest,
    TutorResponse,
)

router = APIRouter(prefix="/ai", tags=["ai"])


def _require_gemini():
    if not settings.GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI features are not configured (missing GEMINI_API_KEY)",
        )


# ── AI Tutor ──────────────────────────────────────────────────────────────────

@router.post("/tutor", response_model=TutorResponse)
async def ask_ai_tutor(payload: TutorRequest, current_user: CurrentUser):
    """
    AI Tutor endpoint.
    Frontend sends: { message, subject, history }
    """
    _require_gemini()
    return await tutor.ask_tutor(payload)


# ── Study Planner ─────────────────────────────────────────────────────────────

@router.post("/study-plan", response_model=StudyPlanResponse)
async def generate_plan(payload: StudyPlanRequest, current_user: CurrentUser, db: DBSession):
    _require_gemini()
    return await study_planner.generate_study_plan(db, current_user.id, payload)


@router.post("/study-planner", response_model=StudyPlanResponse)
async def generate_plan_alias(payload: StudyPlanRequest, current_user: CurrentUser, db: DBSession):
    """Frontend-compatible alias: POST /ai/study-planner"""
    _require_gemini()
    return await study_planner.generate_study_plan(db, current_user.id, payload)


@router.get("/study-plan/current", response_model=StudyPlanResponse)
async def get_current_plan(current_user: CurrentUser, db: DBSession):
    result = await db.execute(
        select(StudyPlan)
        .where(StudyPlan.user_id == current_user.id, StudyPlan.is_active == True)  # noqa: E712
        .order_by(StudyPlan.generated_at.desc())
        .limit(1)
    )
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active study plan")
    return StudyPlanResponse(
        plan_id=plan.id,
        plan_data=plan.plan_data,
        generated_at=plan.generated_at,
        expires_at=plan.expires_at,
    )


# ── Recommendations ───────────────────────────────────────────────────────────

@router.get("/recommendations", response_model=list[RecommendationResponse])
async def get_recommendations(current_user: CurrentUser, db: DBSession):
    """
    Return AI-generated personalized recommendations.
    Uses real user data; falls back to graceful error if Gemini unavailable.
    """
    cached = await recommendations.get_cached_recommendations(db, current_user.id)
    if cached:
        return cached

    if not settings.GEMINI_API_KEY:
        # Return empty list rather than 503 — frontend handles empty state gracefully
        return []

    # Build a rich performance summary from real user data
    from sqlalchemy import func
    from app.models.quiz import QuizAttempt
    from app.models.progress import UserProgress
    from app.models.gamification import Streak

    quiz_r = await db.execute(
        select(func.avg(QuizAttempt.score), func.count(QuizAttempt.id))
        .where(QuizAttempt.user_id == current_user.id)
    )
    quiz_row = quiz_r.one()
    avg_score = float(quiz_row[0] or 0)
    quiz_count = int(quiz_row[1] or 0)

    lessons_r = await db.execute(
        select(func.count(UserProgress.id)).where(
            UserProgress.user_id == current_user.id,
            UserProgress.is_completed == True,  # noqa: E712
        )
    )
    lessons_done = int(lessons_r.scalar() or 0)

    streak_r = await db.execute(select(Streak).where(Streak.user_id == current_user.id))
    streak = streak_r.scalar_one_or_none()
    streak_days = streak.current_streak if streak else 0

    summary = (
        f"Student: {current_user.full_name}. "
        f"University: {current_user.university or 'unknown'}. "
        f"Department: {current_user.department or 'unknown'}. "
        f"XP: {current_user.xp}, Level: {current_user.level}. "
        f"Quiz accuracy: {avg_score:.1f}% over {quiz_count} attempts. "
        f"Lessons completed: {lessons_done}. "
        f"Current streak: {streak_days} days. "
        f"Target grade: {current_user.target_grade or 'not set'}. "
        f"Interests: {current_user.interests or 'not specified'}."
    )

    return await recommendations.get_recommendations(db, current_user.id, summary)


# ── Wrong-answer explanation ──────────────────────────────────────────────────

@router.post("/explain-answer", response_model=ExplainAnswerResponse)
async def explain_answer(payload: ExplainAnswerRequest, current_user: CurrentUser):
    _require_gemini()

    from app.ai import gemini_client
    from app.ai.prompts import EXPLAIN_ANSWER_SYSTEM, EXPLAIN_ANSWER_USER

    # Resolve option texts
    options_map = {opt["key"]: opt["text"] for opt in payload.options}
    correct_text = options_map.get(payload.correct_answer, payload.correct_answer)
    user_text = options_map.get(payload.user_answer, payload.user_answer)

    options_text = "\n".join(f"{o['key']}) {o['text']}" for o in payload.options)
    prompt = EXPLAIN_ANSWER_USER.format(
        question_text=payload.question_text,
        options_text=options_text,
        correct_answer=payload.correct_answer,
        correct_answer_text=correct_text,
        user_answer=payload.user_answer,
        user_answer_text=user_text,
    )
    try:
        raw = await gemini_client.generate_text(
            prompt=prompt,
            system_instruction=EXPLAIN_ANSWER_SYSTEM,
            temperature=0.4,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI explanation failed: {exc}",
        )

    return ExplainAnswerResponse(
        explanation=raw.strip(),
        correct_answer_text=correct_text,
        why_wrong=raw.strip(),
    )
