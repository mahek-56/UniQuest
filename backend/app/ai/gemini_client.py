"""
Authenticated Google Gemini API wrapper.
All AI calls go through this module so we have a single place
to handle retries, errors, and API key validation.
"""

import json
import os
from typing import Any, Optional

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

_configured = False


def _ensure_configured():
    global _configured
    if not _configured:
        api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is not configured in .env")
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        os.environ["GOOGLE_API_KEY"] = api_key
        _configured = True


def _get_client():
    _ensure_configured()
    import google.generativeai as genai
    return genai.GenerativeModel("gemini-flash-lite-latest")


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

    _ensure_configured()

    models_to_try = [
        "gemini-flash-lite-latest",
        "gemini-3.1-flash-lite",
        "gemini-3.5-flash",
        "gemini-3.5-flash-lite",
        "gemini-flash-latest",
        "gemini-3.7-flash",
    ]
    last_exc = None

    for model_name in models_to_try:
        try:
            kwargs = {
                "model_name": model_name,
                "generation_config": genai.GenerationConfig(
                    temperature=temperature,
                    max_output_tokens=max_output_tokens,
                ),
            }
            if system_instruction:
                kwargs["system_instruction"] = system_instruction

            model = genai.GenerativeModel(**kwargs)

            # Run blocking call in thread pool (use get_running_loop for Python 3.10+)
            loop = asyncio.get_running_loop()
            response = await loop.run_in_executor(
                None,
                lambda: model.generate_content(prompt),
            )
            return response.text
        except Exception as exc:
            last_exc = exc
            logger.warning("Gemini model call failed, trying fallback", model=model_name, error=str(exc))

    logger.error("All Gemini models failed", error=str(last_exc))
    raise last_exc


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
