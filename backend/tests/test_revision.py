"""
Tests for spaced revision endpoints (SM-2 algorithm).
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.revision import RevisionTopic
from datetime import date, datetime, timezone


async def _create_revision_topic(db: AsyncSession, user_id) -> RevisionTopic:
    """Create a due revision topic for a user."""
    now = datetime.now(tz=timezone.utc)
    topic = RevisionTopic(
        user_id=user_id,
        topic="Normalization in DBMS",
        subject="DBMS",
        difficulty="medium",
        performance_score=0.5,
        interval_days=1,
        repetitions=0,
        ease_factor=2.5,
        next_revision_date=date.today(),  # due today
        created_at=now,
        updated_at=now,
    )
    db.add(topic)
    await db.flush()
    await db.commit()
    return topic


@pytest.mark.asyncio
async def test_get_due_topics(client: AsyncClient, auth_headers: dict, registered_user: dict, db_session: AsyncSession):
    """GET /revision/due returns due topics."""
    # Get user ID from token
    me_response = await client.get("/api/v1/auth/me", headers=auth_headers)
    user_id = me_response.json()["id"]

    await _create_revision_topic(db_session, user_id)

    response = await client.get("/api/v1/revision/due", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["topic"] == "Normalization in DBMS"


@pytest.mark.asyncio
async def test_get_due_topics_legacy_url(client: AsyncClient, auth_headers: dict):
    """GET /revision/today (legacy) also works."""
    response = await client.get("/api/v1/revision/today", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_review_topic_good_rating(
    client: AsyncClient, auth_headers: dict, registered_user: dict, db_session: AsyncSession
):
    """POST /revision/{id}/review with rating=good updates the topic."""
    me_response = await client.get("/api/v1/auth/me", headers=auth_headers)
    user_id = me_response.json()["id"]

    topic = await _create_revision_topic(db_session, user_id)

    response = await client.post(
        f"/api/v1/revision/{topic.id}/review",
        headers=auth_headers,
        json={"rating": "good"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "next_revision_date" in data
    assert "xp_earned" in data
    assert data["xp_earned"] > 0


@pytest.mark.asyncio
async def test_review_topic_again_rating(
    client: AsyncClient, auth_headers: dict, registered_user: dict, db_session: AsyncSession
):
    """POST /revision/{id}/review with rating=again schedules for tomorrow."""
    me_response = await client.get("/api/v1/auth/me", headers=auth_headers)
    user_id = me_response.json()["id"]

    topic = await _create_revision_topic(db_session, user_id)

    response = await client.post(
        f"/api/v1/revision/{topic.id}/review",
        headers=auth_headers,
        json={"rating": "again"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["new_interval_days"] == 1  # 'again' resets to 1 day


@pytest.mark.asyncio
async def test_review_topic_all_ratings(
    client: AsyncClient, auth_headers: dict, registered_user: dict, db_session: AsyncSession
):
    """All four SM-2 ratings work without error."""
    me_response = await client.get("/api/v1/auth/me", headers=auth_headers)
    user_id = me_response.json()["id"]

    for rating in ["again", "hard", "good", "easy"]:
        topic = await _create_revision_topic(db_session, user_id)
        response = await client.post(
            f"/api/v1/revision/{topic.id}/review",
            headers=auth_headers,
            json={"rating": rating},
        )
        assert response.status_code == 200, f"Rating '{rating}' failed"


@pytest.mark.asyncio
async def test_review_nonexistent_topic(client: AsyncClient, auth_headers: dict):
    """Reviewing a nonexistent topic returns 404."""
    response = await client.post(
        "/api/v1/revision/00000000-0000-0000-0000-000000000000/review",
        headers=auth_headers,
        json={"rating": "good"},
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_revision_requires_auth(client: AsyncClient):
    """Revision endpoints require authentication."""
    response = await client.get("/api/v1/revision/due")
    assert response.status_code == 401
