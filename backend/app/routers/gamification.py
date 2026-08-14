"""
Gamification endpoints: /api/v1/gamification
"""

from datetime import date
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select

from app.core.dependencies import CurrentUser, DBSession
from app.models.gamification import (
    Achievement,
    CoinTransaction,
    LeaderboardSnapshot,
    Quest,
    Reward,
    Streak,
    UserAchievement,
    UserQuest,
    UserReward,
    XPHistory,
)
from app.models.user import User
from app.schemas.gamification import (
    AchievementResponse,
    CoinBalanceResponse,
    CoinHistoryItem,
    LeaderboardEntry,
    LeaderboardResponse,
    QuestResponse,
    RedeemRequest,
    RedeemResponse,
    RewardResponse,
    StreakResponse,
    XPHistoryItem,
)
from app.services.gamification_service import deduct_coins, get_level_info

router = APIRouter(prefix="/gamification", tags=["gamification"])


@router.get("/xp", response_model=list[XPHistoryItem])
async def get_xp_history(current_user: CurrentUser, db: DBSession):
    result = await db.execute(
        select(XPHistory)
        .where(XPHistory.user_id == current_user.id)
        .order_by(XPHistory.created_at.desc())
        .limit(50)
    )
    return result.scalars().all()


@router.get("/level")
async def get_level(current_user: CurrentUser):
    return get_level_info(current_user.xp)


@router.get("/coins", response_model=CoinBalanceResponse)
async def get_coins(current_user: CurrentUser, db: DBSession):
    result = await db.execute(
        select(CoinTransaction)
        .where(CoinTransaction.user_id == current_user.id)
        .order_by(CoinTransaction.created_at.desc())
        .limit(20)
    )
    history = result.scalars().all()
    return CoinBalanceResponse(
        balance=current_user.coins,
        history=[CoinHistoryItem.model_validate(h) for h in history],
    )


@router.post("/coins/redeem", response_model=RedeemResponse)
async def redeem_reward(payload: RedeemRequest, current_user: CurrentUser, db: DBSession):
    rr = await db.execute(
        select(Reward).where(Reward.id == payload.reward_id, Reward.is_active == True)  # noqa: E712
    )
    reward = rr.scalar_one_or_none()
    if not reward:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reward not found")

    remaining = await deduct_coins(db, current_user, reward.cost_coins, f"Redeemed: {reward.name}")
    db.add(UserReward(user_id=current_user.id, reward_id=reward.id,
                      redeemed_at=__import__('datetime').datetime.now(
                          tz=__import__('datetime').timezone.utc)))
    return RedeemResponse(
        message="Reward redeemed successfully",
        reward=RewardResponse.model_validate(reward),
        coins_remaining=remaining,
    )


@router.get("/achievements", response_model=list[AchievementResponse])
async def get_achievements(current_user: CurrentUser, db: DBSession):
    result = await db.execute(
        select(Achievement, UserAchievement.unlocked_at)
        .outerjoin(
            UserAchievement,
            (UserAchievement.achievement_id == Achievement.id)
            & (UserAchievement.user_id == current_user.id),
        )
    )
    rows = result.all()
    return [
        AchievementResponse(
            id=row.Achievement.id,
            key=row.Achievement.key,
            name=row.Achievement.name,
            description=row.Achievement.description,
            icon=row.Achievement.icon,
            xp_reward=row.Achievement.xp_reward,
            coin_reward=row.Achievement.coin_reward,
            unlocked_at=row.unlocked_at,
        )
        for row in rows
    ]


@router.get("/quests", response_model=list[QuestResponse])
async def get_quests(current_user: CurrentUser, db: DBSession):
    from app.services.gamification_service import assign_daily_quests
    await assign_daily_quests(db, current_user.id)

    today = date.today()
    result = await db.execute(
        select(UserQuest, Quest)
        .join(Quest, Quest.id == UserQuest.quest_id)
        .where(UserQuest.user_id == current_user.id, UserQuest.assigned_date == today)
    )
    rows = result.all()
    return [
        QuestResponse(
            id=row.UserQuest.id,
            quest_id=row.Quest.id,
            title=row.Quest.title,
            description=row.Quest.description,
            quest_type=row.Quest.quest_type,
            target_value=row.Quest.target_value,
            xp_reward=row.Quest.xp_reward,
            coin_reward=row.Quest.coin_reward,
            progress=row.UserQuest.progress,
            completed=row.UserQuest.completed,
            assigned_date=row.UserQuest.assigned_date,
            completed_at=row.UserQuest.completed_at,
        )
        for row in rows
    ]


@router.get("/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard(
    current_user: CurrentUser,
    db: DBSession,
    period_type: str = Query("weekly", enum=["weekly", "global", "university"]),
):
    from datetime import datetime
    period_key = datetime.now().strftime("%Y-W%W") if period_type == "weekly" else "all"

    q = select(User).order_by(User.xp.desc()).limit(50)
    if period_type == "university" and current_user.university:
        q = q.where(User.university == current_user.university)

    result = await db.execute(q)
    users = result.scalars().all()

    entries = [
        LeaderboardEntry(
            rank=idx + 1,
            user_id=u.id,
            full_name=u.full_name,
            university=u.university,
            department=u.department,
            xp=u.xp,
            level=u.level,
        )
        for idx, u in enumerate(users)
    ]

    my_rank = next(
        (e.rank for e in entries if e.user_id == current_user.id),
        None,
    )

    return LeaderboardResponse(
        period_type=period_type,
        period_key=period_key,
        entries=entries,
        my_rank=my_rank,
    )


@router.get("/streak", response_model=StreakResponse)
async def get_streak(current_user: CurrentUser, db: DBSession):
    result = await db.execute(select(Streak).where(Streak.user_id == current_user.id))
    streak = result.scalar_one_or_none()
    if not streak:
        return StreakResponse(current_streak=0, longest_streak=0)
    return StreakResponse(
        current_streak=streak.current_streak,
        longest_streak=streak.longest_streak,
        last_active_date=streak.last_active_date,
    )
