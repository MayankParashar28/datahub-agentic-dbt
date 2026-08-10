from fastapi import APIRouter
from app.config import settings

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.VERSION,
        "demo_mode": settings.DEMO_MODE,
        "datahub_url": settings.DATAHUB_URL,
        "llm_provider": settings.LLM_PROVIDER
    }
