"""
Notification creation service.
All other services/routers should use this to create notifications
rather than constructing Notification objects directly.
"""

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification


async def create_notification(
    db: AsyncSession,
    user_id: UUID,
    notification_type: str,
    title: str,
    message: str,
    link: Optional[str] = None,
) -> Notification:
    """Create and persist a notification for a user."""
    notification = Notification(
        user_id=user_id,
        notification_type=notification_type,
        title=title,
        message=message,
        is_read=False,
        created_at=datetime.now(tz=timezone.utc),
    )
    db.add(notification)
    return notification


# ── Convenience helpers ────────────────────────────────────────────────────────

async def notify_achievement_unlocked(db: AsyncSession, user_id: UUID, achievement_name: str) -> None:
    await create_notification(
        db, user_id,
        notification_type="achievement",
        title="🏆 Achievement Unlocked!",
        message=f"You unlocked the '{achievement_name}' achievement. Keep it up!",
        link="/achievements",
    )


async def notify_level_up(db: AsyncSession, user_id: UUID, new_level: int, title: str) -> None:
    await create_notification(
        db, user_id,
        notification_type="level_up",
        title="⬆️ Level Up!",
        message=f"You reached Level {new_level} — {title}. Your hard work is paying off!",
        link="/dashboard",
    )


async def notify_streak_milestone(db: AsyncSession, user_id: UUID, streak_days: int) -> None:
    await create_notification(
        db, user_id,
        notification_type="streak",
        title="🔥 Streak Milestone!",
        message=f"You're on a {streak_days}-day study streak! Keep the momentum going.",
        link="/dashboard",
    )


async def notify_quest_completed(db: AsyncSession, user_id: UUID, quest_title: str) -> None:
    await create_notification(
        db, user_id,
        notification_type="quest",
        title="🎯 Quest Completed!",
        message=f"You completed '{quest_title}'. Claim your rewards now!",
        link="/quests",
    )


async def notify_revision_due(db: AsyncSession, user_id: UUID, count: int) -> None:
    await create_notification(
        db, user_id,
        notification_type="revision",
        title="🧠 Revision Due Today",
        message=f"{count} topic{'s' if count > 1 else ''} scheduled for spaced repetition review.",
        link="/revision",
    )
