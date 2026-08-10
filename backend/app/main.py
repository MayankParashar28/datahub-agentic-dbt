import logging
import threading
import time
import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import health, datasets, generation
from app.security.sanitizer import mask_secret

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="DataHub dbt Forge: AI-Powered Metadata-Aware dbt Asset Generator"
)

# Secure CORS Middleware Configuration (Supports local & deployed frontends)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(datasets.router, prefix="/api", tags=["Datasets"])
app.include_router(generation.router, prefix="/api", tags=["Generation"])

@app.get("/")
def root_directory():
    return {
        "service": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "healthy",
        "docs": "/docs",
        "health": "/api/health",
        "datasets": "/api/datasets"
    }

def keep_alive_heartbeat():
    """Background heartbeat pinging Render every 10 minutes to prevent cold-start sleeping."""
    target_url = "https://datahub-agentic-dbt.onrender.com/api/health"
    while True:
        try:
            time.sleep(600)  # Ping every 10 minutes (Render sleep threshold is 15 minutes)
            with httpx.Client(timeout=10.0) as client:
                res = client.get(target_url)
                logger.info(f"[HEARTBEAT] Keep-alive ping sent to {target_url} -> Status: {res.status_code}")
        except Exception as e:
            logger.warning(f"[HEARTBEAT] Keep-alive ping cycle error: {e}")

@app.on_event("startup")
def startup_security_audit():
    logger.info("=== Security Audit & Configuration Check ===")
    logger.info(f"Demo Mode: {settings.DEMO_MODE}")
    logger.info(f"CORS Allowed Origins: {settings.ALLOWED_ORIGINS}")
    logger.info(f"Anthropic API Key: {mask_secret(settings.ANTHROPIC_API_KEY)}")
    logger.info(f"OpenAI API Key: {mask_secret(settings.OPENAI_API_KEY)}")
    logger.info(f"Gemini API Key: {mask_secret(settings.GEMINI_API_KEY)}")
    logger.info(f"DataHub Token: {mask_secret(settings.DATAHUB_TOKEN)}")
    logger.info("============================================")
    
    # Launch Keep-Alive Heartbeat Thread
    threading.Thread(target=keep_alive_heartbeat, daemon=True).start()
    logger.info("[HEARTBEAT] Automated Render keep-alive thread started (10-minute interval).")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
