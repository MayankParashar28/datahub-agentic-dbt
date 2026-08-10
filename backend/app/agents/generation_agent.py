import logging
import json
from datetime import datetime
from typing import Optional, Tuple
from app.models.metadata import DatasetMetadata
from app.models.generation import ReasoningObject, GenerationRequest
from app.models.artifacts import GeneratedArtifacts, ValidationResult
from app.agents.metadata_agent import MetadataAgent
from app.agents.reasoning_agent import ReasoningAgent
from app.validation.sql_validator import SQLValidator
from app.validation.dbt_validator import DBTValidator
from app.llm.base import LLMProvider

logger = logging.getLogger(__name__)

class GenerationAgent:
    """
    DataHub dbt Forge Generation Orchestrator Agent.
    Executes the full agent workflow:
    Fetch Metadata -> Normalize -> Gap Detection -> Reason -> Generate SQL/YAML/Docs -> Validate -> Self-Repair (Max 3 retries).
    """
    def __init__(self, metadata_agent: MetadataAgent, reasoning_agent: ReasoningAgent, llm_provider: LLMProvider):
        self.metadata_agent = metadata_agent
        self.reasoning_agent = reasoning_agent
        self.llm_provider = llm_provider
        self.sql_validator = SQLValidator()
        self.dbt_validator = DBTValidator()
        self.max_retries = 3

    def generate(self, request: GenerationRequest) -> GeneratedArtifacts:
        # Step 1: Fetch and normalize primary DataHub metadata & gaps
        metadata = self.metadata_agent.analyze_dataset(request.dataset_urn)

        # Merge secondary dataset if requested for multi-dataset joins
        if request.secondary_dataset_urn and request.secondary_dataset_urn != request.dataset_urn:
            secondary = self.metadata_agent.analyze_dataset(request.secondary_dataset_urn)
            # Combine columns (prefix table name if duplicates exist) and upstream assets
            existing_col_names = {c.name for c in metadata.columns}
            for c in secondary.columns:
                if c.name not in existing_col_names:
                    metadata.columns.append(c)
            for u in secondary.upstream:
                if u.urn not in {x.urn for x in metadata.upstream}:
                    metadata.upstream.append(u)

        # Step 2: Formulate structured Reasoning Object
        reasoning = self.reasoning_agent.build_reasoning_plan(
            metadata,
            target_model_name=request.model_name,
            custom_instructions=request.custom_instructions
        )
        model_name = reasoning.target_model

        # Step 3: Generate SQL, schema.yml, README with self-repair loop
        sql, schema_yml, readme_md, validation = self._generate_with_repair_loop(metadata, reasoning, model_name, request)

        return GeneratedArtifacts(
            model_name=model_name,
            sql=sql,
            schema_yml=schema_yml,
            readme_md=readme_md,
            reasoning=reasoning,
            validation=validation,
            dataset_urn=metadata.urn,
            generation_timestamp=datetime.utcnow().isoformat() + "Z",
            generator_version="v0.1.0-forge"
        )

    def _generate_with_repair_loop(
        self,
        metadata: DatasetMetadata,
        reasoning: ReasoningObject,
        model_name: str,
        request: GenerationRequest
    ) -> Tuple[str, str, str, ValidationResult]:
        
        attempt = 0
        repair_context = ""

        sql = ""
        schema_yml = ""
        readme_md = ""
        validation = None

        allowed_derived_columns = [t.output for t in reasoning.transformations]

        while attempt <= self.max_retries:
            attempt += 1
            logger.info(f"[GENERATION] Attempt {attempt} for model '{model_name}'")

            # 1. Generate SQL model
            custom_prompt_text = f"\nCustom User Instructions: {request.custom_instructions}" if request.custom_instructions else ""
            sql_prompt = f"""
You are a senior analytics engineer writing a production dbt model.
Target model: {model_name}
Metadata context: {metadata.dict()}
Reasoning plan: {reasoning.dict()}
{custom_prompt_text}
{repair_context}

RULES:
- Use dbt {{ source(...) }} syntax appropriately.
- Use readable CTEs (source CTEs, transformation CTEs, final select *).
- ONLY reference columns present in DataHub metadata: {[c.name for c in metadata.columns]} or explicitly derived target outputs: {allowed_derived_columns}.
- DO NOT invent columns or source tables.

Output ONLY clean executable SQL.
"""
            sql = self.llm_provider.generate(sql_prompt, system_prompt="Output executable dbt SQL code.")

            # 2. Validate SQL
            validation = self.sql_validator.validate_sql(sql, metadata, allowed_derived_columns=allowed_derived_columns)
            validation.repair_attempts = attempt - 1

            if validation.is_valid:
                logger.info(f"[VALIDATION] SQL Validation PASSED on attempt {attempt}!")
                break
            else:
                logger.warning(f"[VALIDATION] Validation failed on attempt {attempt}: {validation.errors}")
                repair_context = f"""
CRITICAL REPAIR INSTRUCTION:
Your previous SQL attempt failed validation with the following error(s):
{chr(10).join(['- ' + err for err in validation.errors])}

Please fix the SQL immediately. STRICTLY ensure all column references match DataHub schema metadata!
"""

        # Generate schema.yml
        yaml_prompt = f"""
Generate dbt schema.yml for model '{model_name}'.
Model description: Canonical analytics model for {metadata.name}.
Tests plan: {[t.dict() for t in reasoning.tests]}
Columns: {[c.name for c in metadata.columns]}
Output ONLY valid YAML.
"""
        schema_yml = self.llm_provider.generate(yaml_prompt, system_prompt="Output valid YAML only.")

        # Generate README.md documentation
        readme_prompt = f"""
Generate production markdown README.md for dbt model '{model_name}'.
Purpose: {reasoning.grain}
Sources: {reasoning.sources}
Transformations: {[t.dict() for t in reasoning.transformations]}
Metadata Gaps: {[g.dict() for g in reasoning.metadata_gaps]}
Assumptions: {reasoning.assumptions}
Output clean markdown.
"""
        readme_md = self.llm_provider.generate(readme_prompt, system_prompt="Output clean markdown documentation.")

        return sql, schema_yml, readme_md, validation
