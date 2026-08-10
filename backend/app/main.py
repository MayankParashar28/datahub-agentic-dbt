import logging
import threading
import time
import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import health, datasets, generation, chat
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

# Register API routes (Support both /api prefix and root routes for deployment reverse proxies)
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(health.router, prefix="", tags=["Health-Root"])

app.include_router(datasets.router, prefix="/api", tags=["Datasets"])
app.include_router(datasets.router, prefix="", tags=["Datasets-Root"])

app.include_router(generation.router, prefix="/api", tags=["Generation"])
app.include_router(generation.router, prefix="", tags=["Generation-Root"])

app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(chat.router, prefix="", tags=["Chat-Root"])

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
    logger.info(f"App Name: {settings.APP_NAME}")
    logger.info(f"Version: {settings.VERSION}")
    logger.info(f"Demo Mode Active: {settings.DEMO_MODE}")
    logger.info(f"DataHub GMS URL: {settings.DATAHUB_URL}")
