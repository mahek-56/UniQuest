"""
Tests for notification endpoints.
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification
from datetime import datetime, timezone


async def _create_notification(db: AsyncSession, user_id) -> Notification:
    now = datetime.now(tz=timezone.utc)
    n = Notification(
        user_id=user_id,
        notification_type="streak",
        title="🔥 Streak Milestone!",
        message="You hit a 7-day streak!",
        is_read=False,
        created_at=now,
    )
    db.add(n)
    await db.flush()
    await db.commit()
    return n


@pytest.mark.asyncio
async def test_get_notifications_empty(client: AsyncClient, auth_headers: dict):
    """GET /notifications returns empty list for new user."""
    response = await client.get("/api/v1/notifications", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_get_notifications_with_data(
    client: AsyncClient, auth_headers: dict, registered_user: dict, db_session: AsyncSession
):
    """GET /notifications returns existing notifications."""
    me = await client.get("/api/v1/auth/me", headers=auth_headers)
    user_id = me.json()["id"]
    await _create_notification(db_session, user_id)

    response = await client.get("/api/v1/notifications", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    n = data[0]
    assert "id" in n
    assert "title" in n
    assert "message" in n
    assert "type" in n
    assert "read" in n
    assert "timestamp" in n


@pytest.mark.asyncio
async def test_mark_notification_read(
    client: AsyncClient, auth_headers: dict, registered_user: dict, db_session: AsyncSession
):
    """POST /notifications/{id}/read marks a notification as read."""
    me = await client.get("/api/v1/auth/me", headers=auth_headers)
    user_id = me.json()["id"]
    notif = await _create_notification(db_session, user_id)

    response = await client.post(
        f"/api/v1/notifications/{notif.id}/read",
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["success"] is True


@pytest.mark.asyncio
async def test_mark_all_notifications_read(
    client: AsyncClient, auth_headers: dict, registered_user: dict, db_session: AsyncSession
):
    """POST /notifications/read-all marks all as read."""
    me = await client.get("/api/v1/auth/me", headers=auth_headers)
    user_id = me.json()["id"]
    await _create_notification(db_session, user_id)
    await _create_notification(db_session, user_id)

    response = await client.post("/api/v1/notifications/read-all", headers=auth_headers)
    assert response.status_code == 204


@pytest.mark.asyncio
async def test_mark_other_users_notification_fails(
    client: AsyncClient, auth_headers: dict, second_user: dict, db_session: AsyncSession
):
    """Cannot mark another user's notification as read."""
    second_user_id = second_user["user"]["id"]
    notif = await _create_notification(db_session, second_user_id)

    response = await client.post(
        f"/api/v1/notifications/{notif.id}/read",
        headers=auth_headers,
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_notifications_require_auth(client: AsyncClient):
    """Notification endpoints require authentication."""
    response = await client.get("/api/v1/notifications")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_mark_nonexistent_notification(client: AsyncClient, auth_headers: dict):
    """Marking a nonexistent notification returns 404."""
    response = await client.post(
        "/api/v1/notifications/00000000-0000-0000-0000-000000000000/read",
        headers=auth_headers,
    )
    assert response.status_code == 404
