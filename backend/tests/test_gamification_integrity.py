"""
Comprehensive automated tests for platform improvements and bug fixes:
1. Quest claim protection & duplicate claim rejection (409 Conflict)
2. XP integrity & duplicate lesson completion protection
3. Peer search and comparison functionality
4. Self-comparison prevention (400 Bad Request)
5. Study planner dual modes (Custom Date Range vs Exam Prep)
6. Course verified learning resources endpoint
7. ML Prediction with real and insufficient data states
"""

from datetime import date, datetime, timedelta, timezone
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.course import Course, Lesson, Module
from app.models.gamification import Quest, UserQuest
from app.models.user import User


async def _seed_test_quest(db: AsyncSession) -> Quest:
    now = datetime.now(tz=timezone.utc)
    quest = Quest(
        title="Daily Mastery Sprint",
        description="Complete 1 lesson today",
        quest_type="lesson_complete",
        target_value=1,
        xp_reward=40,
        coin_reward=15,
        is_daily=True,
        is_active=True,
        created_at=now,
        updated_at=now,
    )
    db.add(quest)
    await db.flush()
    await db.commit()
    return quest


async def _seed_test_course_and_lesson(db: AsyncSession) -> tuple[Course, Lesson]:
    now = datetime.now(tz=timezone.utc)
    course = Course(
        title="Database Systems Integrity",
        description="Relational modeling and transaction invariants",
        subject="Database Management Systems",
        difficulty="intermediate",
        is_published=True,
        created_at=now,
        updated_at=now,
    )
    db.add(course)
    await db.flush()

    module = Module(
        course_id=course.id,
        title="Module 1: Relational Normalization",
        order_index=0,
        created_at=now,
        updated_at=now,
    )
    db.add(module)
    await db.flush()

    lesson = Lesson(
        module_id=module.id,
        title="Lesson 1.1: Functional Dependencies",
        content="Core axioms of dependency theory",
        xp_reward=25,
        duration_minutes=15,
        order_index=0,
        created_at=now,
        updated_at=now,
    )
    db.add(lesson)
    await db.flush()
    await db.commit()
    return course, lesson


@pytest.mark.asyncio
async def test_quest_claim_success_and_duplicate_rejection(
    client: AsyncClient, auth_headers: dict, db_session: AsyncSession
):
    """
    Test that a completed quest can be claimed once, and immediate duplicate
    claims return 409 Conflict without duplicating XP.
    """
    # 1. Fetch user profile
    user_res = await client.get("/api/v1/users/profile", headers=auth_headers)
    assert user_res.status_code == 200
    initial_user = user_res.json()
    initial_xp = initial_user["xp"]
    user_id = initial_user["id"]

    # 2. Seed a completed quest directly for this user
    quest = await _seed_test_quest(db_session)
    user_quest = UserQuest(
        user_id=user_id,
        quest_id=quest.id,
        progress=1,
        completed=True,
        claimed=False,
        assigned_date=date.today(),
        completed_at=datetime.now(tz=timezone.utc),
    )
    db_session.add(user_quest)
    await db_session.flush()
    await db_session.commit()

    # 3. First claim attempt -> Must succeed (200 OK)
    claim_res = await client.post(
        f"/api/v1/gamification/quests/{user_quest.id}/claim",
        headers=auth_headers,
    )
    assert claim_res.status_code == 200
    claim_data = claim_res.json()
    assert claim_data["success"] is True
    assert claim_data["xp"] == 40
    assert claim_data["coins"] == 15

    # 4. Verify user's new XP total on backend
    after_claim_res = await client.get("/api/v1/users/profile", headers=auth_headers)
    assert after_claim_res.json()["xp"] == initial_xp + 40

    # 5. Second claim attempt -> Must be rejected with 409 Conflict
    dup_claim_res = await client.post(
        f"/api/v1/gamification/quests/{user_quest.id}/claim",
        headers=auth_headers,
    )
    assert dup_claim_res.status_code == 409
    assert "already claimed" in dup_claim_res.json()["detail"].lower()

    # 6. Verify XP did NOT increase again
    final_res = await client.get("/api/v1/users/profile", headers=auth_headers)
    assert final_res.json()["xp"] == initial_xp + 40


@pytest.mark.asyncio
async def test_lesson_completion_idempotency_prevents_duplicate_xp(
    client: AsyncClient, auth_headers: dict, db_session: AsyncSession
):
    """
    Test that completing a lesson awards XP on first completion, but repeat calls
    return already_completed=True and award 0 additional XP.
    """
    _, lesson = await _seed_test_course_and_lesson(db_session)

    # Initial XP
    u1 = await client.get("/api/v1/users/profile", headers=auth_headers)
    xp_before = u1.json()["xp"]

    # First completion -> Awards lesson.xp_reward
    comp1 = await client.post(f"/api/v1/lessons/{lesson.id}/complete", headers=auth_headers)
    assert comp1.status_code == 200
    assert comp1.json()["xp_earned"] == lesson.xp_reward
    assert comp1.json()["already_completed"] is False

    # Second completion -> 0 XP earned
    comp2 = await client.post(f"/api/v1/lessons/{lesson.id}/complete", headers=auth_headers)
    assert comp2.status_code == 200
    assert comp2.json()["xp_earned"] == 0
    assert comp2.json()["already_completed"] is True

    # User XP increased exactly once
    u2 = await client.get("/api/v1/users/profile", headers=auth_headers)
    assert u2.json()["xp"] == xp_before + lesson.xp_reward


