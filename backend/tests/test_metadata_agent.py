import pytest
from app.datahub.client import DataHubClient
from app.agents.metadata_agent import MetadataAgent

def test_metadata_normalization():
    client = DataHubClient()
    agent = MetadataAgent(client)
    
    metadata = agent.analyze_dataset("urn:li:dataset:(urn:li:dataPlatform:snowflake,retail.orders,PROD)")
    
    assert metadata.name == "retail.orders"
    assert metadata.platform == "snowflake"
    assert len(metadata.columns) > 0
    assert metadata.quality_score is not None
    assert metadata.quality_score.overall_score > 0
    
def test_metadata_gap_detection():
    client = DataHubClient()
    agent = MetadataAgent(client)
    
    metadata = agent.analyze_dataset("urn:li:dataset:(urn:li:dataPlatform:snowflake,retail.orders,PROD)")
    
    gap_types = [g.gap_type for g in metadata.quality_score.gaps]
    # Check that missing description or undefined currency gap is detected
    assert "MISSING_DESCRIPTION" in gap_types or "UNDEFINED_CURRENCY" in gap_types
