"""
AI Tutor feature — answer student questions using Gemini.
"""

import json
from typing import Optional

from app.ai import gemini_client
from app.ai.prompts import TUTOR_SYSTEM, TUTOR_USER
from app.core.logging import get_logger
from app.schemas.ai import TutorRequest, TutorResponse

logger = get_logger(__name__)


async def ask_tutor(payload: TutorRequest) -> TutorResponse:
    prompt = TUTOR_USER.format(
        subject=payload.subject or "General",
        context=payload.context or "No additional context provided.",
        question=payload.question,
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
            answer="I'm unable to answer that right now. Please try again later.",
        )

    # Split answer from follow-up suggestions
    if "---SUGGESTIONS---" in raw:
        parts = raw.split("---SUGGESTIONS---", 1)
        answer = parts[0].strip()
        suggestions_raw = parts[1].strip()
        try:
            suggestions = json.loads(suggestions_raw)
            if not isinstance(suggestions, list):
                suggestions = []
        except Exception:
            suggestions = []
    else:
        answer = raw.strip()
        suggestions = []

    return TutorResponse(answer=answer, follow_up_suggestions=suggestions[:3])
