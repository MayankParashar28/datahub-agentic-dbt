from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.datahub.client import DataHubClient
from app.agents.metadata_agent import MetadataAgent
from app.models.metadata import DatasetMetadata

router = APIRouter()
client = DataHubClient()
metadata_agent = MetadataAgent(client)

@router.get("/datasets")
def list_datasets() -> List[Dict[str, Any]]:
    """List available DataHub datasets."""
    return client.list_datasets()

@router.get("/datasets/inspect")
def inspect_dataset(urn: str) -> DatasetMetadata:
    """Fetch normalized metadata, quality score, and gap analysis for a dataset URN."""
    try:
        return metadata_agent.analyze_dataset(urn)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to inspect dataset: {str(e)}")
