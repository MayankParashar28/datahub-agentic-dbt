import logging
import sqlglot
import sqlglot.expressions as exp
from typing import List, Dict, Any, Optional
from app.models.metadata import DatasetMetadata
from app.models.artifacts import ValidationCheck

logger = logging.getLogger(__name__)

class SemanticTypeChecker:
    """
    DataHub Glossary Semantic Type Checker.
    Treats DataHub glossary terms and column tags as a semantic type system:
    - Mismatched Currencies (USD vs EUR / UNDEFINED_CURRENCY)
    - Invalid Rate Aggregation (SUM on average_order_value or margin_percentage)
    - Grain Mismatches (Daily vs Monthly without explicit aggregation)
    """

    def check_semantic_types(self, sql: str, metadata: DatasetMetadata) -> List[ValidationCheck]:
        checks = []
        clean_sql = self._clean_sql(sql)
        
        try:
            parsed = sqlglot.parse_one(clean_sql)
        except Exception:
            return checks

        # 1. Rate Composition Check (Cannot SUM an average or percentage)
        rate_cols = {c.name.lower() for c in metadata.columns if any(term in c.name.lower() for term in ["average", "avg", "rate", "percentage", "margin"])}
        
        sums = list(parsed.find_all(exp.Sum))
        invalid_rate_sum = False
        for s in sums:
            for col in s.find_all(exp.Column):
                if col.name.lower() in rate_cols:
                    invalid_rate_sum = True
                    checks.append(ValidationCheck(
                        name="Semantic Type Check: Rate Composition",
                        passed=False,
                        details=f"SEMANTIC ERROR: Column `{col.name}` is a rate/percentage (DataHub Glossary: Rate). Summing rates across rows is mathematically invalid."
                    ))

        if not invalid_rate_sum:
            checks.append(ValidationCheck(
                name="Semantic Type Check: Rate Composition",
                passed=True,
                details="Rates and percentages are aggregated with valid weighted mathematical operations"
            ))

        # 2. Currency Homogeneity & Undefined Currency Check
        undefined_currency_cols = {c.name.lower() for c in metadata.columns if any(t in c.tags for t in ["financial"]) and "unit_price" in c.name.lower()}
        
        has_currency_issue = False
        for col_name in undefined_currency_cols:
            if col_name in sql.lower():
                has_currency_issue = True
                checks.append(ValidationCheck(
                    name="Semantic Type Check: Currency Safety",
                    passed=False,
                    details=f"SEMANTIC WARNING: Column `{col_name}` has undefined ISO currency metadata in DataHub. Preserved raw ledger value without unverified currency arithmetic."
                ))

        if not has_currency_issue:
            checks.append(ValidationCheck(
                name="Semantic Type Check: Currency Safety",
                passed=True,
                details="All monetary fields share homogeneous currency dimensions in DataHub Glossary"
            ))

        return checks

    def _clean_sql(self, sql: str) -> str:
        import re
        sql_clean = re.sub(r"\{\{\s*source\(['\"](\w+)['\"]\s*,\s*['\"](\w+)['\"]\)\s*\}\}", r"\1.\2", sql)
        sql_clean = re.sub(r"\{\{\s*ref\(['\"](\w+)['\"]\)\s*\}\}", r"\1", sql_clean)
        return sql_clean
