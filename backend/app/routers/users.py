"""
User profile and stats endpoints: /api/v1/users
Supports both /users/me (legacy) and /users/profile (frontend contract).
"""


from fastapi import APIRouter
from sqlalchemy import func, select

from app.core.dependencies import CurrentUser, DBSession
from app.models.gamification import Streak, XPHistory
from app.models.progress import StudySession, UserProgress
from app.models.quiz import QuizAttempt
from app.schemas.user import (
    ActivityItem,
    OnboardingRequest,
    UpdateProfileRequest,
    UserResponse,
    UserStatsResponse,
)

router = APIRouter(prefix="/users", tags=["users"])


# ── Profile (frontend uses /users/profile) ────────────────────────────────────

@router.get("/profile", response_model=UserResponse)
async def get_profile_alias(current_user: CurrentUser):
    """Frontend-compatible alias for GET /users/me"""
    return current_user


@router.patch("/profile", response_model=UserResponse)
async def update_profile_alias(
    payload: UpdateProfileRequest, current_user: CurrentUser, db: DBSession
):
    """Frontend-compatible PATCH /users/profile"""
    user = await db.merge(current_user)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(user, field, value)
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


# ── Legacy /me routes (kept for backward compat) ─────────────────────────────

@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: CurrentUser):
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_profile(
    payload: UpdateProfileRequest, current_user: CurrentUser, db: DBSession
):
    user = await db.merge(current_user)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(user, field, value)
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
