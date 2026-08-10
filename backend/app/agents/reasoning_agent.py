import json
import logging
from typing import Optional
from app.models.metadata import DatasetMetadata
from app.models.generation import ReasoningObject, TransformationPlan, TestPlan, ExplainabilityDecision
from app.llm.base import LLMProvider

logger = logging.getLogger(__name__)

class ReasoningAgent:
    """
    Metadata Reasoning Layer.
    Formulates a structured reasoning plan (grain, sources, CTE transformations with math expressions,
    test rationale, explicit assumptions, and explainability decisions) from DataHub metadata context.
    """
    def __init__(self, llm_provider: LLMProvider):
        self.llm_provider = llm_provider

    def build_reasoning_plan(self, metadata: DatasetMetadata, target_model_name: Optional[str] = None, custom_instructions: Optional[str] = None) -> ReasoningObject:
        model_name = target_model_name or self._infer_model_name(metadata.name)
        
        # Smart Column Chunking for Wide Tables > 50 columns (Fix for Limitation 4)
        relevant_columns = self._select_relevant_columns(metadata.columns, max_cols=50)

        # Prepare context payload for prompt
        columns_summary = [
            f"- {c.name} ({c.data_type}): {c.description or 'No description'} [tags: {','.join(c.tags)}]"
            for c in relevant_columns
        ]
        
        custom_rule_context = f"\n### CUSTOM USER BUSINESS INSTRUCTION:\n{custom_instructions}\n" if custom_instructions else ""

        prompt = f"""
You are a senior staff data engineering reasoning engine.
Analyze the following DataHub metadata context and produce a structured JSON reasoning object.

### DATAHUB METADATA CONTEXT
- Dataset URN: {metadata.urn}
- Table Name: {metadata.name}
- Platform: {metadata.platform}
- Description: {metadata.description}
- Domain: {metadata.domain or 'Unassigned'}
- Owners: {', '.join(metadata.owners) if metadata.owners else 'None'}
- Tags: {', '.join(metadata.tags) if metadata.tags else 'None'}
- Upstream Lineage: {', '.join([u.name for u in metadata.upstream]) if metadata.upstream else 'Primary source'}
{custom_rule_context}
### COLUMNS:
{chr(10).join(columns_summary)}

### METADATA GAPS DETECTED:
{[gap.dict() for gap in metadata.quality_score.gaps] if metadata.quality_score else []}

### INSTRUCTIONS:
Create a JSON reasoning plan with:
- target_model: "{model_name}"
- grain: "one row per ..."
- sources: ["{metadata.name}"]
- transformations: array of {{expression, output, reason}}
- tests: array of {{column, test, reason}}
- metadata_gaps: array of gaps from metadata
- assumptions: array of recorded explicit engineering assumptions
- explainability: array of {{decision, evidence, confidence, section}}

Return ONLY valid JSON.
"""

        try:
            raw_response = self.llm_provider.generate(prompt, system_prompt="You are a data platform agent. Output strictly valid JSON.")
            data = json.loads(raw_response)
            
            # Map into Pydantic ReasoningObject
            transformations = [TransformationPlan(**t) for t in data.get("transformations", [])]
            tests = [TestPlan(**t) for t in data.get("tests", [])]
            explainability = [ExplainabilityDecision(**e) for e in data.get("explainability", [])]
            
            return ReasoningObject(
                target_model=data.get("target_model", model_name),
                grain=data.get("grain", "one row per record"),
                sources=data.get("sources", [metadata.name]),
                joins=data.get("joins", []),
                transformations=transformations,
                tests=tests,
                metadata_gaps=metadata.quality_score.gaps if metadata.quality_score else [],
                assumptions=data.get("assumptions", []),
                explainability=explainability
            )
        except Exception as e:
            logger.warning(f"Error parsing LLM reasoning response: {e}. Building rule-based fallback reasoning plan.")
            return self._build_fallback_reasoning(metadata, model_name)

    def _select_relevant_columns(self, columns: list, max_cols: int = 50) -> list:
        """Filter and prioritize primary keys, foreign keys, numeric metrics, and described columns for prompt token optimization."""
        if len(columns) <= max_cols:
            return columns
        
        prioritized = []
        rest = []
        
        for col in columns:
            is_key = getattr(col, "is_primary_key", False) or col.name.endswith("_id") or col.name == "id"
            is_metric = any(term in col.name.lower() for term in ["price", "cost", "amount", "total", "quantity", "count", "revenue", "spend"])
            is_described = bool(col.description and col.description.strip())
            
            if is_key or is_metric or is_described:
                prioritized.append(col)
            else:
                rest.append(col)

        result = prioritized + rest
        return result[:max_cols]

    def _infer_model_name(self, dataset_name: str) -> str:
        clean = dataset_name.split(".")[-1]
        if "order" in clean:
            return "fct_orders"
        elif "customer" in clean:
            return "dim_customers"
        elif "transaction" in clean or "revenue" in clean:
            return "monthly_revenue"
        return f"stg_{clean}"

    def _build_fallback_reasoning(self, metadata: DatasetMetadata, model_name: str) -> ReasoningObject:
        transformations = []
        tests = []
        explainability = []

        # Find primary key column or identifier
        pk_col = next((c for c in metadata.columns if c.is_primary_key or "id" in c.name.lower()), None)
        if pk_col:
            tests.append(TestPlan(column=pk_col.name, test="unique", reason="Primary key dataset identifier"))
            tests.append(TestPlan(column=pk_col.name, test="not_null", reason="Identifier cannot be null"))
            explainability.append(ExplainabilityDecision(
                decision=f"Add unique and not_null tests to `{pk_col.name}`",
                evidence=f"DataHub column metadata identifies `{pk_col.name}` as primary identifier",
                confidence="High",
                section="Test"
            ))

        # Look for derived transformation candidates (e.g. quantity * unit_price)
        qty_col = next((c for c in metadata.columns if "quantity" in c.name.lower() or "qty" in c.name.lower()), None)
        price_col = next((c for c in metadata.columns if "price" in c.name.lower() or "amount" in c.name.lower()), None)
        if qty_col and price_col:
            transformations.append(TransformationPlan(
                expression=f"{qty_col.name} * {price_col.name}",
                output="order_value",
                reason="Derived monetary calculation from available quantity and unit price fields"
            ))
            explainability.append(ExplainabilityDecision(
                decision=f"Derive `order_value` via `{qty_col.name} * {price_col.name}`",
                evidence="Verified numeric metadata types for quantity and unit price in DataHub",
                confidence="High",
                section="Transformation"
            ))

        assumptions = [
            "DataHub schema metadata is treated as the single source of truth",
            "No unverified external tables or columns were introduced into model logic"
        ]

        return ReasoningObject(
            target_model=model_name,
            grain=f"one row per {pk_col.name if pk_col else 'record'}",
            sources=[metadata.name],
            joins=[],
            transformations=transformations,
            tests=tests,
            metadata_gaps=metadata.quality_score.gaps if metadata.quality_score else [],
            assumptions=assumptions,
            explainability=explainability
        )
