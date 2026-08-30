"""
Gamification models: XP, coins, streaks, achievements, quests, rewards, leaderboard.
"""

import uuid
from datetime import date, datetime
from typing import Optional

from sqlalchemy import (
    Boolean, Date, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, CrossDBUUID, TimestampMixin, UUIDMixin


class XPHistory(UUIDMixin, Base):
    __tablename__ = "xp_history"

    user_id: Mapped[uuid.UUID] = mapped_column(
        CrossDBUUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    source: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class CoinTransaction(UUIDMixin, Base):
    __tablename__ = "coin_transactions"

    user_id: Mapped[uuid.UUID] = mapped_column(
        CrossDBUUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    transaction_type: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class Streak(UUIDMixin, Base):
    __tablename__ = "streaks"
    __table_args__ = (UniqueConstraint("user_id", name="uq_streak_user"),)

    user_id: Mapped[uuid.UUID] = mapped_column(
        CrossDBUUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    current_streak: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    longest_streak: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_active_date: Mapped[Optional[date]] = mapped_column(Date)


class Achievement(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "achievements"

    key: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    icon: Mapped[Optional[str]] = mapped_column(String(100))
    xp_reward: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    coin_reward: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class UserAchievement(UUIDMixin, Base):
    __tablename__ = "user_achievements"
    __table_args__ = (
        UniqueConstraint("user_id", "achievement_id", name="uq_user_achievement"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        CrossDBUUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    achievement_id: Mapped[uuid.UUID] = mapped_column(
        CrossDBUUID, ForeignKey("achievements.id", ondelete="CASCADE"), nullable=False
    )
    unlocked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class Quest(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "quests"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    quest_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    target_value: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    xp_reward: Mapped[int] = mapped_column(Integer, nullable=False, default=25)
    coin_reward: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    is_daily: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class UserQuest(UUIDMixin, Base):
    __tablename__ = "user_quests"
    __table_args__ = (
        UniqueConstraint("user_id", "quest_id", "assigned_date", name="uq_user_quest_date"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        CrossDBUUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    quest_id: Mapped[uuid.UUID] = mapped_column(
        CrossDBUUID, ForeignKey("quests.id", ondelete="CASCADE"), nullable=False
    )
    progress: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    claimed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    assigned_date: Mapped[date] = mapped_column(Date, nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))


class Reward(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "rewards"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    cost_coins: Mapped[int] = mapped_column(Integer, nullable=False)
    icon: Mapped[Optional[str]] = mapped_column(String(100))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class UserReward(UUIDMixin, Base):
    __tablename__ = "user_rewards"

    user_id: Mapped[uuid.UUID] = mapped_column(
        CrossDBUUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reward_id: Mapped[uuid.UUID] = mapped_column(
        CrossDBUUID, ForeignKey("rewards.id", ondelete="CASCADE"), nullable=False
    )
    redeemed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class LeaderboardSnapshot(UUIDMixin, Base):
    __tablename__ = "leaderboard_snapshots"
    __table_args__ = (
        UniqueConstraint("user_id", "period_type", "period_key", name="uq_leaderboard_entry"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        CrossDBUUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    period_type: Mapped[str] = mapped_column(String(50), nullable=False)
    period_key: Mapped[str] = mapped_column(String(50), nullable=False)
    xp: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    rank: Mapped[Optional[int]] = mapped_column(Integer)
    university: Mapped[Optional[str]] = mapped_column(String(255))
    department: Mapped[Optional[str]] = mapped_column(String(255))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
