"""
Spaced-repetition revision scheduling (SM-2 algorithm variant).
"""

from datetime import date, datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.models.revision import RevisionTopic
from app.schemas.revision import RevisionCompleteResponse, RevisionTopicResponse
from app.services import gamification_service as gs
from app.models.user import User

logger = get_logger(__name__)

XP_PER_REVISION = 10


def _sm2_next(
    performance: float,      # 0.0 – 1.0
    interval: int,
    repetitions: int,
    ease_factor: float,
) -> tuple[int, int, float, date]:
    """
    SM-2 algorithm. Returns (new_interval, new_repetitions, new_ease_factor, next_date).
    performance: 0 = total failure, 1 = perfect recall
    """
    quality = int(performance * 5)   # map to 0–5 scale

    if quality < 3:
        new_repetitions = 0
        new_interval = 1
    else:
        if repetitions == 0:
            new_interval = 1
        elif repetitions == 1:
            new_interval = 6
        else:
            new_interval = round(interval * ease_factor)
        new_repetitions = repetitions + 1

    new_ease = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    new_ease = max(1.3, new_ease)

    next_date = date.today() + timedelta(days=new_interval)
    return new_interval, new_repetitions, new_ease, next_date


async def get_due_topics(
    db: AsyncSession,
    user_id: UUID,
) -> list[RevisionTopicResponse]:
    today = date.today()
    result = await db.execute(
        select(RevisionTopic).where(
            RevisionTopic.user_id == user_id,
            RevisionTopic.next_revision_date <= today,
        )
    )
    topics = result.scalars().all()
    return [RevisionTopicResponse.model_validate(t) for t in topics]


async def complete_revision(
    db: AsyncSession,
    user: User,
    topic_id: UUID,
    performance_score: float = 0.8,
) -> RevisionCompleteResponse:
    result = await db.execute(
        select(RevisionTopic).where(
            RevisionTopic.id == topic_id,
            RevisionTopic.user_id == user.id,
        )
    )
    topic = result.scalar_one_or_none()
    if not topic:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found")

    new_interval, new_reps, new_ease, next_date = _sm2_next(
        performance=performance_score,
        interval=topic.interval_days,
        repetitions=topic.repetitions,
        ease_factor=topic.ease_factor,
    )

    topic.performance_score = performance_score
    topic.interval_days = new_interval
    topic.repetitions = new_reps
    topic.ease_factor = new_ease
    topic.next_revision_date = next_date
    topic.last_revised_at = datetime.now(tz=timezone.utc)

    await gs.award_xp(db, user, XP_PER_REVISION, "revision_complete", f"Revised: {topic.topic}")

    return RevisionCompleteResponse(
        message="Revision recorded",
        next_revision_date=next_date,
        new_interval_days=new_interval,
        xp_earned=XP_PER_REVISION,
    )