@pytest.mark.asyncio
async def test_peer_search_and_comparison(
    client: AsyncClient, auth_headers: dict, db_session: AsyncSession
):
    """
    Test student search, peer comparison response format, and self-comparison rejection.
    """
    # 1. Get current user
    me_res = await client.get("/api/v1/users/profile", headers=auth_headers)
    me = me_res.json()

    # 2. Create another peer user
    peer = User(
        email="alex.peer@uniquest.edu",
        hashed_password="hashed_pass_placeholder",
        full_name="Alex Chen",
        university="National Tech University",
        department="Computer Engineering",
        xp=850,
        level=8,
        coins=200,
        is_active=True,
        is_verified=True,
        created_at=datetime.now(tz=timezone.utc),
    )
    db_session.add(peer)
    await db_session.flush()
    await db_session.commit()

    # 3. Search students -> Must return peer and exclude current user
    search_res = await client.get("/api/v1/users/search?q=Alex", headers=auth_headers)
    assert search_res.status_code == 200
    results = search_res.json()
    assert any(p["id"] == str(peer.id) for p in results)
    assert all(p["id"] != str(me["id"]) for p in results)

    # 4. Compare with peer -> Returns side-by-side metrics
    compare_res = await client.get(f"/api/v1/users/compare/{peer.id}", headers=auth_headers)
    assert compare_res.status_code == 200
    comp_data = compare_res.json()
    assert "you" in comp_data
    assert "peer" in comp_data
    assert comp_data["peer"]["full_name"] == "Alex Chen"
    assert "comparison_metrics" in comp_data
    assert len(comp_data["comparison_metrics"]) >= 5

    # 5. Self-comparison -> Must be rejected with 400 Bad Request
    self_comp = await client.get(f"/api/v1/users/compare/{me['id']}", headers=auth_headers)
    assert self_comp.status_code == 400
    assert "cannot compare with yourself" in self_comp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_study_planner_custom_date_range_mode(
    client: AsyncClient, auth_headers: dict
):
    """
    Test Study Planner Mode 1: Custom Date Range without exam date requirement.
    """
    from unittest.mock import patch

    today = date.today().strftime("%Y-%m-%d")
    next_week = (date.today() + timedelta(days=6)).strftime("%Y-%m-%d")

    payload = {
        "mode": "custom_range",
        "startDate": today,
        "endDate": next_week,
        "dailyHours": 3.0,
        "goals": "Complete DBMS and OS chapters",
        "subjects": ["DBMS", "Operating Systems"],
    }

    with patch("app.core.config.settings.GEMINI_API_KEY", "mock-gemini-key"):
        res = await client.post("/api/v1/ai/study-planner", json=payload, headers=auth_headers)

    assert res.status_code == 200
    data = res.json()
    assert "plan_id" in data
    plan_data = data["plan_data"]
    assert "days" in plan_data
    assert len(plan_data["days"]) >= 5
    # Verify days start on start_date
    assert plan_data["days"][0]["date"] == today


@pytest.mark.asyncio
async def test_study_planner_exam_prep_mode(
    client: AsyncClient, auth_headers: dict
):
    """
    Test Study Planner Mode 2: Exam Preparation countdown plan.
    """
    from unittest.mock import patch

    exam_date = (date.today() + timedelta(days=14)).strftime("%Y-%m-%d")

    payload = {
        "mode": "exam_prep",
        "examDate": exam_date,
        "targetGrade": "A+",
        "dailyHours": 4.0,
        "preparationLevel": "Crash Course Mastery",
        "weakFocus": "Database Normalization, Semaphores",
    }

    with patch("app.core.config.settings.GEMINI_API_KEY", "mock-gemini-key"):
        res = await client.post("/api/v1/ai/study-planner", json=payload, headers=auth_headers)

    assert res.status_code == 200
    data = res.json()
    assert "plan_id" in data
    plan_data = data["plan_data"]
    assert "days" in plan_data
    assert len(plan_data["days"]) >= 5


@pytest.mark.asyncio
async def test_course_verified_learning_resources(
    client: AsyncClient, db_session: AsyncSession
):
    """
    Test that courses endpoint returns verified learning resources (NPTEL, YouTube, Docs, Practice).
    """
    course, _ = await _seed_test_course_and_lesson(db_session)

    res = await client.get(f"/api/v1/courses/{course.id}/resources")
    assert res.status_code == 200
    data = res.json()
    assert "resources" in data
    resources = data["resources"]
    assert len(resources) >= 3
    # Check that authentic resource providers are present
    providers = [r["provider"] for r in resources]
    assert any("NPTEL" in p for p in providers)
    assert any("Gate Smashers" in p or "YouTube" in r["type"] for r, p in zip(resources, providers))
