import pytest
from datetime import datetime
from app.datahub.writeback import DataHubWriteback
from app.models.artifacts import GeneratedArtifacts, ValidationResult, ValidationCheck
from app.models.generation import ReasoningObject

def test_datahub_writeback_payload():
    writeback = DataHubWriteback()
    
    reasoning = ReasoningObject(
        target_model="fct_orders",
        grain="one row per order",
        sources=["retail.orders"],
        joins=[],
        transformations=[],
        tests=[],
        metadata_gaps=[],
        assumptions=[]
    )
    
    validation = ValidationResult(
        is_valid=True,
        syntax_valid=True,
        columns_valid=True,
        sources_valid=True,
        dbt_structure_valid=True
    )
    
    artifacts = GeneratedArtifacts(
        model_name="fct_orders",
        sql="select 1",
        schema_yml="version: 2",
        readme_md="# fct_orders",
        reasoning=reasoning,
        validation=validation,
        dataset_urn="urn:li:dataset:(urn:li:dataPlatform:snowflake,retail.orders,PROD)",
        generation_timestamp=datetime.utcnow().isoformat() + "Z"
    )
    
    res = writeback.publish_artifacts(artifacts)
    
    assert res.success is True
    assert "fct_orders" in res.dataset_urn
    assert "ai-generated" in res.tags_added
    assert "retail.orders" in res.lineage_added
