"""
Tests for user profile, onboarding, and stats endpoints.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_profile(client: AsyncClient, auth_headers: dict):
    """GET /users/profile returns user data."""
    response = await client.get("/api/v1/users/profile", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@uniquest.edu"
    assert "xp" in data
    assert "level" in data


@pytest.mark.asyncio
async def test_patch_profile(client: AsyncClient, auth_headers: dict):
    """PATCH /users/profile updates fields."""
    response = await client.patch(
        "/api/v1/users/profile",
        headers=auth_headers,
        json={"bio": "I love algorithms", "target_grade": "A+"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["bio"] == "I love algorithms"
    assert data["target_grade"] == "A+"


@pytest.mark.asyncio
async def test_patch_profile_partial(client: AsyncClient, auth_headers: dict):
    """PATCH /users/profile with single field only changes that field."""
    response = await client.patch(
        "/api/v1/users/profile",
        headers=auth_headers,
        json={"university": "MIT"},
    )
    assert response.status_code == 200
    assert response.json()["university"] == "MIT"


@pytest.mark.asyncio
async def test_complete_onboarding(client: AsyncClient, auth_headers: dict):
    """POST /users/onboarding completes onboarding and persists data."""
    response = await client.post(
        "/api/v1/users/onboarding",
        headers=auth_headers,
        json={
            "name": "Updated Name",
            "university": "Tech University",
            "department": "CS",
            "semester": 5,
            "interests": "AI, DBMS",
            "dailyStudyTargetMinutes": 60,
            "targetGrade": "A+",
            "preferredStudyTime": "Evening",
            "onboardingCompleted": True,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["onboarding_completed"] is True
    assert data["full_name"] == "Updated Name"
    assert data["daily_study_target_minutes"] == 60
    assert data["target_grade"] == "A+"


@pytest.mark.asyncio
async def test_onboarding_requires_auth(client: AsyncClient):
    """Onboarding endpoint requires authentication."""
    response = await client.post("/api/v1/users/onboarding", json={"name": "test"})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_stats(client: AsyncClient, auth_headers: dict):
    """GET /users/me/stats returns valid stats structure."""
    response = await client.get("/api/v1/users/me/stats", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "xp" in data
    assert "level" in data
    assert "coins" in data
    assert "current_streak" in data
    assert "total_lessons_completed" in data
    assert "total_quizzes_taken" in data


@pytest.mark.asyncio
async def test_get_activity(client: AsyncClient, auth_headers: dict):
    """GET /users/me/activity returns a list."""
    response = await client.get("/api/v1/users/me/activity", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_profile_unauthenticated(client: AsyncClient):
    """Profile endpoints require authentication."""
    response = await client.get("/api/v1/users/profile")
    assert response.status_code == 401
