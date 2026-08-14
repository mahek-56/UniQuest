"""
Authenticated Google Gemini API wrapper.
All AI calls go through this module so we have a single place
to handle retries, errors, and API key validation.
"""

import json
from typing import Any, Optional

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

_client = None


def _get_client():
    global _client
    if _client is None:
        if not settings.GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY is not configured")
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _client = genai.GenerativeModel("gemini-1.5-flash")
    return _client


async def generate_text(
    prompt: str,
    system_instruction: Optional[str] = None,
    temperature: float = 0.7,
    max_output_tokens: int = 2048,
) -> str:
    """
    Send a prompt to Gemini and return the text response.
    Falls back gracefully and logs on error.
    """
    import asyncio
    import google.generativeai as genai

    try:
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=system_instruction,
            generation_config=genai.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_output_tokens,
            ),
        )
        # Run blocking call in thread pool
        response = await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: model.generate_content(prompt),
        )
        return response.text
    except Exception as exc:
        logger.error("Gemini API error", error=str(exc))
        raise


async def generate_json(
    prompt: str,
    system_instruction: Optional[str] = None,
) -> Any:
    """Generate a response and parse it as JSON."""
    raw = await generate_text(prompt, system_instruction=system_instruction, temperature=0.3)
    # Strip markdown fences if present
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[-1]
        raw = raw.rsplit("```", 1)[0]
    return json.loads(raw)
