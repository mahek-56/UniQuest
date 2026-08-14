"""
Feature extraction from PostgreSQL data for the ML performance model.
Returns a feature dict for a single user.
"""

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.gamification import Streak, XPHistory
from app.models.progress import StudySession, UserProgress
from app.models.quiz import QuizAttempt


async def extract_features(db: AsyncSession, user_id: UUID) -> dict:
    """
    Extract ML features for the given user.
    Returns a dict matching the model's expected input columns.
    """

    # Quiz accuracy and count
    qa_result = await db.execute(
        select(
            func.avg(QuizAttempt.score).label("avg_score"),
            func.count(QuizAttempt.id).label("attempt_count"),
        ).where(QuizAttempt.user_id == user_id)
    )
    qa_row = qa_result.one()
    quiz_accuracy = float(qa_row.avg_score or 0) / 100.0
    attempt_count = int(qa_row.attempt_count or 0)

    # Average study time per session (minutes)
    st_result = await db.execute(
        select(func.avg(StudySession.duration_seconds)).where(
            StudySession.user_id == user_id
        )
    )
    avg_duration_secs = float(st_result.scalar() or 0)
    avg_study_time_minutes = avg_duration_secs / 60.0

    # Lesson completion rate: completed / accessed
    lc_result = await db.execute(
        select(
            func.count(UserProgress.id).label("total"),
            func.sum(
                func.cast(UserProgress.is_completed, type_=__import__("sqlalchemy").Integer)
            ).label("completed"),
        ).where(UserProgress.user_id == user_id)
    )
    lc_row = lc_result.one()
    total_accessed = int(lc_row.total or 0)
    total_completed = int(lc_row.completed or 0)
    lesson_completion_rate = (
        total_completed / total_accessed if total_accessed > 0 else 0.0
    )

    # Streak days
    streak_result = await db.execute(
        select(Streak).where(Streak.user_id == user_id)
    )
    streak = streak_result.scalar_one_or_none()
    streak_days = streak.current_streak if streak else 0

    # Consistency score: proportion of last 14 days with any XP activity
    from datetime import datetime, timedelta, timezone
    two_weeks_ago = datetime.now(tz=timezone.utc) - timedelta(days=14)
    xp_result = await db.execute(
        select(func.count(func.distinct(func.date(XPHistory.created_at)))).where(
            XPHistory.user_id == user_id,
            XPHistory.created_at >= two_weeks_ago,
        )
    )
    active_days = int(xp_result.scalar() or 0)
    consistency_score = active_days / 14.0

    # Recent performance trend: avg score of last 5 attempts vs overall
    recent_result = await db.execute(
        select(QuizAttempt.score)
        .where(QuizAttempt.user_id == user_id)
        .order_by(QuizAttempt.completed_at.desc())
        .limit(5)
    )
    recent_scores = [row[0] for row in recent_result.all()]
    recent_avg = sum(recent_scores) / len(recent_scores) if recent_scores else 0
    overall_avg = float(qa_row.avg_score or 0)
    recent_performance_trend = (recent_avg - overall_avg) / 100.0  # normalised

    return {
        "quiz_accuracy": quiz_accuracy,
        "attempt_count": attempt_count,
        "avg_study_time_minutes": avg_study_time_minutes,
        "lesson_completion_rate": lesson_completion_rate,
        "streak_days": streak_days,
        "consistency_score": consistency_score,
        "recent_performance_trend": recent_performance_trend,
        "_data_points": attempt_count,  # used to check sufficiency
    }
