"""
Revision (spaced repetition) endpoints: /api/v1/revision
Supports both /today (legacy) and /due (frontend contract).
"""

from uuid import UUID

from fastapi import APIRouter

from app.ai.revision import complete_revision, get_due_topics
from app.core.dependencies import CurrentUser, DBSession
from app.schemas.revision import RevisionCompleteResponse, RevisionReviewRequest, RevisionTopicResponse

router = APIRouter(prefix="/revision", tags=["revision"])

# Rating → performance_score mapping (matches frontend SM-2 ratings)
RATING_SCORE_MAP = {
    "again": 0.0,
    "hard": 0.3,
    "good": 0.7,
    "easy": 1.0,
}


@router.get("/due", response_model=list[RevisionTopicResponse])
async def get_due_topics_route(current_user: CurrentUser, db: DBSession):
    """Frontend-compatible: GET /revision/due"""
    return await get_due_topics(db, current_user.id)


@router.get("/today", response_model=list[RevisionTopicResponse])
async def get_today_topics(current_user: CurrentUser, db: DBSession):
    """Legacy alias: GET /revision/today"""
    return await get_due_topics(db, current_user.id)


@router.post("/{topic_id}/review", response_model=RevisionCompleteResponse)
async def review_topic(
    topic_id: UUID,
    payload: RevisionReviewRequest,
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Frontend-compatible: POST /revision/{topic_id}/review
    Accepts {"rating": "again"|"hard"|"good"|"easy"} and maps to SM-2 performance score.
    """
    performance_score = RATING_SCORE_MAP.get(payload.rating, 0.7)
    return await complete_revision(db, current_user, topic_id, performance_score)


@router.post("/{topic_id}/complete", response_model=RevisionCompleteResponse)
async def mark_revision_complete(
    topic_id: UUID,
    current_user: CurrentUser,
    db: DBSession,
    performance_score: float = 0.8,
):
    """Legacy endpoint: POST /revision/{id}/complete?performance_score=0.8"""
    return await complete_revision(db, current_user, topic_id, performance_score)
