import httpx
import logging
from typing import Optional
from app.config import settings
from app.llm.base import LLMProvider

logger = logging.getLogger(__name__)

class ClaudeProvider(LLMProvider):
    """
    Anthropic Claude Provider implementation.
    """
    def __init__(self, api_key: Optional[str] = None, model: str = "claude-3-5-sonnet-20241022"):
        self.api_key = api_key or settings.ANTHROPIC_API_KEY
        self.model = model

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY is missing. Please set it in .env or switch to Demo Mode.")

        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        payload = {
            "model": self.model,
            "max_tokens": 4096,
            "messages": [{"role": "user", "content": prompt}]
        }
        if system_prompt:
            payload["system"] = system_prompt

        with httpx.Client(timeout=60.0) as client:
            res = client.post("https://api.anthropic.com/v1/messages", json=payload, headers=headers)
            res.raise_for_status()
            data = res.json()
            return data["content"][0]["text"]
