"""
Revision (spaced repetition) endpoints: /api/v1/revision
"""

from uuid import UUID

from fastapi import APIRouter

from app.ai.revision import complete_revision, get_due_topics
from app.core.dependencies import CurrentUser, DBSession
from app.schemas.revision import RevisionCompleteResponse, RevisionTopicResponse

router = APIRouter(prefix="/revision", tags=["revision"])


@router.get("/today", response_model=list[RevisionTopicResponse])
async def get_today_topics(current_user: CurrentUser, db: DBSession):
    return await get_due_topics(db, current_user.id)


@router.post("/{topic_id}/complete", response_model=RevisionCompleteResponse)
async def mark_revision_complete(
    topic_id: UUID,
    current_user: CurrentUser,
    db: DBSession,
    performance_score: float = 0.8,
):
    return await complete_revision(db, current_user, topic_id, performance_score)
