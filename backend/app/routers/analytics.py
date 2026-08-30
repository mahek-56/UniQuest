"""
Analytics endpoints: /api/v1/analytics
"""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter
from sqlalchemy import func, select

from app.core.dependencies import CurrentUser, DBSession
from app.models.course import CourseEnrollment
from app.models.gamification import Streak, XPHistory
from app.models.progress import StudySession, UserProgress
from app.models.quiz import QuizAttempt, Quiz
from app.models.revision import RevisionTopic
from app.schemas.analytics import (
    AnalyticsOverview,
    MLPredictionResponse,
    ProgressPoint,
    SubjectPerformance,
    StudyTimeBreakdown,
    WeakTopic,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview", response_model=AnalyticsOverview)
async def get_overview(current_user: CurrentUser, db: DBSession):
    user = current_user

    lessons_r = await db.execute(
        select(func.count(UserProgress.id)).where(
            UserProgress.user_id == user.id, UserProgress.is_completed == True  # noqa: E712
        )
    )
    quizzes_r = await db.execute(
        select(func.count(QuizAttempt.id)).where(QuizAttempt.user_id == user.id)
    )
    avg_score_r = await db.execute(
        select(func.avg(QuizAttempt.score)).where(QuizAttempt.user_id == user.id)
    )
    time_r = await db.execute(
        select(func.sum(StudySession.duration_seconds)).where(StudySession.user_id == user.id)
    )
    streak_r = await db.execute(select(Streak).where(Streak.user_id == user.id))
    streak = streak_r.scalar_one_or_none()

    enrolled_r = await db.execute(
        select(func.count(CourseEnrollment.id)).where(CourseEnrollment.user_id == user.id)
    )
    completed_r = await db.execute(
        select(func.count(CourseEnrollment.id)).where(
            CourseEnrollment.user_id == user.id,
            CourseEnrollment.completed_at.isnot(None),
        )
    )

    return AnalyticsOverview(
        total_lessons_completed=int(lessons_r.scalar() or 0),
        total_quizzes_taken=int(quizzes_r.scalar() or 0),
        total_study_time_minutes=int((time_r.scalar() or 0)) // 60,
        avg_quiz_score=float(avg_score_r.scalar() or 0),
        current_streak=streak.current_streak if streak else 0,
        xp=user.xp,
        level=user.level,
        enrolled_courses=int(enrolled_r.scalar() or 0),
        completed_courses=int(completed_r.scalar() or 0),
    )


@router.get("/progress", response_model=list[ProgressPoint])
async def get_progress_timeline(current_user: CurrentUser, db: DBSession):
    thirty_days_ago = datetime.now(tz=timezone.utc) - timedelta(days=30)

    result = await db.execute(
        select(
            func.date(UserProgress.completed_at).label("date"),
            func.count(UserProgress.id).label("lessons_completed"),
        )
        .where(
            UserProgress.user_id == current_user.id,
            UserProgress.is_completed == True,  # noqa: E712
            UserProgress.completed_at >= thirty_days_ago,
        )
        .group_by(func.date(UserProgress.completed_at))
        .order_by(func.date(UserProgress.completed_at))
    )
    rows = result.all()

    # Also fetch XP per day
    xp_result = await db.execute(
        select(
            func.date(XPHistory.created_at).label("date"),
            func.sum(XPHistory.amount).label("xp"),
        )
        .where(
            XPHistory.user_id == current_user.id,
            XPHistory.created_at >= thirty_days_ago,
        )
        .group_by(func.date(XPHistory.created_at))
    )
    xp_map = {str(r.date): int(r.xp or 0) for r in xp_result.all()}

    return [
        ProgressPoint(
            date=str(row.date),
            lessons_completed=row.lessons_completed,
            xp_earned=xp_map.get(str(row.date), 0),
        )
        for row in rows
    ]


@router.get("/subjects", response_model=list[SubjectPerformance])
async def get_subject_performance(current_user: CurrentUser, db: DBSession):
    result = await db.execute(
        select(
            Quiz.subject,
            func.count(QuizAttempt.id).label("quizzes_taken"),
            func.avg(QuizAttempt.score).label("avg_score"),
            func.max(QuizAttempt.score).label("best_score"),
        )
        .join(Quiz, Quiz.id == QuizAttempt.quiz_id)
        .where(QuizAttempt.user_id == current_user.id, Quiz.subject.isnot(None))
        .group_by(Quiz.subject)
    )
    rows = result.all()
    return [
        SubjectPerformance(
            subject=row.subject,
            quizzes_taken=row.quizzes_taken,
            avg_score=float(row.avg_score or 0),
            best_score=float(row.best_score or 0),
        )
        for row in rows
    ]


@router.get("/weak-topics", response_model=list[WeakTopic])
async def get_weak_topics(current_user: CurrentUser, db: DBSession):
    result = await db.execute(
        select(RevisionTopic)
        .where(
            RevisionTopic.user_id == current_user.id,
            RevisionTopic.performance_score < 0.6,
        )
        .order_by(RevisionTopic.performance_score.asc())
        .limit(10)
    )
    topics = result.scalars().all()
    return [
        WeakTopic(
            topic=t.topic,
            subject=t.subject,
            performance_score=t.performance_score,
            next_revision_date=str(t.next_revision_date),
        )
        for t in topics
    ]


@router.get("/study-time", response_model=list[StudyTimeBreakdown])
async def get_study_time(current_user: CurrentUser, db: DBSession):
    thirty_days_ago = datetime.now(tz=timezone.utc) - timedelta(days=30)
    result = await db.execute(
        select(
            func.date(StudySession.started_at).label("date"),
            func.sum(StudySession.duration_seconds).label("total_seconds"),
        )
        .where(
            StudySession.user_id == current_user.id,
            StudySession.started_at >= thirty_days_ago,
        )
        .group_by(func.date(StudySession.started_at))
        .order_by(func.date(StudySession.started_at))
    )
    return [
        StudyTimeBreakdown(date=str(row.date), minutes=int((row.total_seconds or 0)) // 60)
        for row in result.all()
    ]


@router.get("/ml-prediction", response_model=MLPredictionResponse)
async def get_ml_prediction(current_user: CurrentUser, db: DBSession):
    """
    ML performance prediction endpoint.
    Frontend analyticsApi.getMLPrediction() calls GET /analytics/ml-prediction.
    Also aliased at GET /analytics/performance.
    """
    from datetime import datetime, timezone
    from app.ml.feature_engineering import extract_features
    from app.ml.performance_model import predict_performance

    features = await extract_features(db, current_user.id)
    label = predict_performance(features)

    if label == "insufficient_data":
        return MLPredictionResponse(
            prediction="insufficient_data",
            timestamp=datetime.now(tz=timezone.utc),
            message="Not enough activity data yet. Complete more quizzes and lessons to get a prediction.",
            key_factors=[],
        )

    # Build human-readable key factors
    key_factors = []
    if features.get("quiz_accuracy", 0) < 0.5:
        key_factors.append("Low quiz accuracy — focus on reviewing weak topics")
    elif features.get("quiz_accuracy", 0) >= 0.8:
        key_factors.append("Strong quiz performance")

    if features.get("streak_days", 0) >= 7:
        key_factors.append(f"Excellent consistency — {features['streak_days']}-day streak")
    elif features.get("streak_days", 0) == 0:
        key_factors.append("No active streak — daily study habit needed")

    if features.get("lesson_completion_rate", 0) < 0.4:
        key_factors.append("Low lesson completion rate — complete more lessons")
    elif features.get("lesson_completion_rate", 0) >= 0.7:
        key_factors.append("High lesson completion rate")

    if features.get("consistency_score", 0) < 0.3:
        key_factors.append("Inconsistent study schedule over the past 2 weeks")
    elif features.get("consistency_score", 0) >= 0.7:
        key_factors.append("Very consistent study schedule")

    if features.get("recent_performance_trend", 0) > 0.1:
        key_factors.append("Improving performance trend")
    elif features.get("recent_performance_trend", 0) < -0.1:
        key_factors.append("Declining performance trend — review recent mistakes")

    # Confidence: simple heuristic based on data quantity
    data_points = features.get("_data_points", 0)
    confidence = min(0.95, 0.5 + (data_points / 50) * 0.45)

    clean_features = {k: v for k, v in features.items() if not k.startswith("_")}

    return MLPredictionResponse(
        prediction=label,
        confidence=round(confidence, 2),
        key_factors=key_factors[:4],
        timestamp=datetime.now(tz=timezone.utc),
        features_used=clean_features,
    )


@router.get("/performance", response_model=MLPredictionResponse)
async def get_performance_prediction(current_user: CurrentUser, db: DBSession):
    """Alias: GET /analytics/performance → same as /analytics/ml-prediction."""
    return await get_ml_prediction(current_user, db)
