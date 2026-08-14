"""
AI-powered personalised recommendations.
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

    results = []
    for item in raw_list[:3]:
        rec = AIRecommendation(
            user_id=user_id,
            recommendation_type=item.get("type", "general"),
            content=item,
            ai_explanation=item.get("reason"),
            created_at=datetime.now(tz=timezone.utc),
        )
        db.add(rec)
        await db.flush()
        results.append(RecommendationResponse(
            id=rec.id,
            recommendation_type=rec.recommendation_type,
            content=rec.content,
            ai_explanation=rec.ai_explanation,
            created_at=rec.created_at,
        ))

    return results


async def get_cached_recommendations(
    db: AsyncSession,
    user_id: UUID,
    limit: int = 5,
) -> list[RecommendationResponse]:
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
    return [
        RecommendationResponse(
            id=r.id,
            recommendation_type=r.recommendation_type,
            content=r.content,
            ai_explanation=r.ai_explanation,
            created_at=r.created_at,
        )
        for r in recs
    ]
