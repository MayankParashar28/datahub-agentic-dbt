import os
from typing import List
from pydantic import ConfigDict
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "DataHub dbt Forge"
    VERSION: str = "0.1.0"
    DEBUG: bool = True
    
    # CORS Origins (Restricted security origins instead of wildcard)
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000"
    ]

    # DataHub
    DATAHUB_URL: str = os.getenv("DATAHUB_URL", "http://localhost:8080")
    DATAHUB_TOKEN: str = os.getenv("DATAHUB_TOKEN", "")
    
    # LLM Settings
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "claude")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Execution Mode
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")

    model_config = ConfigDict(env_file=".env", extra="ignore")

settings = Settings()
