export interface ColumnMetadata {
  name: string;
  data_type: string;
  description?: string | null;
  tags: string[];
  glossary_terms: string[];
  is_primary_key?: boolean;
  is_foreign_key?: boolean;
  foreign_key_target?: string | null;
}

export interface LineageAsset {
  urn: string;
  name: string;
  platform: string;
  relationship_type: string;
}

export interface MetadataGap {
  gap_type: string;
  column?: string | null;
  description: string;
  action_taken: string;
  confidence: string;
}

export interface QualityBreakdown {
  schema_score: number;
  lineage_score: number;
  description_coverage_score: number;
  glossary_score: number;
  governance_score: number;
}

export interface MetadataQualityScore {
  overall_score: number;
  breakdown: QualityBreakdown;
  warnings: string[];
  gaps: MetadataGap[];
}

export interface DatasetMetadata {
  urn: string;
  name: string;
  platform: string;
  description?: string | null;
  columns: ColumnMetadata[];
  upstream: LineageAsset[];
  downstream: LineageAsset[];
  glossary_terms: string[];
  tags: string[];
  owners: string[];
  domain?: string | null;
  quality_score?: MetadataQualityScore | null;
}

export interface TransformationPlan {
  expression: string;
  output: string;
  reason: string;
}

export interface TestPlan {
  column: string;
  test: string;
  reason: string;
  params?: Record<string, any>;
}

export interface ExplainabilityDecision {
  decision: string;
  evidence: string;
  confidence: string;
  section: string;
}

export interface ReasoningObject {
  target_model: string;
  grain: string;
  sources: string[];
  joins: Record<string, any>[];
  transformations: TransformationPlan[];
  tests: TestPlan[];
  metadata_gaps: MetadataGap[];
  assumptions: string[];
  explainability: ExplainabilityDecision[];
}

export interface ValidationCheck {
  name: string;
  passed: boolean;
  details: string;
}

export interface ValidationResult {
  is_valid: boolean;
  syntax_valid: boolean;
  columns_valid: boolean;
  sources_valid: boolean;
  dbt_structure_valid: boolean;
  checks: ValidationCheck[];
  errors: string[];
  warnings: string[];
  repair_attempts: number;
}

export interface GeneratedArtifacts {
  model_name: string;
  sql: string;
  schema_yml: string;
  readme_md: string;
  reasoning: ReasoningObject;
  validation: ValidationResult;
  dataset_urn: string;
  generation_timestamp: string;
  generator_version: string;
}

export interface WritebackResult {
  success: boolean;
  dataset_urn: string;
  published_at: string;
  lineage_added: string[];
  tags_added: string[];
  documentation_updated: boolean;
  aspects_written: string[];
  message: string;
}
