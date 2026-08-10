from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.models.metadata import MetadataGap

class TransformationPlan(BaseModel):
    expression: str
    output: str
    reason: str

class TestPlan(BaseModel):
    column: str
    test: str  # e.g., "unique", "not_null", "relationships", "accepted_values"
    reason: str
    params: Dict[str, Any] = Field(default_factory=dict)

class ExplainabilityDecision(BaseModel):
    decision: str
    evidence: str
    confidence: str = "High"  # High, Medium, Low
    section: str  # Transformation, Join, Test, Gap, Assumption

class ReasoningObject(BaseModel):
    target_model: str
    grain: str
    sources: List[str]
    joins: List[Dict[str, Any]] = Field(default_factory=list)
    transformations: List[TransformationPlan] = Field(default_factory=list)
    tests: List[TestPlan] = Field(default_factory=list)
    metadata_gaps: List[MetadataGap] = Field(default_factory=list)
    assumptions: List[str] = Field(default_factory=list)
    explainability: List[ExplainabilityDecision] = Field(default_factory=list)

class GenerationRequest(BaseModel):
    dataset_urn: str
    secondary_dataset_urn: Optional[str] = None
    model_name: Optional[str] = None
    target_schema: str = "analytics"
    llm_provider: Optional[str] = "claude"
    custom_instructions: Optional[str] = None
