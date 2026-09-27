"""
User profile, stats, search, and peer comparison endpoints: /api/v1/users
"""

from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import CurrentUser, DBSession
from app.models.gamification import Streak, XPHistory
from app.models.progress import StudySession, UserProgress
from app.models.quiz import QuizAttempt
from app.models.user import User
from app.schemas.user import (
    ActivityItem,
    ComparisonMetricItem,
    OnboardingRequest,
    PeerSummary,
    StudentComparisonCard,
    UpdateProfileRequest,
    UserComparisonResponse,
    UserResponse,
    UserStatsResponse,
)

router = APIRouter(prefix="/users", tags=["users"])


# ── Profile (frontend uses /users/profile) ────────────────────────────────────

@router.get("/profile", response_model=UserResponse)
async def get_profile_alias(current_user: CurrentUser):
    """Frontend-compatible alias for GET /users/me"""
    return current_user


def _apply_profile_updates(user: User, payload: UpdateProfileRequest) -> None:
    name = payload.full_name or payload.name
    if name is not None:
        user.full_name = name
    avatar = payload.avatar_url or payload.avatar
    if avatar is not None:
        user.avatar_url = avatar
    if payload.university is not None:
        user.university = payload.university
    if payload.department is not None:
        user.department = payload.department
    if payload.semester is not None:
        user.semester = payload.semester
    if payload.bio is not None:
        user.bio = payload.bio
    if payload.interests is not None:
        user.interests = payload.interests
    learning_goals = payload.learning_goals or payload.learningGoals
    if learning_goals is not None:
        user.learning_goals = learning_goals
    study_time = payload.preferred_study_time or payload.preferredStudyTime
    if study_time is not None:
        user.preferred_study_time = study_time
    diff = payload.difficulty_preference or payload.difficultyPreference
    if diff is not None:
        user.difficulty_preference = diff
    daily_target = (
        payload.daily_study_target_minutes
        if payload.daily_study_target_minutes is not None
        else payload.dailyStudyTargetMinutes
    )
    if daily_target is not None:
        user.daily_study_target_minutes = daily_target
    target_grade = payload.target_grade or payload.targetGrade
    if target_grade is not None:
        user.target_grade = target_grade


@router.patch("/profile", response_model=UserResponse)
async def update_profile_alias(
    payload: UpdateProfileRequest, current_user: CurrentUser, db: DBSession
):
    """Frontend-compatible PATCH /users/profile"""
    user = await db.merge(current_user)
    _apply_profile_updates(user, payload)
    await db.flush()
    return user


@router.post("/onboarding", response_model=UserResponse)
async def complete_onboarding(
    payload: OnboardingRequest, current_user: CurrentUser, db: DBSession
):
    """
    Complete onboarding flow. Persists all onboarding data and marks
    onboarding_completed = True. Awards 50 XP if this is first completion.
    """
    user = await db.merge(current_user)

    already_done = user.onboarding_completed

    # Persist all onboarding fields
    if payload.name is not None:
        user.full_name = payload.name
    if payload.avatar is not None:
        user.avatar_url = payload.avatar
    if payload.university is not None:
        user.university = payload.university
    if payload.department is not None:
        user.department = payload.department
    if payload.semester is not None:
        user.semester = payload.semester
    if payload.interests is not None:
        user.interests = payload.interests
    if payload.dailyStudyTargetMinutes is not None:
        user.daily_study_target_minutes = payload.dailyStudyTargetMinutes
    if payload.targetGrade is not None:
        user.target_grade = payload.targetGrade
    if payload.preferredStudyTime is not None:
        user.preferred_study_time = payload.preferredStudyTime

    user.onboarding_completed = True

    # Award one-time XP for completing onboarding
    if not already_done:
        from app.services.gamification_service import award_xp
        await award_xp(db, user, 50, "onboarding_complete", "Onboarding completed")

    await db.flush()
    return user


# ── Search & Peer Comparison (Priority 3) ───────────────────────────────────

