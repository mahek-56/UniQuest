"""
Lesson start / complete logic with XP rewards and study session tracking.
"""

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.models.course import Lesson
from app.models.progress import StudySession, UserProgress
from app.models.user import User
from app.services import gamification_service as gs
from fastapi import HTTPException, status

logger = get_logger(__name__)


async def start_lesson(
    db: AsyncSession,
    user: User,
    lesson_id: UUID,
) -> StudySession:
    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    session = StudySession(
        user_id=user.id,
        lesson_id=lesson_id,
        started_at=datetime.now(tz=timezone.utc),
    )
    db.add(session)
    await db.flush()

    # Update or create progress row
    progress_result = await db.execute(
        select(UserProgress).where(
            UserProgress.user_id == user.id,
            UserProgress.lesson_id == lesson_id,
        )
    )
    progress = progress_result.scalar_one_or_none()
    if not progress:
        progress = UserProgress(
            user_id=user.id,
            lesson_id=lesson_id,
            last_accessed=datetime.now(tz=timezone.utc),
        )
        db.add(progress)
    else:
        progress.last_accessed = datetime.now(tz=timezone.utc)

    return session


async def complete_lesson(
    db: AsyncSession,
    user: User,
    lesson_id: UUID,
    session_id: UUID,
) -> dict:
    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    # Mark progress
    progress_result = await db.execute(
        select(UserProgress).where(
            UserProgress.user_id == user.id,
            UserProgress.lesson_id == lesson_id,
        )
    )
    progress = progress_result.scalar_one_or_none()
    already_completed = progress and progress.is_completed

    if not progress:
        progress = UserProgress(user_id=user.id, lesson_id=lesson_id)
        db.add(progress)

    now = datetime.now(tz=timezone.utc)
    progress.is_completed = True
    progress.completed_at = now
    progress.last_accessed = now

    xp_earned = 0
    if not already_completed:
        xp_earned = lesson.xp_reward
        await gs.award_xp(db, user, xp_earned, "lesson_complete", f"Lesson: {lesson.title}")

        # Update streak
        _, milestone = await gs.update_streak(db, user)
        if milestone:
            await gs.award_xp(db, user, gs.XP_VALUES["streak_7day"], "streak_7day")

        # Advance quests
        completed_quests = await gs.advance_quests(db, user.id, "lesson_complete")
        for uq in completed_quests:
            from sqlalchemy import select as _select
            from app.models.gamification import Quest
            qr = await db.execute(_select(Quest).where(Quest.id == uq.quest_id))
            quest = qr.scalar_one_or_none()
            if quest:
                await gs.award_xp(db, user, quest.xp_reward, "quest_complete", quest.title)
                await gs.award_coins(db, user, quest.coin_reward, "quest_complete", quest.title)

        await gs.check_and_unlock_achievements(db, user)

    # Close study session
    session_result = await db.execute(
        select(StudySession).where(
            StudySession.id == session_id,
            StudySession.user_id == user.id,
        )
    )
    session = session_result.scalar_one_or_none()
    if session:
        session.ended_at = now
        session.duration_seconds = int((now - session.started_at).total_seconds())
        session.xp_earned = xp_earned

        # Bonus XP for long sessions
        if session.duration_seconds >= 1800:  # 30 minutes
            bonus = gs.XP_VALUES["study_session_30min"]
            await gs.award_xp(db, user, bonus, "study_session_30min")
            xp_earned += bonus

        progress.time_spent_seconds += session.duration_seconds

    logger.info(
        "Lesson completed",
        user_id=str(user.id),
        lesson_id=str(lesson_id),
        xp_earned=xp_earned,
    )
    return {
        "message": "Lesson completed",
        "xp_earned": xp_earned,
        "already_completed": already_completed,
    }
