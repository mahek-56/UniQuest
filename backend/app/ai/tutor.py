"""
AI Tutor feature — answer student questions using Gemini.
"""

import json
from datetime import datetime, timezone

from app.ai import gemini_client
from app.ai.prompts import TUTOR_SYSTEM, TUTOR_USER
from app.core.logging import get_logger
from app.schemas.ai import TutorRequest, TutorResponse

logger = get_logger(__name__)


async def ask_tutor(payload: TutorRequest) -> TutorResponse:
    question = payload.effective_question
    if not question:
        return TutorResponse(
            reply="Please provide a question.",
            timestamp=datetime.now(timezone.utc).isoformat(),
            suggestedFollowUps=[],
        )

    # Build conversation context from history if provided
    history_context = ""
    if payload.history:
        history_lines = []
        for msg in payload.history[-5:]:  # last 5 messages for context
            role = msg.get("role", "user")
            content = msg.get("content", "")
            history_lines.append(f"{role.upper()}: {content}")
        if history_lines:
            history_context = "\n".join(history_lines) + "\n\n"

    prompt = TUTOR_USER.format(
        subject=payload.subject or "General Computer Science",
        context=history_context + (payload.context or "No additional context provided."),
        question=question,
    )

    try:
        raw = await gemini_client.generate_text(
            prompt=prompt,
            system_instruction=TUTOR_SYSTEM,
            temperature=0.6,
            max_output_tokens=1024,
        )
    except Exception as exc:
        logger.error("Tutor AI call failed", error=str(exc))
        return TutorResponse(
            reply="I'm unable to answer that right now. Please try again later.",
            timestamp=datetime.now(timezone.utc).isoformat(),
            suggestedFollowUps=[
                "Can you rephrase your question?",
                "Try asking about a specific concept.",
            ],
        )

    # Split answer from follow-up suggestions
    if "---SUGGESTIONS---" in raw:
        parts = raw.split("---SUGGESTIONS---", 1)
        answer_text = parts[0].strip()
        suggestions_raw = parts[1].strip()
        try:
            suggestions = json.loads(suggestions_raw)
            if not isinstance(suggestions, list):
                suggestions = []
        except Exception:
            suggestions = []
    else:
        answer_text = raw.strip()
        suggestions = []

    return TutorResponse(
        reply=answer_text,
        answer=answer_text,
        timestamp=datetime.now(timezone.utc).isoformat(),
        suggestedFollowUps=suggestions[:3],
        follow_up_suggestions=suggestions[:3],
    )
