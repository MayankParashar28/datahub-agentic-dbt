import os
import json
import logging
from typing import Dict, Any
from app.datahub.seed_data import DEMO_DATASETS

logger = logging.getLogger(__name__)

def get_demo_datahub_dir() -> str:
    current = os.path.abspath(__file__)
    dir_path = current
    while os.path.dirname(dir_path) != dir_path:
        candidate = os.path.join(dir_path, "demo_datahub")
        if os.path.exists(candidate) and os.path.isdir(candidate):
            return candidate
        dir_path = os.path.dirname(dir_path)
    return ""

def load_demo_datahub_context() -> Dict[str, Any]:
    """
    Reads the standalone demo_datahub/ system JSON files (datasets, lineage, ownership, glossary)
    and produces a normalized dataset dictionary keyed by URN.
    Falls back to seed_data if demo_datahub is unreachable.
    """
    demo_dir = get_demo_datahub_dir()
    if not demo_dir:
        logger.info("demo_datahub directory not found, using default DEMO_DATASETS seed.")
        return DEMO_DATASETS

    datasets_dir = os.path.join(demo_dir, "datasets")
    lineage_file = os.path.join(demo_dir, "lineage.json")
    ownership_file = os.path.join(demo_dir, "ownership.json")

    lineage = {}
    if os.path.exists(lineage_file):
        with open(lineage_file, "r", encoding="utf-8") as f:
            lineage = json.load(f)

    ownership = {}
    if os.path.exists(ownership_file):
        with open(ownership_file, "r", encoding="utf-8") as f:
            ownership = json.load(f)

    demo_datasets = {}

    if os.path.exists(datasets_dir):
        for filename in os.listdir(datasets_dir):
            if filename.endswith(".json"):
                filepath = os.path.join(datasets_dir, filename)
                with open(filepath, "r", encoding="utf-8") as f:
                    ds = json.load(f)
                    ds_name = ds.get("name")
                    urn = ds.get("urn")

                    # Add lineage assets
                    upstreams = lineage.get("upstream", {}).get(ds_name, [])
                    downstreams = lineage.get("downstream", {}).get(ds_name, [])

                    ds["upstream"] = [
                        {
                            "urn": f"urn:li:dataset:fiction-retail.{up}",
                            "name": up,
                            "platform": "postgres",
                            "relationship_type": "DERIVED_FROM"
                        }
                        for up in upstreams
                    ]
                    ds["downstream"] = [
                        {
                            "urn": f"urn:li:dataset:fiction-retail.{down}",
                            "name": down,
                            "platform": "postgres",
                            "relationship_type": "CONSUMED_BY"
                        }
                        for down in downstreams
                    ]

                    # Add ownership if present
                    if ds_name in ownership:
                        ds["owners"] = ownership[ds_name].get("owners", ds.get("owners", []))

                    # Collect dataset-level glossary terms from columns
                    ds_glossary = set()
                    for col in ds.get("columns", []):
                        for g in col.get("glossary_terms", []):
                            ds_glossary.add(g)
                    ds["glossary_terms"] = list(ds_glossary)

                    demo_datasets[urn] = ds

    # Merge legacy seed dataset URN aliases for unit test backwards compatibility
    for urn, ds in DEMO_DATASETS.items():
        if urn not in demo_datasets:
            demo_datasets[urn] = ds

    return demo_datasets if demo_datasets else DEMO_DATASETS
