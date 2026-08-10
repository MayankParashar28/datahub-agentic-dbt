import logging
import io
import zipfile
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.config import settings
from app.datahub.client import DataHubClient
from app.datahub.writeback import DataHubWriteback
from app.agents.metadata_agent import MetadataAgent
from app.agents.reasoning_agent import ReasoningAgent
from app.agents.generation_agent import GenerationAgent
from app.models.generation import GenerationRequest
from app.models.artifacts import GeneratedArtifacts, WritebackResult

from app.llm.base import LLMProvider
from app.llm.claude import ClaudeProvider
from app.llm.openai_provider import OpenAIProvider
from app.llm.gemini_provider import GeminiProvider
from app.llm.mock_provider import MockProvider

router = APIRouter()
logger = logging.getLogger(__name__)

def get_llm_provider(provider_name: str) -> LLMProvider:
    """Return requested LLM Provider or auto-select based on available API keys."""
    if settings.DEMO_MODE:
        return MockProvider()
    
    prov = (provider_name or settings.LLM_PROVIDER).lower()
    
    # Direct match check
    if prov == "gemini" and settings.GEMINI_API_KEY:
        return GeminiProvider()
    elif prov == "claude" and settings.ANTHROPIC_API_KEY:
        return ClaudeProvider()
    elif prov == "openai" and settings.OPENAI_API_KEY:
        return OpenAIProvider()
    
    # Auto-detection fallback based on available API keys
    if settings.GEMINI_API_KEY:
        logger.info("Auto-selecting GeminiProvider via GEMINI_API_KEY")
        return GeminiProvider()
    elif settings.ANTHROPIC_API_KEY:
        logger.info("Auto-selecting ClaudeProvider via ANTHROPIC_API_KEY")
        return ClaudeProvider()
    elif settings.OPENAI_API_KEY:
        logger.info("Auto-selecting OpenAIProvider via OPENAI_API_KEY")
        return OpenAIProvider()
    
    logger.info("No API key configured for requested provider. Defaulting to MockProvider.")
    return MockProvider()

from app.security.rate_limiter import rate_limiter
from fastapi import Request

@router.post("/generate", response_model=GeneratedArtifacts)
def generate_dbt_model(request: GenerationRequest, http_request: Request) -> GeneratedArtifacts:
    """
    Run full DataHub dbt Forge Agent pipeline:
    Discover -> Normalize -> Gap Detection -> Reason -> Generate -> Validate -> Self-Repair.
    Enforces Rate Limiting (max 30 req/min).
    """
    rate_limiter.check_rate_limit(http_request)
    try:
        client = DataHubClient()
        metadata_agent = MetadataAgent(client)
        llm = get_llm_provider(request.llm_provider or settings.LLM_PROVIDER)
        reasoning_agent = ReasoningAgent(llm)
        generation_agent = GenerationAgent(metadata_agent, reasoning_agent, llm)

        return generation_agent.generate(request)
    except Exception as e:
        logger.error(f"Generation error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@router.post("/publish", response_model=WritebackResult)
def publish_to_datahub(artifacts: GeneratedArtifacts) -> WritebackResult:
    """
    Publish generated dbt model, README documentation, AI tags, and upstream lineage back to DataHub.
    """
    try:
        writeback = DataHubWriteback()
        return writeback.publish_artifacts(artifacts)
    except Exception as e:
        logger.error(f"Writeback error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Publish failed: {str(e)}")

@router.post("/export/zip")
def export_dbt_project_zip(artifacts: GeneratedArtifacts):
    """
    Package generated model, schema.yml, README, dbt_project.yml into a downloadable ZIP archive.
    """
    try:
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
            # 1. dbt_project.yml
            dbt_project_yml = f"""name: 'datahub_dbt_forge'
version: '1.0.0'
config-version: 2

profile: 'default'

model-paths: ["models"]
analysis-paths: ["analyses"]
test-paths: ["tests"]
seed-paths: ["seeds"]
macro-paths: ["macros"]
snapshot-paths: ["snapshots"]

clean-targets:
  - "target"
  - "dbt_packages"

models:
  datahub_dbt_forge:
    +materialized: table
"""
            zf.writestr("dbt_project.yml", dbt_project_yml)

            # 2. profiles.yml.example
            profiles_yml = """default:
  outputs:
    dev:
      type: snowflake
      account: "account_id"
      user: "username"
      password: "password"
      role: "ANALYTICS_ROLE"
      database: "ANALYTICS"
      warehouse: "COMPUTE_WH"
      schema: "dbt_forge"
      threads: 4
  target: dev
"""
            zf.writestr("profiles.yml.example", profiles_yml)

            # 3. Model SQL file
            zf.writestr(f"models/{artifacts.model_name}.sql", artifacts.sql)

            # 4. Schema YML file
            zf.writestr("models/schema.yml", artifacts.schema_yml)

            # 5. README Documentation
            zf.writestr("models/README.md", artifacts.readme_md)

        buffer.seek(0)
        filename = f"dbt_project_{artifacts.model_name}.zip"

        return StreamingResponse(
            buffer,
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        logger.error(f"ZIP export error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")
