import logging
import yaml
from typing import Tuple, List
from app.models.artifacts import ValidationCheck

logger = logging.getLogger(__name__)

class DBTValidator:
    """
    Validates generated dbt schema.yml structure and YAML syntax.
    """
    def validate_schema_yml(self, yaml_content: str, model_name: str) -> Tuple[bool, List[str]]:
        errors = []
        try:
            parsed = yaml.safe_load(yaml_content)
            if not isinstance(parsed, dict):
                errors.append("schema.yml root must be a YAML dictionary")
                return False, errors
            
            if "models" not in parsed:
                errors.append("schema.yml is missing required top-level key `models`")
                return False, errors
            
            models = parsed.get("models", [])
            target_model = next((m for m in models if isinstance(m, dict) and m.get("name") == model_name), None)
            if not target_model:
                errors.append(f"schema.yml does not declare model `{model_name}`")
                return False, errors
            
            return True, []
        except Exception as e:
            errors.append(f"Invalid YAML syntax in schema.yml: {str(e)}")
            return False, errors
