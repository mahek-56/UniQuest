"""
Gamification endpoints: /api/v1/gamification
"""

from datetime import date, datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select

from app.core.dependencies import CurrentUser, DBSession
from app.models.gamification import (
    Achievement,
    CoinTransaction,
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
    GamificationStatsResponse,
    LeaderboardEntry,
    LeaderboardResponse,
    QuestClaimResponse,
    QuestResponse,
    RedeemRequest,
    RedeemResponse,
    RewardResponse,
    StreakResponse,
    XPHistoryItem,
)
from app.services.gamification_service import award_coins, award_xp, deduct_coins, get_level_info

router = APIRouter(prefix="/gamification", tags=["gamification"])


# ── Combined stats (frontend: gamificationApi.getStats) ──────────────────────

@router.get("/stats", response_model=GamificationStatsResponse)
async def get_gamification_stats(current_user: CurrentUser, db: DBSession):
    """Combined endpoint: XP, coins, streak, level, rank — matches frontend contract."""
    user = current_user

    streak_r = await db.execute(select(Streak).where(Streak.user_id == user.id))
    streak = streak_r.scalar_one_or_none()
    current_streak = streak.current_streak if streak else 0

    # Simple rank: count users with more XP + 1
    rank_r = await db.execute(
        select(func.count(User.id)).where(User.xp > user.xp)
    )
    rank = int(rank_r.scalar() or 0) + 1

    level_info = get_level_info(user.xp)

    return GamificationStatsResponse(
        xp=user.xp,
        coins=user.coins,
        streak=current_streak,
        level=user.level,
        level_title=level_info.get("title", "Beginner"),
        rank=rank,
        xp_to_next_level=level_info.get("xp_to_next", 0),
    )


# ── XP ────────────────────────────────────────────────────────────────────────

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


# ── Coins ─────────────────────────────────────────────────────────────────────

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

    # Check for duplicate redemption
    already = await db.execute(
        select(UserReward).where(
            UserReward.user_id == current_user.id,
            UserReward.reward_id == reward.id,
        )
    )
    if already.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Reward already redeemed",
        )

    user = await db.merge(current_user)
    remaining = await deduct_coins(db, user, reward.cost_coins, f"Redeemed: {reward.name}")
    db.add(UserReward(
        user_id=user.id,
        reward_id=reward.id,
        redeemed_at=datetime.now(tz=timezone.utc),
    ))
    return RedeemResponse(
        message="Reward redeemed successfully",
        reward=RewardResponse.model_validate(reward),
        coins_remaining=remaining,
    )


# ── Achievements ──────────────────────────────────────────────────────────────

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


# ── Quests ────────────────────────────────────────────────────────────────────

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
            claimed=row.UserQuest.claimed if hasattr(row.UserQuest, "claimed") else row.UserQuest.completed,
            assigned_date=row.UserQuest.assigned_date,
            completed_at=row.UserQuest.completed_at,
        )
        for row in rows
    ]


@router.post("/quests/{quest_id}/claim", response_model=QuestClaimResponse)
async def claim_quest_reward(quest_id: UUID, current_user: CurrentUser, db: DBSession):
    """
    Claim rewards for a completed quest. Backend verifies quest is complete
    before awarding XP/coins — frontend cannot fake quest completion.
    """
    result = await db.execute(
        select(UserQuest, Quest)
        .join(Quest, Quest.id == UserQuest.quest_id)
        .where(
            UserQuest.id == quest_id,
            UserQuest.user_id == current_user.id,
        )
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quest not found")

    user_quest, quest = row.UserQuest, row.Quest

    if not user_quest.completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quest not yet completed",
        )

    # Prevent double-claiming: check if XPHistory already has a quest_complete entry
    # for this specific user_quest (use description matching quest title)
    already_claimed_r = await db.execute(
        select(XPHistory).where(
            XPHistory.user_id == current_user.id,
            XPHistory.source == "quest_claim",
            XPHistory.description == f"Quest claimed: {quest.title}",
        )
    )
    if already_claimed_r.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Quest reward already claimed",
        )

    user = await db.merge(current_user)
    await award_xp(db, user, quest.xp_reward, "quest_claim", f"Quest claimed: {quest.title}")
    await award_coins(db, user, quest.coin_reward, "quest_claim", f"Quest claimed: {quest.title}")

    return QuestClaimResponse(
        success=True,
        xp=quest.xp_reward,
        coins=quest.coin_reward,
        message=f"Claimed {quest.xp_reward} XP and {quest.coin_reward} coins!",
    )


# ── Rewards ───────────────────────────────────────────────────────────────────

@router.get("/rewards", response_model=list[RewardResponse])
async def get_rewards(db: DBSession):
    result = await db.execute(
        select(Reward).where(Reward.is_active == True)  # noqa: E712
    )
    return result.scalars().all()


# ── Leaderboard ───────────────────────────────────────────────────────────────

@router.get("/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard(
    current_user: CurrentUser,
    db: DBSession,
    scope: str = Query("weekly", enum=["weekly", "university", "department", "global"]),
    period_type: Optional[str] = Query(None),  # backward-compat alias
):
    """
    Leaderboard endpoint.
    Frontend uses ?scope=weekly|university|department
    Legacy: ?period_type=weekly|global|university
    """
    # Resolve scope from either param
    effective_scope = scope
    if period_type:
        effective_scope = period_type

    period_key = datetime.now().strftime("%Y-W%W") if effective_scope == "weekly" else "all"

    q = select(User).order_by(User.xp.desc()).limit(50)

    if effective_scope == "university" and current_user.university:
        q = q.where(User.university == current_user.university)
    elif effective_scope == "department" and current_user.department:
        q = q.where(
            User.university == current_user.university,
            User.department == current_user.department,
        )

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
        period_type=effective_scope,
        period_key=period_key,
        entries=entries,
        my_rank=my_rank,
    )


# ── Streak ────────────────────────────────────────────────────────────────────

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
