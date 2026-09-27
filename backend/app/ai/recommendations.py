"""
AI-powered personalised recommendations.
Returns frontend-compatible RecommendationResponse objects.
Uses Gemini when available; generates data-driven heuristic recommendations when offline.
"""

from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai import gemini_client
from app.ai.prompts import RECOMMENDATION_SYSTEM, RECOMMENDATION_USER
from app.core.config import settings
from app.core.logging import get_logger
from app.models.course import Course, CourseEnrollment, Lesson
from app.models.progress import UserProgress
from app.models.quiz import Quiz, QuizAttempt
from app.models.recommendation import AIRecommendation
from app.models.revision import RevisionTopic
from app.models.user import User
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
        duration=content.get("duration", "15 mins"),
        xpPotential=content.get("xpPotential") or content.get("xp_potential", 30),
        difficulty=content.get("difficulty", "Medium"),
        badge=content.get("badge", "Recommended Action"),
        actionUrl=content.get("actionUrl") or content.get("action_url", "/courses"),
        actionLabel=content.get("actionLabel") or content.get("action_label", "Start Now"),
        content=content,
        ai_explanation=rec.ai_explanation,
        created_at=rec.created_at,
    )


async def generate_heuristic_recommendations(
    db: AsyncSession,
    user: User,
) -> list[dict[str, Any]]:
    """Generate telemetry-driven recommendations based on actual database metrics."""
    recs = []

    # 1. Check for due / weak revision topics
    rev_r = await db.execute(
        select(RevisionTopic)
        .where(RevisionTopic.user_id == user.id)
        .order_by(RevisionTopic.performance_score.asc())
        .limit(2)
    )
    weak_topics = rev_r.scalars().all()
    for wt in weak_topics:
        recs.append({
            "type": "revision",
            "badge": "Spaced Revision Priority",
            "title": f"Reinforce: {wt.topic}",
            "subject": wt.subject,
            "reason": f"Your recall accuracy in {wt.subject} ({wt.topic}) is below target. Active recall today reinforces retention.",
            "duration": "10 mins",
            "xpPotential": 25,
            "difficulty": wt.difficulty.capitalize() if wt.difficulty else "Medium",
            "actionUrl": "/revision",
            "actionLabel": "Start Spaced Recall",
        })

    # 2. Check for lowest scoring quiz subject
    quiz_sub_r = await db.execute(
        select(Quiz.subject, func.avg(QuizAttempt.score).label("avg_score"))
        .join(Quiz, Quiz.id == QuizAttempt.quiz_id)
        .where(QuizAttempt.user_id == user.id)
        .group_by(Quiz.subject)
        .order_by(func.avg(QuizAttempt.score).asc())
        .limit(1)
    )
    low_subject = quiz_sub_r.first()
    if low_subject and low_subject.avg_score < 75:
        recs.append({
            "type": "practice",
            "badge": "Accuracy Booster",
            "title": f"Mastery Quiz: {low_subject.subject}",
            "subject": low_subject.subject,
            "reason": f"Your average score in {low_subject.subject} is {round(low_subject.avg_score)}%. A targeted checkpoint quiz will strengthen your weak areas.",
            "duration": "15 mins",
            "xpPotential": 40,
            "difficulty": "Intermediate",
            "actionUrl": "/quizzes",
            "actionLabel": "Take Checkpoint Quiz",
        })

    # 3. Check for next incomplete lesson in enrolled courses
    enroll_r = await db.execute(
        select(CourseEnrollment.course_id).where(CourseEnrollment.user_id == user.id)
    )
    enrolled_cids = [r[0] for r in enroll_r.all()]

    if enrolled_cids:
        # Find next uncompleted lesson
        next_les_r = await db.execute(
            select(Lesson, Course.title.label("course_title"), Course.subject.label("course_subject"))
            .join(Course, Course.id == Lesson.course_id if hasattr(Lesson, "course_id") else True)
            .outerjoin(
                UserProgress,
                (UserProgress.lesson_id == Lesson.id) & (UserProgress.user_id == user.id),
            )
            .where(UserProgress.is_completed.is_(None) | (UserProgress.is_completed == False))  # noqa: E712
            .limit(1)
        )
        row = next_les_r.first()
        if row:
            les = row.Lesson
            recs.append({
                "type": "lesson",
                "badge": "Next Curriculum Unit",
                "title": f"Continue Lesson: {les.title}",
                "subject": getattr(row, "course_subject", "Core Curriculum"),
                "reason": "Keep your momentum going by progressing to the next syllabus module.",
                "duration": f"{les.duration_minutes} mins",
                "xpPotential": les.xp_reward,
                "difficulty": "Standard",
                "actionUrl": f"/lessons/{les.id}",
                "actionLabel": "Start Lesson",
            })

    # 4. Fallback core recommendations if student is new
    if len(recs) < 3:
        recs.append({
            "type": "lesson",
            "badge": "Recommended Foundation",
            "title": "Master Database Normalization & 3NF Invariants",
            "subject": "Database Management Systems",
            "reason": "Crucial high-yield university topic frequently tested in midterms and technical evaluations.",
            "duration": "20 mins",
            "xpPotential": 35,
            "difficulty": "Intermediate",
            "actionUrl": "/courses",
            "actionLabel": "Explore Course",
        })
        recs.append({
            "type": "practice",
            "badge": "Spaced Recall",
            "title": "Operating Systems: Process Synchronization & Deadlocks",
            "subject": "Operating Systems",
            "reason": "Solve critical section problems and Banker's algorithm invariants.",
            "duration": "15 mins",
            "xpPotential": 30,
            "difficulty": "Intermediate",
            "actionUrl": "/revision",
            "actionLabel": "Review Concepts",
        })

    return recs[:4]


async def get_recommendations(
    db: AsyncSession,
    user: User,
    performance_summary: str,
) -> list[RecommendationResponse]:
    raw_list = []
    if settings.GEMINI_API_KEY:
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

    # If Gemini returned no valid recommendations, use data-driven heuristic recommendations
    if not raw_list:
        raw_list = await generate_heuristic_recommendations(db, user)

    # Invalidate old recommendations for this user
    old_result = await db.execute(
        select(AIRecommendation).where(
            AIRecommendation.user_id == user.id,
            AIRecommendation.is_dismissed == False,  # noqa: E712
        )
    )
    for old_rec in old_result.scalars().all():
        old_rec.is_dismissed = True

    results = []
    for item in raw_list[:5]:
        rec = AIRecommendation(
            user_id=user.id,
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
