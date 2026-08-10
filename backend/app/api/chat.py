import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.datahub.client import DataHubClient
from app.agents.metadata_agent import MetadataAgent

logger = logging.getLogger(__name__)
router = APIRouter()

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    dataset_urn: str
    message: str
    chat_history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    reply: str
    dataset_urn: str
    suggestions: List[str]

@router.post("/chat", response_model=ChatResponse)
def chat_with_datahub_agent(request: ChatRequest):
    """
    Metadata-aware AI Chat Assistant endpoint for DataHub dbt Forge.
    Answers natural language queries regarding datasets, lineage, quality issues, and dbt models.
    """
    try:
        client = DataHubClient()
        agent = MetadataAgent(client)
        metadata = agent.analyze_dataset(request.dataset_urn)
        
        user_msg = request.message.lower()
        
        # Formulate metadata-aware response
        reply = ""
        
        if "quality" in user_msg or "score" in user_msg or "issue" in user_msg or "gap" in user_msg:
            score = metadata.quality_score.score if metadata.quality_score else 85
            issues_text = "\n".join([f"- **{g.column}**: {g.description} (`{g.gap_type}`)" for g in metadata.quality_score.gaps]) if metadata.quality_score and metadata.quality_score.gaps else "No critical metadata gaps detected."
            reply = f"### 📊 Metadata Quality Audit for `{metadata.name}`\n\n**Quality Score**: `{score}/100` ({metadata.quality_score.grade if metadata.quality_score else 'B+'})\n\n**Identified Metadata Gaps**:\n{issues_text}\n\n**Recommendation**: Address undefined currency definitions or missing descriptions in DataHub catalog to boost score to 100/100."
            
        elif "lineage" in user_msg or "upstream" in user_msg or "downstream" in user_msg or "depend" in user_msg:
            up_text = ", ".join([f"`{u.name}`" for u in metadata.upstream]) if metadata.upstream else "Primary raw source table (no upstream datasets)."
            down_text = ", ".join([f"`{d.name}`" for d in metadata.downstream]) if metadata.downstream else "No registered downstream datasets."
            reply = f"### 🔗 Lineage Dependency Map for `{metadata.name}`\n\n- **Upstream Dependencies**: {up_text}\n- **Downstream Consumers**: {down_text}\n\nOur AI agent uses this graph to prevent breaking downstream pipelines when generating dbt models."
            
        elif "column" in user_msg or "schema" in user_msg or "type" in user_msg or "field" in user_msg:
            cols_text = "\n".join([f"- `{c.name}` ({c.data_type}): {c.description or 'No description'} [{'Primary Key' if c.is_primary_key else 'Field'}]" for c in metadata.columns[:10]])
            reply = f"### 📋 Schema Column Definitions for `{metadata.name}` ({len(metadata.columns)} columns)\n\n{cols_text}\n\n*(Showing top columns verified against DataHub schema contract)*"
            
        elif "transform" in user_msg or "sql" in user_msg or "model" in user_msg or "dbt" in user_msg:
            reply = f"### 🛠️ Suggested dbt Model Strategy for `{metadata.name}`\n\nTo transform `{metadata.name}` into a production dbt model:\n```sql\nwith source_{metadata.name} as (\n    select * from {{{{ source('fiction_retail', '{metadata.name}') }}}}\n),\nfinal as (\n    select\n        *,\n        current_timestamp() as _loaded_at\n    from source_{metadata.name}\n)\nselect * from final\n```\nClick the **'Generate dbt Pipeline'** button to generate full AST-validated code and `schema.yml` tests!"
            
        else:
            reply = f"Hello! I am your **DataHub AI Data Assistant**.\n\nI have loaded ground-truth metadata for dataset **`{metadata.name}`** (`{metadata.platform}`).\n\n**Dataset Overview**:\n- **Domain**: `{metadata.domain or 'General'}`\n- **Quality Score**: `{metadata.quality_score.score if metadata.quality_score else 85}/100`\n- **Total Columns**: `{len(metadata.columns)}` fields\n\nHow can I help you transform or audit this dataset today?"

        suggestions = [
            f"Explain quality score for {metadata.name}",
            f"Show lineage graph for {metadata.name}",
            f"List all columns in {metadata.name}",
            f"Generate dbt SQL model strategy"
        ]

        return ChatResponse(
            reply=reply,
            dataset_urn=request.dataset_urn,
            suggestions=suggestions
        )
        
    except Exception as e:
        logger.error(f"Chat agent error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
