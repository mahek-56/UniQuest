"""
Tests for authentication endpoints.
Covers: register, login, refresh, logout, /me, edge cases.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient):
    """Register returns tokens + user object."""
    response = await client.post("/api/v1/auth/register", json={
        "email": "newuser@test.edu",
        "password": "SecurePass123",
        "full_name": "New User",
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert "user" in data
    assert data["user"]["email"] == "newuser@test.edu"
    assert data["user"]["full_name"] == "New User"
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    """Duplicate email returns 409."""
    payload = {"email": "dup@test.edu", "password": "Pass1234!", "full_name": "Dup User"}
    await client.post("/api/v1/auth/register", json=payload)
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 409
    assert "already registered" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_register_weak_password(client: AsyncClient):
    """Short password returns 422."""
    response = await client.post("/api/v1/auth/register", json={
        "email": "weak@test.edu",
        "password": "short",
        "full_name": "Weak Password",
    })
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_register_empty_name(client: AsyncClient):
    """Empty full_name returns 422."""
    response = await client.post("/api/v1/auth/register", json={
        "email": "emptyname@test.edu",
        "password": "ValidPass123",
        "full_name": "   ",
    })
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    """Login returns access_token, refresh_token, and user."""
    await client.post("/api/v1/auth/register", json={
        "email": "login@test.edu",
        "password": "LoginPass123",
        "full_name": "Login User",
    })
    response = await client.post("/api/v1/auth/login", json={
        "email": "login@test.edu",
        "password": "LoginPass123",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert "user" in data
    assert data["user"]["email"] == "login@test.edu"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    """Wrong password returns 401."""
    await client.post("/api/v1/auth/register", json={
        "email": "wrongpass@test.edu",
        "password": "CorrectPass123",
        "full_name": "Wrong Pass",
    })
    response = await client.post("/api/v1/auth/login", json={
        "email": "wrongpass@test.edu",
        "password": "WrongPass999",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_nonexistent_user(client: AsyncClient):
    """Login with nonexistent email returns 401."""
    response = await client.post("/api/v1/auth/login", json={
        "email": "ghost@test.edu",
        "password": "AnyPass123",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me_authenticated(client: AsyncClient, registered_user: dict):
    """GET /auth/me returns the current user when authenticated."""
    token = registered_user["access_token"]
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["email"] == "test@uniquest.edu"


@pytest.mark.asyncio
async def test_get_me_unauthenticated(client: AsyncClient):
    """GET /auth/me without token returns 401."""
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me_invalid_token(client: AsyncClient):
    """GET /auth/me with invalid token returns 401."""
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer totally_fake_token"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_refresh_token(client: AsyncClient, registered_user: dict):
    """Refresh returns a new access_token."""
    refresh_token = registered_user["refresh_token"]
    response = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


@pytest.mark.asyncio
async def test_refresh_invalid_token(client: AsyncClient):
    """Refresh with invalid token returns 401."""
    response = await client.post("/api/v1/auth/refresh", json={"refresh_token": "invalid_token"})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_logout(client: AsyncClient, registered_user: dict):
    """Logout revokes the refresh token."""
    refresh_token = registered_user["refresh_token"]
    response = await client.post("/api/v1/auth/logout", json={"refresh_token": refresh_token})
    assert response.status_code == 200

    # After logout, refresh should fail
    response2 = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert response2.status_code == 401


@pytest.mark.asyncio
async def test_register_response_contains_onboarding_field(client: AsyncClient):
    """Registration response includes onboarding_completed = False."""
    response = await client.post("/api/v1/auth/register", json={
        "email": "onboard@test.edu",
        "password": "OnboardPass1",
        "full_name": "Onboard Test",
    })
    assert response.status_code == 201
    user = response.json()["user"]
    assert "onboarding_completed" in user
    assert user["onboarding_completed"] is False
