"""
AI-powered personalised recommendations.
Returns frontend-compatible RecommendationResponse objects.
Frontend expects: { id, type, subject, title, reason, duration, xpPotential,
                    difficulty, badge, actionUrl, actionLabel }
"""

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai import gemini_client
from app.ai.prompts import RECOMMENDATION_SYSTEM, RECOMMENDATION_USER
from app.core.logging import get_logger
from app.models.recommendation import AIRecommendation
from app.schemas.ai import RecommendationResponse

logger = get_logger(__name__)


def _to_response(rec: AIRecommendation) -> RecommendationResponse:
    """Convert ORM model → frontend-compatible response."""
    content = rec.content or {}
    return RecommendationResponse(
        id=rec.id,
        type=content.get("type", rec.recommendation_type),
        recommendation_type=rec.recommendation_type,
        subject=content.get("subject"),
        title=content.get("title"),
        reason=content.get("reason") or rec.ai_explanation,
        duration=content.get("duration"),
        xpPotential=content.get("xpPotential") or content.get("xp_potential"),
        difficulty=content.get("difficulty"),
        badge=content.get("badge"),
        actionUrl=content.get("actionUrl") or content.get("action_url"),
        actionLabel=content.get("actionLabel") or content.get("action_label"),
        content=content,
        ai_explanation=rec.ai_explanation,
        created_at=rec.created_at,
    )


async def get_recommendations(
    db: AsyncSession,
    user_id: UUID,
    performance_summary: str,
) -> list[RecommendationResponse]:
    prompt = RECOMMENDATION_USER.format(performance_summary=performance_summary)

    try:
        raw_list = await gemini_client.generate_json(
            prompt=prompt,
            system_instruction=RECOMMENDATION_SYSTEM,
        )
        if not isinstance(raw_list, list):
            raw_list = []
    except Exception as exc:
        logger.error("Recommendations AI call failed", error=str(exc))
        raw_list = []

    # Invalidate old recommendations for this user
    old_result = await db.execute(
        select(AIRecommendation).where(
            AIRecommendation.user_id == user_id,
            AIRecommendation.is_dismissed == False,  # noqa: E712
        )
    )
    for old_rec in old_result.scalars().all():
        old_rec.is_dismissed = True

    results = []
    for item in raw_list[:5]:
        rec = AIRecommendation(
            user_id=user_id,
            recommendation_type=item.get("type", "general"),
            content=item,
            ai_explanation=item.get("reason"),
            is_dismissed=False,
            created_at=datetime.now(tz=timezone.utc),
        )
        db.add(rec)
        await db.flush()
        results.append(_to_response(rec))

    return results


async def get_cached_recommendations(
    db: AsyncSession,
    user_id: UUID,
    limit: int = 5,
) -> list[RecommendationResponse]:
    """Return recent non-dismissed recommendations, or empty list if none."""
    result = await db.execute(
        select(AIRecommendation)
        .where(
            AIRecommendation.user_id == user_id,
            AIRecommendation.is_dismissed == False,  # noqa: E712
        )
        .order_by(AIRecommendation.created_at.desc())
        .limit(limit)
    )
    recs = result.scalars().all()
    return [_to_response(r) for r in recs]
