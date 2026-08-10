from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ColumnMetadata(BaseModel):
    name: str
    data_type: str
    description: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    glossary_terms: List[str] = Field(default_factory=list)
    is_primary_key: bool = False
    is_foreign_key: bool = False
    foreign_key_target: Optional[str] = None

class LineageAsset(BaseModel):
    urn: str
    name: str
    platform: str = "snowflake"
    relationship_type: str = "UPSTREAM"  # UPSTREAM or DOWNSTREAM

class MetadataGap(BaseModel):
    gap_type: str  # e.g., "MISSING_DESCRIPTION", "UNDEFINED_CURRENCY", "AMBIGUOUS_IDENTIFIER", "MISSING_OWNER"
    column: Optional[str] = None
    description: str
    action_taken: str
    confidence: str = "High"

class QualityBreakdown(BaseModel):
    schema_score: int = 25
    lineage_score: int = 20
    description_coverage_score: int = 25
    glossary_score: int = 15
    governance_score: int = 15

class MetadataQualityScore(BaseModel):
    overall_score: int
    breakdown: QualityBreakdown
    warnings: List[str] = Field(default_factory=list)
    gaps: List[MetadataGap] = Field(default_factory=list)

class DatasetMetadata(BaseModel):
    urn: str
    name: str
    platform: str = "snowflake"
    description: Optional[str] = None
    columns: List[ColumnMetadata] = Field(default_factory=list)
    upstream: List[LineageAsset] = Field(default_factory=list)
    downstream: List[LineageAsset] = Field(default_factory=list)
    glossary_terms: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    owners: List[str] = Field(default_factory=list)
    domain: Optional[str] = None
    quality_score: Optional[MetadataQualityScore] = None
