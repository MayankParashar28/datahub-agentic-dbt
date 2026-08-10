from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.models.generation import ReasoningObject

class ValidationCheck(BaseModel):
    name: str
    passed: bool
    details: str

class ValidationResult(BaseModel):
    is_valid: bool
    syntax_valid: bool
    columns_valid: bool
    sources_valid: bool
    dbt_structure_valid: bool
    checks: List[ValidationCheck] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    repair_attempts: int = 0

class WritebackResult(BaseModel):
    success: bool
    dataset_urn: str
    published_at: str
    lineage_added: List[str] = Field(default_factory=list)
    tags_added: List[str] = Field(default_factory=list)
    documentation_updated: bool = True
    aspects_written: List[str] = Field(default_factory=list)
    message: str = "Published successfully to DataHub"

class GeneratedArtifacts(BaseModel):
    model_name: str
    sql: str
    schema_yml: str
    readme_md: str
    reasoning: ReasoningObject
    validation: ValidationResult
    dataset_urn: str
    generation_timestamp: str
    generator_version: str = "v0.1.0-forge"
