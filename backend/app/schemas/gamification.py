"""
Gamification schemas: XP, coins, streaks, achievements, quests, leaderboard.
"""

from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class XPHistoryItem(BaseModel):
    id: UUID
    amount: int
    source: str
    description: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class LevelInfo(BaseModel):
    level: int
    title: str
    current_xp: int
    xp_for_next_level: int
    xp_progress: int          # xp earned within current level


class CoinHistoryItem(BaseModel):
    id: UUID
    amount: int
    transaction_type: str
    description: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class CoinBalanceResponse(BaseModel):
    balance: int
    history: list[CoinHistoryItem] = []


class AchievementResponse(BaseModel):
    id: UUID
    key: str
    name: str
    description: str
    icon: Optional[str] = None
    xp_reward: int
    coin_reward: int
    unlocked_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class QuestResponse(BaseModel):
    id: UUID
    quest_id: UUID
    title: str
    description: str
    quest_type: str
    target_value: int
    xp_reward: int
    coin_reward: int
    progress: int
    completed: bool
    claimed: bool = False
    assigned_date: date
    completed_at: Optional[datetime] = None


class RedeemRequest(BaseModel):
    reward_id: UUID


class RewardResponse(BaseModel):
    id: UUID
    name: str
    description: str
    cost_coins: int
    icon: Optional[str] = None
    is_active: bool

    model_config = {"from_attributes": True}


class RedeemResponse(BaseModel):
    message: str
    reward: RewardResponse
    coins_remaining: int


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: UUID
    full_name: str
    university: Optional[str] = None
    department: Optional[str] = None
    xp: int
    level: int


class LeaderboardResponse(BaseModel):
    period_type: str    # weekly / global / university
    period_key: str
    entries: list[LeaderboardEntry]
    my_rank: Optional[int] = None


class StreakResponse(BaseModel):
    current_streak: int
    longest_streak: int
    last_active_date: Optional[date] = None


class GamificationStatsResponse(BaseModel):
    """Combined stats for frontend gamificationApi.getStats()."""
    xp: int
    coins: int
    streak: int
    level: int
    level_title: str = "Beginner"
    rank: int
    xp_to_next_level: int = 0


class QuestClaimResponse(BaseModel):
    """Response for POST /gamification/quests/{id}/claim."""
    success: bool
    xp: int
    coins: int
    message: str
