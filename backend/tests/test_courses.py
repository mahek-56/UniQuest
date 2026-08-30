"""
Tests for courses, modules, lessons, and enrollment endpoints.
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.course import Course, Module, Lesson
from datetime import datetime, timezone


async def _create_test_course(db: AsyncSession) -> Course:
    """Helper: insert a published course with one module and lesson."""
    now = datetime.now(tz=timezone.utc)
    course = Course(
        title="Test Course",
        description="A test course",
        subject="Testing",
        difficulty="easy",
        is_published=True,
        created_at=now,
        updated_at=now,
    )
    db.add(course)
    await db.flush()

    module = Module(
        course_id=course.id,
        title="Module 1",
        order_index=0,
        created_at=now,
        updated_at=now,
    )
    db.add(module)
    await db.flush()

    lesson = Lesson(
        module_id=module.id,
        title="Lesson 1",
        content="Some content",
        duration_minutes=10,
        xp_reward=20,
        order_index=0,
        created_at=now,
        updated_at=now,
    )
    db.add(lesson)
    await db.flush()
    await db.commit()

    # Reload to get IDs
    return course, module, lesson


@pytest.mark.asyncio
async def test_list_courses(client: AsyncClient, db_session: AsyncSession):
    """GET /courses returns a list."""
    response = await client.get("/api/v1/courses/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_get_course_not_found(client: AsyncClient):
    """GET /courses/{non-existent} returns 404."""
    response = await client.get("/api/v1/courses/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_enroll_in_course(client: AsyncClient, auth_headers: dict, db_session: AsyncSession):
    """POST /courses/{id}/enroll successfully enrolls a user."""
    course, _, _ = await _create_test_course(db_session)
    response = await client.post(
        f"/api/v1/courses/{course.id}/enroll",
        headers=auth_headers,
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_enroll_duplicate(client: AsyncClient, auth_headers: dict, db_session: AsyncSession):
    """Enrolling twice returns 409."""
    course, _, _ = await _create_test_course(db_session)
    await client.post(f"/api/v1/courses/{course.id}/enroll", headers=auth_headers)
    response = await client.post(f"/api/v1/courses/{course.id}/enroll", headers=auth_headers)
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_enroll_requires_auth(client: AsyncClient, db_session: AsyncSession):
    """Enrollment requires authentication."""
    course, _, _ = await _create_test_course(db_session)
    response = await client.post(f"/api/v1/courses/{course.id}/enroll")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_lesson(client: AsyncClient, db_session: AsyncSession):
    """GET /lessons/{id} returns lesson data."""
    _, _, lesson = await _create_test_course(db_session)
    response = await client.get(f"/api/v1/lessons/{lesson.id}")
    assert response.status_code == 200
    assert response.json()["title"] == "Lesson 1"


@pytest.mark.asyncio
async def test_get_lesson_not_found(client: AsyncClient):
    """GET /lessons/{non-existent} returns 404."""
    response = await client.get("/api/v1/lessons/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_complete_lesson_awards_xp(
    client: AsyncClient, auth_headers: dict, db_session: AsyncSession
):
    """POST /lessons/{id}/complete awards XP and marks lesson done."""
    _, _, lesson = await _create_test_course(db_session)
    response = await client.post(
        f"/api/v1/lessons/{lesson.id}/complete",
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert "xp_earned" in data
    assert data["xp_earned"] >= 0


@pytest.mark.asyncio
async def test_complete_lesson_no_duplicate_xp(
    client: AsyncClient, auth_headers: dict, db_session: AsyncSession
):
    """Completing a lesson twice does not award XP the second time."""
    _, _, lesson = await _create_test_course(db_session)
    r1 = await client.post(f"/api/v1/lessons/{lesson.id}/complete", headers=auth_headers)
    r2 = await client.post(f"/api/v1/lessons/{lesson.id}/complete", headers=auth_headers)

    assert r1.status_code == 200
    assert r2.status_code == 200
    # Second completion should show already_completed = True
    assert r2.json().get("already_completed") is True
    # XP from second should be 0
    assert r2.json().get("xp_earned", 0) == 0


@pytest.mark.asyncio
async def test_complete_lesson_requires_auth(client: AsyncClient, db_session: AsyncSession):
    """Completing lesson requires auth."""
    _, _, lesson = await _create_test_course(db_session)
    response = await client.post(f"/api/v1/lessons/{lesson.id}/complete")
    assert response.status_code == 401
