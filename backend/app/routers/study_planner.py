"""
Study planner endpoints: /api/v1/study-planner
(Thin wrapper — real logic lives in app/ai/study_planner.py)
"""

from fastapi import APIRouter, HTTPException, status

from app.ai import study_planner as ai_planner
from app.core.config import settings
from app.core.dependencies import CurrentUser, DBSession
from app.schemas.ai import StudyPlanRequest, StudyPlanResponse

router = APIRouter(prefix="/study-planner", tags=["study-planner"])


@router.post("/generate", response_model=StudyPlanResponse)
async def generate(payload: StudyPlanRequest, current_user: CurrentUser, db: DBSession):
    if not settings.GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI features are not configured",
        )
    return await ai_planner.generate_study_plan(db, current_user.id, payload)


@router.get("/current", response_model=StudyPlanResponse)
async def get_current(current_user: CurrentUser, db: DBSession):
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