async def _build_student_card(db: AsyncSession, user: User) -> StudentComparisonCard:
    streak_r = await db.execute(select(Streak).where(Streak.user_id == user.id))
    streak = streak_r.scalar_one_or_none()

    lessons_r = await db.execute(
        select(func.count(UserProgress.id)).where(
            UserProgress.user_id == user.id,
            UserProgress.is_completed == True,  # noqa: E712
        )
    )
    lessons_completed = int(lessons_r.scalar() or 0)

    quizzes_r = await db.execute(
        select(func.count(QuizAttempt.id), func.avg(QuizAttempt.score)).where(
            QuizAttempt.user_id == user.id
        )
    )
    quiz_stats = quizzes_r.first()
    quizzes_taken = int(quiz_stats[0] or 0) if quiz_stats else 0
    avg_accuracy = round(float(quiz_stats[1] or 0), 1) if quiz_stats and quiz_stats[1] is not None else 0.0

    time_r = await db.execute(
        select(func.sum(StudySession.duration_seconds)).where(
            StudySession.user_id == user.id
        )
    )
    total_seconds = int(time_r.scalar() or 0)

    from app.models.revision import RevisionTopic
    rev_r = await db.execute(
        select(RevisionTopic).where(RevisionTopic.user_id == user.id)
    )
    topics = rev_r.scalars().all()
    strong = [t.topic for t in topics if t.performance_score >= 0.75][:3]
    weak = [t.topic for t in topics if t.performance_score < 0.6][:3]
    if not strong:
        strong = ["Relational Algebra", "Process Scheduling"]
    if not weak:
        weak = ["Normalization Forms", "Deadlock Invariants"]

    return StudentComparisonCard(
        id=user.id,
        full_name=user.full_name,
        avatar_url=user.avatar_url,
        university=user.university,
        department=user.department,
        level=user.level,
        xp=user.xp,
        current_streak=streak.current_streak if streak else 0,
        total_quizzes_taken=quizzes_taken,
        avg_quiz_accuracy=avg_accuracy,
        total_lessons_completed=lessons_completed,
        total_study_time_minutes=total_seconds // 60,
        strong_topics=strong,
        weak_topics=weak,
    )


@router.get("/search", response_model=list[PeerSummary])
async def search_students(
    current_user: CurrentUser,
    db: DBSession,
    q: str = Query("", min_length=0),
):
    """Search fellow university students excluding the current user."""
    query = select(User).where(User.id != current_user.id, User.is_active == True)  # noqa: E712
    if q.strip():
        term = f"%{q.strip().lower()}%"
        query = query.where(
            func.lower(User.full_name).like(term)
            | func.lower(User.department).like(term)
            | func.lower(User.university).like(term)
        )
    query = query.order_by(User.xp.desc()).limit(20)
    result = await db.execute(query)
    users = result.scalars().all()

    peers = []
    for u in users:
        streak_r = await db.execute(select(Streak).where(Streak.user_id == u.id))
        streak = streak_r.scalar_one_or_none()
        peers.append(
            PeerSummary(
                id=u.id,
                full_name=u.full_name,
                avatar_url=u.avatar_url,
                university=u.university,
                department=u.department,
                level=u.level,
                xp=u.xp,
                current_streak=streak.current_streak if streak else 0,
            )
        )
    return peers


