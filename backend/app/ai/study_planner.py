"""
AI Study Planner — generate a structured study plan using Gemini.
"""

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai import gemini_client
from app.ai.prompts import STUDY_PLAN_SYSTEM, STUDY_PLAN_USER
from app.core.logging import get_logger
from app.models.study_plan import StudyPlan
from app.schemas.ai import StudyPlanRequest, StudyPlanResponse

logger = get_logger(__name__)


async def generate_study_plan(
    db: AsyncSession,
    user_id: UUID,
    payload: StudyPlanRequest,
) -> StudyPlanResponse:
    prompt = STUDY_PLAN_USER.format(
        subjects=", ".join(payload.effective_subjects),
        exam_date=payload.exam_date or "not specified",
        daily_hours=payload.effective_daily_hours,
        goals=payload.goals or f"Target grade: {payload.targetGrade or 'A'}. General exam preparation.",
    )

    try:
        plan_data = await gemini_client.generate_json(
            prompt=prompt,
            system_instruction=STUDY_PLAN_SYSTEM,
        )
    except Exception as exc:
        logger.error("Study plan generation failed", error=str(exc))
        # Return a minimal fallback plan
        plan_data = {
            "summary": "AI plan unavailable. Please try again later.",
            "total_days": 0,
            "daily_sessions": [],
        }

    now = datetime.now(tz=timezone.utc)

    # Deactivate previous plans
    from sqlalchemy import update
    await db.execute(
        update(StudyPlan)
        .where(StudyPlan.user_id == user_id, StudyPlan.is_active == True)  # noqa: E712
        .values(is_active=False)
    )

    plan = StudyPlan(
        user_id=user_id,
        plan_data=plan_data,
        generated_at=now,
    )
    db.add(plan)
    await db.flush()

    return StudyPlanResponse(
        plan_id=plan.id,
        plan_data=plan_data,
        generated_at=plan.generated_at,
        expires_at=plan.expires_at,
    )
