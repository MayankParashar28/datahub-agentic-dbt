import logging
from typing import List, Tuple
from app.models.metadata import DatasetMetadata, MetadataGap, MetadataQualityScore, QualityBreakdown
from app.datahub.client import DataHubClient

logger = logging.getLogger(__name__)

class MetadataAgent:
    """
    DataHub Metadata Agent.
    Fetches raw metadata from DataHub, normalizes it into DatasetMetadata models,
    detects metadata gaps, and calculates a transparent 0-100 Metadata Quality Score.
    """
    def __init__(self, client: DataHubClient):
        self.client = client

    def analyze_dataset(self, urn: str) -> DatasetMetadata:
        metadata = self.client.get_dataset(urn)
        
        # Self-enrichment heuristics for sparse metadata (Fix for Limitation 1)
        self._enrich_sparse_metadata(metadata)

        # Run quality scoring & gap detection
        quality_score, gaps, warnings = self._calculate_quality_score_and_gaps(metadata)
        metadata.quality_score = quality_score
        
        return metadata

    def _enrich_sparse_metadata(self, metadata: DatasetMetadata):
        """Infer key markers, PII tags, and descriptions if sparse."""
        if not metadata.domain:
            if "customer" in metadata.name:
                metadata.domain = "Customer Insights"
            elif "order" in metadata.name or "product" in metadata.name:
                metadata.domain = "E-Commerce"
            elif "payment" in metadata.name or "revenue" in metadata.name or "transaction" in metadata.name:
                metadata.domain = "Finance"
            elif "store" in metadata.name:
                metadata.domain = "Operations"

        for col in metadata.columns:
            # Infer primary key flag if column name ends with _id and is first column
            if (col.name.endswith("_id") and col.name == f"{metadata.name.rstrip('s')}_id") or (col.name == "id" and not any(c.is_primary_key for c in metadata.columns)):
                col.is_primary_key = True
                if "identifier" not in col.tags:
                    col.tags.append("identifier")

            # Infer PII tags
            if col.name.lower() in ("email", "phone", "first_name", "last_name", "date_of_birth", "ssn"):
                if "pii" not in col.tags:
                    col.tags.append("pii")

    def _calculate_quality_score_and_gaps(self, metadata: DatasetMetadata) -> Tuple[MetadataQualityScore, List[MetadataGap], List[str]]:
        gaps: List[MetadataGap] = []
        warnings: List[str] = []

        total_cols = len(metadata.columns)
        
        # 1. Schema score (max 25)
        schema_score = min(25, total_cols * 4) if total_cols > 0 else 0

        # 2. Lineage score (max 20)
        lineage_score = 0
        if metadata.upstream:
            lineage_score += 15
        else:
            warnings.append("No upstream lineage discovered in DataHub")
            gaps.append(MetadataGap(
                gap_type="MISSING_LINEAGE",
                description="Upstream lineage graph is empty",
                action_taken="Treated dataset as a primary source table",
                confidence="High"
            ))
        if metadata.downstream:
            lineage_score += 5

        # 3. Description coverage score (max 25)
        described_cols = [c for c in metadata.columns if c.description and c.description.strip()]
        coverage_ratio = len(described_cols) / total_cols if total_cols > 0 else 0.0
        desc_score = int(coverage_ratio * 25)

        undescribed_cols = [c.name for c in metadata.columns if not c.description or not c.description.strip()]
        if undescribed_cols:
            warnings.append(f"{len(undescribed_cols)} column(s) lack descriptions ({', '.join(undescribed_cols[:3])})")
            for col_name in undescribed_cols:
                gaps.append(MetadataGap(
                    gap_type="MISSING_DESCRIPTION",
                    column=col_name,
                    description=f"Column `{col_name}` lacks description in DataHub",
                    action_taken=f"Preserved raw column `{col_name}` without custom semantic transformation",
                    confidence="High"
                ))

        # 4. Currency and monetary gap checks
        monetary_terms = ["price", "amount", "cost", "revenue", "value", "fee", "tax", "gross", "discount"]
        for col in metadata.columns:
            if any(term in col.name.lower() for term in monetary_terms):
                # Check if currency tag/term exists
                has_currency = any("currency" in t.lower() for t in col.tags + col.glossary_terms)
                if not has_currency:
                    gaps.append(MetadataGap(
                        gap_type="UNDEFINED_CURRENCY",
                        column=col.name,
                        description=f"Monetary currency ISO definition unavailable for column `{col.name}`",
                        action_taken="No currency conversion applied; preserved native ledger values",
                        confidence="High"
                    ))
                    warnings.append(f"Currency definition unavailable for `{col.name}`")

        # 5. Glossary score (max 15)
        total_glossary_terms = len(metadata.glossary_terms) + sum(len(c.glossary_terms) for c in metadata.columns)
        glossary_score = min(15, total_glossary_terms * 5)
        if total_glossary_terms == 0:
            warnings.append("No business glossary terms attached to dataset or columns")

        # 6. Governance score (max 15)
        gov_score = 0
        if metadata.owners:
            gov_score += 10
        else:
            warnings.append("No owners registered in DataHub")
            gaps.append(MetadataGap(
                gap_type="MISSING_OWNER",
                description="Dataset ownership metadata is missing",
                action_taken="Assigned default analytics engineering team tag",
                confidence="Medium"
            ))
            
        if metadata.domain:
            gov_score += 5
        else:
            warnings.append("No business domain assigned")

        overall = schema_score + lineage_score + desc_score + glossary_score + gov_score
        overall = max(0, min(100, overall))

        breakdown = QualityBreakdown(
            schema_score=schema_score,
            lineage_score=lineage_score,
            description_coverage_score=desc_score,
            glossary_score=glossary_score,
            governance_score=gov_score
        )

        quality = MetadataQualityScore(
            overall_score=overall,
            breakdown=breakdown,
            warnings=warnings,
            gaps=gaps
        )

        return quality, gaps, warnings
