"""
Tests for gamification: XP, coins, streaks, quests, achievements, leaderboard.
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.gamification import Achievement, Quest
from datetime import datetime, timezone


async def _seed_achievement(db: AsyncSession) -> Achievement:
    now = datetime.now(tz=timezone.utc)
    ach = Achievement(
        key="test_first_lesson",
        name="Test Achievement",
        description="Test",
        xp_reward=50,
        coin_reward=10,
        created_at=now,
        updated_at=now,
    )
    db.add(ach)
    await db.flush()
    await db.commit()
    return ach


async def _seed_quest(db: AsyncSession) -> Quest:
    now = datetime.now(tz=timezone.utc)
    quest = Quest(
        title="Test Quest",
        description="Complete 1 lesson",
        quest_type="lesson_complete",
        target_value=1,
        xp_reward=30,
        coin_reward=10,
        is_daily=True,
        is_active=True,
        created_at=now,
        updated_at=now,
    )
    db.add(quest)
    await db.flush()
    await db.commit()
    return quest


@pytest.mark.asyncio
async def test_get_gamification_stats(client: AsyncClient, auth_headers: dict):
    """GET /gamification/stats returns combined stats."""
    response = await client.get("/api/v1/gamification/stats", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "xp" in data
    assert "coins" in data
    assert "streak" in data
    assert "level" in data
    assert "rank" in data


@pytest.mark.asyncio
async def test_gamification_stats_requires_auth(client: AsyncClient):
    """Stats endpoint requires authentication."""
    response = await client.get("/api/v1/gamification/stats")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_streak(client: AsyncClient, auth_headers: dict):
    """GET /gamification/streak returns streak data."""
    response = await client.get("/api/v1/gamification/streak", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "current_streak" in data
    assert "longest_streak" in data


@pytest.mark.asyncio
async def test_get_achievements(client: AsyncClient, auth_headers: dict, db_session: AsyncSession):
    """GET /gamification/achievements returns list."""
    await _seed_achievement(db_session)
    response = await client.get("/api/v1/gamification/achievements", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    # Each achievement has required fields
    for ach in data:
        assert "id" in ach
        assert "name" in ach
        assert "key" in ach


@pytest.mark.asyncio
async def test_get_quests(client: AsyncClient, auth_headers: dict, db_session: AsyncSession):
    """GET /gamification/quests returns daily quests."""
    await _seed_quest(db_session)
    response = await client.get("/api/v1/gamification/quests", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # Each quest has required fields
    for quest in data:
        assert "title" in quest
        assert "completed" in quest
        assert "progress" in quest


@pytest.mark.asyncio
async def test_leaderboard_weekly(client: AsyncClient, auth_headers: dict):
    """GET /gamification/leaderboard?scope=weekly returns entries."""
    response = await client.get(
        "/api/v1/gamification/leaderboard?scope=weekly",
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert "entries" in data
    assert isinstance(data["entries"], list)


@pytest.mark.asyncio
async def test_leaderboard_university_scope(client: AsyncClient, auth_headers: dict):
    """GET /gamification/leaderboard?scope=university works."""
    response = await client.get(
        "/api/v1/gamification/leaderboard?scope=university",
        headers=auth_headers,
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_leaderboard_legacy_period_type(client: AsyncClient, auth_headers: dict):
    """GET /gamification/leaderboard?period_type=weekly (legacy param) works."""
    response = await client.get(
        "/api/v1/gamification/leaderboard?period_type=weekly",
        headers=auth_headers,
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_get_xp_history(client: AsyncClient, auth_headers: dict):
    """GET /gamification/xp returns XP history list."""
    response = await client.get("/api/v1/gamification/xp", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_get_level(client: AsyncClient, auth_headers: dict):
    """GET /gamification/level returns level info."""
    response = await client.get("/api/v1/gamification/level", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "level" in data


@pytest.mark.asyncio
async def test_get_coins(client: AsyncClient, auth_headers: dict):
    """GET /gamification/coins returns coin balance."""
    response = await client.get("/api/v1/gamification/coins", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "balance" in data
    assert isinstance(data["balance"], int)
