"""
Gamification engine: XP, levels, coins, streaks, quests, achievements.
All XP/coin mutations go through this service to maintain consistency.
"""

from datetime import date, datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.models.gamification import (
    Achievement,
    CoinTransaction,
    Quest,
    Streak,
    UserAchievement,
    UserQuest,
    XPHistory,
)
from app.models.user import User

logger = get_logger(__name__)

# ── Level thresholds ─────────────────────────────────────────────────────────

LEVEL_THRESHOLDS: list[tuple[int, int, str]] = [
    (1, 0, "Beginner"),
    (5, 500, "Explorer"),
    (10, 1500, "Learner"),
    (15, 3000, "Student"),
    (20, 5000, "Scholar"),
    (25, 8000, "Advanced"),
    (30, 12000, "Expert"),
    (40, 20000, "Master"),
    (50, 35000, "Legend"),
]

# XP per action
XP_VALUES = {
    "daily_login": 10,
    "lesson_complete": 20,
    "quiz_complete": 30,
    "quiz_bonus_80": 20,
    "quiz_bonus_90": 40,
    "quest_complete": 25,
    "study_session_30min": 15,
    "streak_7day": 50,
}

COIN_VALUES = {
    "quiz_complete": 10,
    "quiz_high_score": 20,   # ≥ 80%
    "daily_login": 5,
}


def calculate_level(xp: int) -> tuple[int, str]:
    """Return (level, title) for the given total XP."""
    level, title = 1, "Beginner"
    for lvl, threshold, name in LEVEL_THRESHOLDS:
        if xp >= threshold:
            level, title = lvl, name
        else:
            break
    return level, title


def get_level_info(xp: int) -> dict:
    level, title = calculate_level(xp)
    # Find next threshold
    next_xp = None
    for lvl, threshold, _ in LEVEL_THRESHOLDS:
        if lvl > level:
            next_xp = threshold
            break
    # XP start of current level
    current_level_xp = 0
    for lvl, threshold, _ in LEVEL_THRESHOLDS:
        if lvl == level:
            current_level_xp = threshold
            break
    xp_progress = xp - current_level_xp
    xp_for_next = (next_xp - current_level_xp) if next_xp else 0

    return {
        "level": level,
        "title": title,
        "current_xp": xp,
        "xp_for_next_level": next_xp or xp,
        "xp_progress": xp_progress,
        "xp_to_next": xp_for_next,
    }


async def award_xp(
    db: AsyncSession,
    user: User,
    amount: int,
    source: str,
    description: Optional[str] = None,
) -> int:
    """Award XP to user, update level, log history. Returns new XP total."""
    user.xp += amount
    new_level, _ = calculate_level(user.xp)
    user.level = new_level

    history = XPHistory(
        user_id=user.id,
        amount=amount,
        source=source,
        description=description,
        created_at=datetime.now(tz=timezone.utc),
    )
    db.add(history)
    logger.info("XP awarded", user_id=str(user.id), amount=amount, source=source)
    return user.xp


async def award_coins(
    db: AsyncSession,
    user: User,
    amount: int,
    transaction_type: str,
    description: Optional[str] = None,
) -> int:
    """Award coins to user. Returns new coin balance."""
    user.coins += amount
    tx = CoinTransaction(
        user_id=user.id,
        amount=amount,
        transaction_type=transaction_type,
        description=description,
        created_at=datetime.now(tz=timezone.utc),
    )
    db.add(tx)
    return user.coins


async def deduct_coins(
    db: AsyncSession,
    user: User,
    amount: int,
    description: Optional[str] = None,
) -> int:
    """Deduct coins from user (for reward redemption). Returns new balance."""
    if user.coins < amount:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient coins",
        )
    user.coins -= amount
    tx = CoinTransaction(
        user_id=user.id,
        amount=-amount,
        transaction_type="redeem",
        description=description,
        created_at=datetime.now(tz=timezone.utc),
    )
    db.add(tx)
    return user.coins


async def update_streak(db: AsyncSession, user: User) -> tuple[int, bool]:
    """
    Update the user's daily streak.
    Returns (current_streak, milestone_reached).
    """
    result = await db.execute(select(Streak).where(Streak.user_id == user.id))
    streak = result.scalar_one_or_none()
    if not streak:
        streak = Streak(user_id=user.id)
        db.add(streak)

    today = date.today()
    milestone = False

    if streak.last_active_date is None:
        streak.current_streak = 1
    elif streak.last_active_date == today:
        pass  # Already counted today
    elif (today - streak.last_active_date).days == 1:
        streak.current_streak += 1
        if streak.current_streak > streak.longest_streak:
            streak.longest_streak = streak.current_streak
        if streak.current_streak % 7 == 0:
            milestone = True
    else:
        streak.current_streak = 1  # Streak broken

    streak.last_active_date = today
    return streak.current_streak, milestone