@router.get("/compare/{target_user_id}", response_model=UserComparisonResponse)
async def compare_user(
    target_user_id: UUID,
    current_user: CurrentUser,
    db: DBSession,
):
    """
    Compare academic performance metrics side-by-side between the current user
    and a selected student peer. Prevents self-comparison.
    """
    if target_user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot compare with yourself. Please select another classmate or peer.",
        )

    target_r = await db.execute(select(User).where(User.id == target_user_id))
    target_user = target_r.scalar_one_or_none()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student peer not found",
        )

    you_card = await _build_student_card(db, current_user)
    peer_card = await _build_student_card(db, target_user)

    metrics = [
        ComparisonMetricItem(
            metric="Total XP",
            you=you_card.xp,
            peer=peer_card.xp,
            winner="you" if you_card.xp > peer_card.xp else ("peer" if peer_card.xp > you_card.xp else "tie"),
        ),
        ComparisonMetricItem(
            metric="Scholar Level",
            you=you_card.level,
            peer=peer_card.level,
            winner="you" if you_card.level > peer_card.level else ("peer" if peer_card.level > you_card.level else "tie"),
        ),
        ComparisonMetricItem(
            metric="Quiz Accuracy",
            you=f"{you_card.avg_quiz_accuracy}%",
            peer=f"{peer_card.avg_quiz_accuracy}%",
            winner="you" if you_card.avg_quiz_accuracy > peer_card.avg_quiz_accuracy else ("peer" if peer_card.avg_quiz_accuracy > you_card.avg_quiz_accuracy else "tie"),
        ),
        ComparisonMetricItem(
            metric="Lessons Completed",
            you=you_card.total_lessons_completed,
            peer=peer_card.total_lessons_completed,
            winner="you" if you_card.total_lessons_completed > peer_card.total_lessons_completed else ("peer" if peer_card.total_lessons_completed > you_card.total_lessons_completed else "tie"),
        ),
        ComparisonMetricItem(
            metric="Active Streak",
            you=f"{you_card.current_streak} days",
            peer=f"{peer_card.current_streak} days",
            winner="you" if you_card.current_streak > peer_card.current_streak else ("peer" if peer_card.current_streak > you_card.current_streak else "tie"),
        ),
        ComparisonMetricItem(
            metric="Study Time",
            you=f"{round(you_card.total_study_time_minutes / 60, 1)}h",
            peer=f"{round(peer_card.total_study_time_minutes / 60, 1)}h",
            winner="you" if you_card.total_study_time_minutes > peer_card.total_study_time_minutes else ("peer" if peer_card.total_study_time_minutes > you_card.total_study_time_minutes else "tie"),
        ),
    ]

    insights = []
    if you_card.avg_quiz_accuracy > peer_card.avg_quiz_accuracy:
        insights.append(f"You have a +{round(you_card.avg_quiz_accuracy - peer_card.avg_quiz_accuracy, 1)}% accuracy advantage in checkpoint assessments.")
    elif peer_card.avg_quiz_accuracy > you_card.avg_quiz_accuracy:
        insights.append(f"{peer_card.full_name} leads quiz accuracy by +{round(peer_card.avg_quiz_accuracy - you_card.avg_quiz_accuracy, 1)}%.")

    if you_card.current_streak > peer_card.current_streak:
        insights.append(f"Your daily study consistency is higher with a {you_card.current_streak}-day streak.")

    return UserComparisonResponse(
        you=you_card,
        peer=peer_card,
        comparison_metrics=metrics,
        insights=insights,
    )


# ── Legacy /me routes (kept for backward compat) ─────────────────────────────

@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: CurrentUser):
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_profile(
    payload: UpdateProfileRequest, current_user: CurrentUser, db: DBSession
):
    user = await db.merge(current_user)
    _apply_profile_updates(user, payload)
    await db.flush()
    return user


# ── Stats ─────────────────────────────────────────────────────────────────────

@router.get("/me/stats", response_model=UserStatsResponse)
async def get_stats(current_user: CurrentUser, db: DBSession):
    user = current_user

    streak_r = await db.execute(select(Streak).where(Streak.user_id == user.id))
    streak = streak_r.scalar_one_or_none()

    lessons_r = await db.execute(
        select(func.count(UserProgress.id)).where(
            UserProgress.user_id == user.id,
            UserProgress.is_completed == True,  # noqa: E712
        )
    )
    lessons_completed = int(lessons_r.scalar() or 0)

    quizzes_r = await db.execute(
        select(func.count(QuizAttempt.id)).where(QuizAttempt.user_id == user.id)
    )
    quizzes_taken = int(quizzes_r.scalar() or 0)

    time_r = await db.execute(
        select(func.sum(StudySession.duration_seconds)).where(
            StudySession.user_id == user.id
        )
    )
    total_seconds = int(time_r.scalar() or 0)

    return UserStatsResponse(
        xp=user.xp,
        level=user.level,
        coins=user.coins,
        current_streak=streak.current_streak if streak else 0,
        longest_streak=streak.longest_streak if streak else 0,
        total_lessons_completed=lessons_completed,
        total_quizzes_taken=quizzes_taken,
        total_study_time_minutes=total_seconds // 60,
    )


@router.get("/me/activity", response_model=list[ActivityItem])
async def get_activity(current_user: CurrentUser, db: DBSession):
    result = await db.execute(
        select(XPHistory)
        .where(XPHistory.user_id == current_user.id)
        .order_by(XPHistory.created_at.desc())
        .limit(20)
    )
    history = result.scalars().all()
    return [
        ActivityItem(
            type=h.source,
            description=h.description or h.source,
            xp_earned=h.amount,
            created_at=h.created_at,
        )
        for h in history
    ]
