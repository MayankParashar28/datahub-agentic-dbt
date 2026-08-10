from abc import ABC, abstractmethod
from typing import Optional

class LLMProvider(ABC):
    """
    Abstract LLM Provider interface for DataHub dbt Forge.
    Ensures backend is provider-agnostic (Claude, OpenAI, Gemini, Mock).
    """

    @abstractmethod
    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """
        Generate completion for a given prompt string.
        """
        pass