async def advance_quests(
    db: AsyncSession,
    user_id: UUID,
    quest_type: str,
    increment: int = 1,
) -> list[UserQuest]:
    """Advance progress on all active quests of the given type. Returns completed quests."""
    today = date.today()
    result = await db.execute(
        select(UserQuest).where(
            UserQuest.user_id == user_id,
            UserQuest.assigned_date == today,
            UserQuest.completed == False,  # noqa: E712
        )
    )
    user_quests = result.scalars().all()

    completed = []
    for uq in user_quests:
        quest_result = await db.execute(select(Quest).where(Quest.id == uq.quest_id))
        quest = quest_result.scalar_one_or_none()
        if quest and quest.quest_type == quest_type:
            uq.progress = min(uq.progress + increment, quest.target_value)
            if uq.progress >= quest.target_value:
                uq.completed = True
                uq.completed_at = datetime.now(tz=timezone.utc)
                completed.append(uq)
    return completed


async def assign_daily_quests(db: AsyncSession, user_id: UUID) -> None:
    """Assign today's daily quests to the user if not already assigned."""
    today = date.today()
    result = await db.execute(
        select(UserQuest).where(
            UserQuest.user_id == user_id,
            UserQuest.assigned_date == today,
        )
    )
    existing = result.scalars().all()
    if existing:
        return  # Already assigned

    quests_result = await db.execute(
        select(Quest).where(Quest.is_daily == True, Quest.is_active == True)  # noqa: E712
    )
    quests = quests_result.scalars().all()
    for quest in quests:
        db.add(UserQuest(
            user_id=user_id,
            quest_id=quest.id,
            assigned_date=today,
        ))


async def check_and_unlock_achievements(
    db: AsyncSession,
    user: User,
) -> list[Achievement]:
    """Check all achievement conditions and unlock any new ones. Returns newly unlocked list."""
    # Get already-unlocked achievement IDs
    result = await db.execute(
        select(UserAchievement.achievement_id).where(UserAchievement.user_id == user.id)
    )
    unlocked_ids = {row[0] for row in result.all()}

    all_result = await db.execute(select(Achievement))
    all_achievements = all_result.scalars().all()

    newly_unlocked = []
    for ach in all_achievements:
        if ach.id in unlocked_ids:
            continue
        if await _check_achievement_condition(db, user, ach.key):
            db.add(UserAchievement(
                user_id=user.id,
                achievement_id=ach.id,
                unlocked_at=datetime.now(tz=timezone.utc),
            ))
            newly_unlocked.append(ach)
            logger.info(
                "Achievement unlocked",
                user_id=str(user.id),
                achievement=ach.key,
            )
    return newly_unlocked


async def _check_achievement_condition(
    db: AsyncSession,
    user: User,
    key: str,
) -> bool:
    """Return True if the user meets the condition for the given achievement key."""
    from sqlalchemy import func
    from app.models.progress import UserProgress
    from app.models.quiz import QuizAttempt
    from app.models.gamification import Streak

    if key == "first_lesson":
        r = await db.execute(
            select(func.count()).select_from(UserProgress).where(
                UserProgress.user_id == user.id, UserProgress.is_completed == True  # noqa: E712
            )
        )
        return r.scalar() >= 1

    if key == "first_quiz":
        r = await db.execute(
            select(func.count()).select_from(QuizAttempt).where(QuizAttempt.user_id == user.id)
        )
        return r.scalar() >= 1

    if key == "streak_7":
        r = await db.execute(select(Streak).where(Streak.user_id == user.id))
        streak = r.scalar_one_or_none()
        return streak is not None and streak.current_streak >= 7

    if key == "level_10":
        return user.level >= 10

    if key == "xp_1000":
        return user.xp >= 1000

    if key == "perfect_quiz":
        r = await db.execute(
            select(func.count()).select_from(QuizAttempt).where(
                QuizAttempt.user_id == user.id, QuizAttempt.score == 100.0
            )
        )
        return r.scalar() >= 1

    return False
