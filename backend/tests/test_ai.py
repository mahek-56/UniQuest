"""
Tests for AI endpoints: tutor, study planner, recommendations, explain-answer.
Focuses on request/response contract and graceful fallback when Gemini unavailable.
"""

import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch


@pytest.mark.asyncio
async def test_ai_tutor_without_gemini_key(client: AsyncClient, auth_headers: dict):
    """AI tutor with no Gemini key returns 503 or graceful error."""
    with patch("app.core.config.settings.GEMINI_API_KEY", ""):
        response = await client.post(
            "/api/v1/ai/tutor",
            headers=auth_headers,
            json={"message": "What is normalization?", "subject": "DBMS", "history": []},
        )
    # 503 when key missing
    assert response.status_code == 503


@pytest.mark.asyncio
async def test_ai_tutor_request_contract(client: AsyncClient, auth_headers: dict):
    """
    AI tutor accepts {message, subject, history} — the frontend contract.
    With a mock Gemini response we verify the response shape.
    """
    mock_reply = "Normalization reduces data redundancy.\n---SUGGESTIONS---\n[\"What is 3NF?\"]"

    with patch("app.core.config.settings.GEMINI_API_KEY", "fake-key"), \
         patch("app.ai.gemini_client.generate_text", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = mock_reply

        response = await client.post(
            "/api/v1/ai/tutor",
            headers=auth_headers,
            json={
                "message": "Explain normalization",
                "subject": "DBMS",
                "history": [{"role": "user", "content": "Previous message"}],
            },
        )

    assert response.status_code == 200
    data = response.json()
    # Frontend expects: reply, timestamp, suggestedFollowUps
    assert "reply" in data
    assert "timestamp" in data
    assert "suggestedFollowUps" in data
    assert isinstance(data["suggestedFollowUps"], list)


@pytest.mark.asyncio
async def test_ai_tutor_uses_message_field(client: AsyncClient, auth_headers: dict):
    """Frontend sends 'message', not 'question'. Backend must use it."""
    with patch("app.core.config.settings.GEMINI_API_KEY", "fake-key"), \
         patch("app.ai.gemini_client.generate_text", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = "Some answer about algorithms"

        response = await client.post(
            "/api/v1/ai/tutor",
            headers=auth_headers,
            json={"message": "Explain Dijkstra", "subject": "DSA"},
        )
    assert response.status_code == 200
    # Should not get 422 validation error
    assert response.json()["reply"] != ""


@pytest.mark.asyncio
async def test_ai_tutor_empty_message(client: AsyncClient, auth_headers: dict):
    """Empty message returns a graceful response."""
    with patch("app.core.config.settings.GEMINI_API_KEY", "fake-key"), \
         patch("app.ai.gemini_client.generate_text", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = "Please provide a question."

        response = await client.post(
            "/api/v1/ai/tutor",
            headers=auth_headers,
            json={"message": "", "subject": "General"},
        )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_ai_study_planner_alias(client: AsyncClient, auth_headers: dict):
    """POST /ai/study-planner (frontend URL) works."""
    mock_plan = {
        "generatedAt": "2026-08-16T00:00:00Z",
        "targetGrade": "A",
        "weeklyGoalHours": 14,
        "scheduleSummary": "Study plan",
        "days": [],
    }

    with patch("app.core.config.settings.GEMINI_API_KEY", "fake-key"), \
         patch("app.ai.gemini_client.generate_json", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = mock_plan

        response = await client.post(
            "/api/v1/ai/study-planner",
            headers=auth_headers,
            json={
                "dailyHours": 2,
                "targetGrade": "A",
                "subjects": ["DBMS", "OS"],
            },
        )
    assert response.status_code == 200
    data = response.json()
    assert "plan_id" in data
    assert "plan_data" in data


@pytest.mark.asyncio
async def test_ai_recommendations_no_gemini(client: AsyncClient, auth_headers: dict):
    """GET /ai/recommendations with no Gemini key returns empty list (graceful)."""
    with patch("app.core.config.settings.GEMINI_API_KEY", ""):
        response = await client.get("/api/v1/ai/recommendations", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_ai_tutor_requires_auth(client: AsyncClient):
    """AI tutor requires authentication."""
    response = await client.post(
        "/api/v1/ai/tutor",
        json={"message": "test", "subject": "DBMS"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_gemini_failure_returns_graceful_error(client: AsyncClient, auth_headers: dict):
    """When Gemini raises an exception, tutor returns graceful fallback."""
    with patch("app.core.config.settings.GEMINI_API_KEY", "fake-key"), \
         patch("app.ai.gemini_client.generate_text", new_callable=AsyncMock) as mock_gen:
        mock_gen.side_effect = Exception("Gemini API unavailable")

        response = await client.post(
            "/api/v1/ai/tutor",
            headers=auth_headers,
            json={"message": "What is 3NF?", "subject": "DBMS"},
        )

    assert response.status_code == 200
    data = response.json()
    # Should return a fallback reply, not crash
    assert "reply" in data
    assert len(data["reply"]) > 0
