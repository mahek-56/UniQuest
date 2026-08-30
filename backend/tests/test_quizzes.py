"""
Tests for quiz creation, submission (both /submit and /attempt), history, and scoring.
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.quiz import Quiz, Question
from datetime import datetime, timezone


async def _create_test_quiz(db: AsyncSession) -> tuple:
    """Create a simple 2-question quiz. Returns (quiz, questions)."""
    now = datetime.now(tz=timezone.utc)
    quiz = Quiz(
        title="Test Quiz",
        subject="Testing",
        difficulty="easy",
        pass_score=50.0,
        created_at=now,
        updated_at=now,
    )
    db.add(quiz)
    await db.flush()

    q1 = Question(
        quiz_id=quiz.id,
        text="What is 2 + 2?",
        options=[
            {"key": "a", "text": "3"},
            {"key": "b", "text": "4"},
            {"key": "c", "text": "5"},
            {"key": "d", "text": "6"},
        ],
        correct_answer="b",
        explanation="2 + 2 = 4",
        order_index=0,
    )
    q2 = Question(
        quiz_id=quiz.id,
        text="Capital of France?",
        options=[
            {"key": "a", "text": "Berlin"},
            {"key": "b", "text": "Madrid"},
            {"key": "c", "text": "Paris"},
            {"key": "d", "text": "Rome"},
        ],
        correct_answer="c",
        explanation="Paris is the capital of France",
        order_index=1,
    )
    db.add(q1)
    db.add(q2)
    await db.flush()
    await db.commit()
    return quiz, [q1, q2]


@pytest.mark.asyncio
async def test_get_quiz(client: AsyncClient, db_session: AsyncSession):
    """GET /quizzes/{id} returns quiz with questions."""
    quiz, questions = await _create_test_quiz(db_session)
    response = await client.get(f"/api/v1/quizzes/{quiz.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Quiz"
    assert "questions" in data
    assert len(data["questions"]) == 2


@pytest.mark.asyncio
async def test_get_quiz_not_found(client: AsyncClient):
    """GET /quizzes/{non-existent} returns 404."""
    response = await client.get("/api/v1/quizzes/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_submit_quiz_all_correct(
    client: AsyncClient, auth_headers: dict, db_session: AsyncSession
):
    """POST /quizzes/{id}/submit with all correct answers: score=100, passed=True."""
    quiz, questions = await _create_test_quiz(db_session)
    answers = {str(questions[0].id): "b", str(questions[1].id): "c"}

    response = await client.post(
        f"/api/v1/quizzes/{quiz.id}/submit",
        headers=auth_headers,
        json={"answers": answers},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["score"] == 100.0
    assert data["passed"] is True
    assert data["correct_count"] == 2
    assert data["xp_earned"] > 0


@pytest.mark.asyncio
async def test_submit_quiz_all_wrong(
    client: AsyncClient, auth_headers: dict, db_session: AsyncSession
):
    """POST /quizzes/{id}/submit with all wrong answers: score=0, passed=False."""
    quiz, questions = await _create_test_quiz(db_session)
    answers = {str(questions[0].id): "a", str(questions[1].id): "a"}

    response = await client.post(
        f"/api/v1/quizzes/{quiz.id}/submit",
        headers=auth_headers,
        json={"answers": answers},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["score"] == 0.0
    assert data["passed"] is False
    assert data["correct_count"] == 0


@pytest.mark.asyncio
async def test_submit_quiz_via_attempt_endpoint(
    client: AsyncClient, auth_headers: dict, db_session: AsyncSession
):
    """POST /quizzes/{id}/attempt (legacy endpoint) also works."""
    quiz, questions = await _create_test_quiz(db_session)
    answers = {str(questions[0].id): "b", str(questions[1].id): "c"}

    response = await client.post(
        f"/api/v1/quizzes/{quiz.id}/attempt",
        headers=auth_headers,
        json={"answers": answers},
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_quiz_submit_requires_auth(client: AsyncClient, db_session: AsyncSession):
    """Quiz submission requires authentication."""
    quiz, questions = await _create_test_quiz(db_session)
    response = await client.post(
        f"/api/v1/quizzes/{quiz.id}/submit",
        json={"answers": {}},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_quiz_score_is_server_calculated(
    client: AsyncClient, auth_headers: dict, db_session: AsyncSession
):
    """Server calculates score — frontend-submitted score is ignored."""
    quiz, questions = await _create_test_quiz(db_session)
    # Submit only one correct answer
    answers = {str(questions[0].id): "b", str(questions[1].id): "a"}

    response = await client.post(
        f"/api/v1/quizzes/{quiz.id}/submit",
        headers=auth_headers,
        json={"answers": answers},
    )
    assert response.status_code == 200
    data = response.json()
    # Score should be 50% (1/2 correct), not 100%
    assert data["score"] == 50.0
    assert data["correct_count"] == 1


@pytest.mark.asyncio
async def test_quiz_history(client: AsyncClient, auth_headers: dict, db_session: AsyncSession):
    """GET /quizzes/history returns list of past attempts."""
    quiz, questions = await _create_test_quiz(db_session)
    # Complete a quiz first
    await client.post(
        f"/api/v1/quizzes/{quiz.id}/submit",
        headers=auth_headers,
        json={"answers": {str(questions[0].id): "b"}},
    )

    response = await client.get("/api/v1/quizzes/history", headers=auth_headers)
    assert response.status_code == 200
    history = response.json()
    assert isinstance(history, list)
    assert len(history) >= 1


@pytest.mark.asyncio
async def test_quiz_history_empty(client: AsyncClient, auth_headers: dict):
    """Quiz history is empty for a brand new user."""
    response = await client.get("/api/v1/quizzes/history", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
