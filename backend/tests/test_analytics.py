"""
Tests for analytics endpoints including ML prediction.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_analytics_overview(client: AsyncClient, auth_headers: dict):
    """GET /analytics/overview returns complete overview data."""
    response = await client.get("/api/v1/analytics/overview", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_lessons_completed" in data
    assert "total_quizzes_taken" in data
    assert "xp" in data
    assert "level" in data
    assert "current_streak" in data


@pytest.mark.asyncio
async def test_analytics_overview_requires_auth(client: AsyncClient):
    """Analytics requires authentication."""
    response = await client.get("/api/v1/analytics/overview")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_analytics_progress_timeline(client: AsyncClient, auth_headers: dict):
    """GET /analytics/progress returns a list."""
    response = await client.get("/api/v1/analytics/progress", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_analytics_subjects(client: AsyncClient, auth_headers: dict):
    """GET /analytics/subjects returns a list."""
    response = await client.get("/api/v1/analytics/subjects", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_analytics_weak_topics(client: AsyncClient, auth_headers: dict):
    """GET /analytics/weak-topics returns a list."""
    response = await client.get("/api/v1/analytics/weak-topics", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_analytics_study_time(client: AsyncClient, auth_headers: dict):
    """GET /analytics/study-time returns a list."""
    response = await client.get("/api/v1/analytics/study-time", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_ml_prediction_insufficient_data(client: AsyncClient, auth_headers: dict):
    """GET /analytics/ml-prediction returns insufficient_data for a new user."""
    response = await client.get("/api/v1/analytics/ml-prediction", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "prediction" in data
    # New user has no quiz attempts → insufficient_data
    assert data["prediction"] == "insufficient_data"
    assert "timestamp" in data


@pytest.mark.asyncio
async def test_ml_prediction_alias(client: AsyncClient, auth_headers: dict):
    """GET /analytics/performance is an alias for ml-prediction."""
    response = await client.get("/api/v1/analytics/performance", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "prediction" in data


@pytest.mark.asyncio
async def test_ml_prediction_requires_auth(client: AsyncClient):
    """ML prediction requires authentication."""
    response = await client.get("/api/v1/analytics/ml-prediction")
    assert response.status_code == 401
