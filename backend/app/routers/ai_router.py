"""
AI feature endpoints: /api/v1/ai
"""

from fastapi import APIRouter, HTTPException, status

from app.ai import tutor, study_planner, recommendations
from app.core.config import settings
from app.core.dependencies import CurrentUser, DBSession
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


@router.post("/tutor", response_model=TutorResponse)
async def ask_ai_tutor(payload: TutorRequest, current_user: CurrentUser):
    _require_gemini()
    return await tutor.ask_tutor(payload)


@router.post("/study-plan", response_model=StudyPlanResponse)
async def generate_plan(payload: StudyPlanRequest, current_user: CurrentUser, db: DBSession):
    _require_gemini()
    return await study_planner.generate_study_plan(db, current_user.id, payload)


@router.get("/study-plan/current", response_model=StudyPlanResponse)
async def get_current_plan(current_user: CurrentUser, db: DBSession):
    from sqlalchemy import select
    from app.models.study_plan import StudyPlan

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


@router.get("/recommendations", response_model=list[RecommendationResponse])
async def get_recommendations(current_user: CurrentUser, db: DBSession):
    cached = await recommendations.get_cached_recommendations(db, current_user.id)
    if cached:
        return cached

    _require_gemini()
    # Build performance summary from user stats
    summary = (
        f"XP: {current_user.xp}, Level: {current_user.level}, "
        f"University: {current_user.university or 'unknown'}, "
        f"Department: {current_user.department or 'unknown'}"
    )
    return await recommendations.get_recommendations(db, current_user.id, summary)


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
