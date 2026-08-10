#!/usr/bin/env python3
"""
Validation Script for Demo DataHub Context (demo_datahub)
Verifies schema JSONs, URN consistency, lineage graphs, glossary terms, ownership, tags, and intentional metadata gaps.
"""

import os
import json
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASETS_DIR = os.path.join(BASE_DIR, "datasets")

EXPECTED_DATASETS = [
    "customers",
    "orders",
    "products",
    "payments",
    "stores",
    "monthly_revenue",
    "customer_lifetime_value"
]

def load_json(filepath: str):
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Failed to parse JSON file '{filepath}': {e}")
        sys.exit(1)

def validate():
    # 1. Validate Datasets
    dataset_records = {}
    urn_map = {}
    
    for name in EXPECTED_DATASETS:
        filename = f"{name}.json"
        path = os.path.join(DATASETS_DIR, filename)
        if not os.path.exists(path):
            print(f"❌ Missing dataset file: {path}")
            sys.exit(1)
            
        data = load_json(path)
        
        # Verify required keys
        required_keys = ["urn", "name", "platform", "database", "schema", "description", "columns"]
        for key in required_keys:
            if key not in data:
                print(f"❌ Dataset '{name}' missing required field: {key}")
                sys.exit(1)
                
        if data["name"] in dataset_records:
            print(f"❌ Duplicate dataset name found: {data['name']}")
            sys.exit(1)
            
        dataset_records[data["name"]] = data
        urn_map[data["urn"]] = data["name"]

    print("✓ Dataset metadata valid")

    # 2. Validate Lineage
    lineage_path = os.path.join(BASE_DIR, "lineage.json")
    lineage = load_json(lineage_path)
    
    for target, upstreams in lineage.get("upstream", {}).items():
        if target not in dataset_records:
            print(f"❌ Lineage error: Unknown target dataset '{target}' in upstream lineage")
            sys.exit(1)
        for up in upstreams:
            if up not in dataset_records:
                print(f"❌ Lineage error: Unknown upstream dataset '{up}' for target '{target}'")
                sys.exit(1)

    for source, downstreams in lineage.get("downstream", {}).items():
        if source not in dataset_records:
            print(f"❌ Lineage error: Unknown source dataset '{source}' in downstream lineage")
            sys.exit(1)
        for down in downstreams:
            if down not in dataset_records:
                print(f"❌ Lineage error: Unknown downstream dataset '{down}' for source '{source}'")
                sys.exit(1)

    print("✓ Lineage valid")

    # 3. Validate Glossary
    glossary_path = os.path.join(BASE_DIR, "glossary.json")
    glossary = load_json(glossary_path)
    
    for term_obj in glossary.get("terms", []):
        if "term" not in term_obj or "definition" not in term_obj:
            print("❌ Glossary error: Term object missing term or definition")
            sys.exit(1)
        for rel in term_obj.get("related_columns", []):
            parts = rel.split(".")
            if len(parts) == 2:
                ds_name, col_name = parts
                if ds_name in dataset_records:
                    col_names = [c["name"] for c in dataset_records[ds_name]["columns"]]
                    if col_name not in col_names:
                        print(f"❌ Glossary error: Related column '{col_name}' not found in dataset '{ds_name}'")
                        sys.exit(1)

    print("✓ Glossary valid")

    # 4. Validate Ownership
    ownership_path = os.path.join(BASE_DIR, "ownership.json")
    ownership = load_json(ownership_path)
    
    for ds_name in EXPECTED_DATASETS:
        if ds_name not in ownership:
            print(f"❌ Ownership error: Dataset '{ds_name}' not listed in ownership.json")
            sys.exit(1)
            
    print("✓ Ownership valid")

    # 5. Validate Tags
    tags_path = os.path.join(BASE_DIR, "tags.json")
    tags_data = load_json(tags_path)
    valid_tags = {t["name"] for t in tags_data.get("tags", [])}
    
    for ds_name, ds in dataset_records.items():
        for t in ds.get("tags", []):
            if t not in valid_tags:
                print(f"❌ Tags error: Unknown tag '{t}' in dataset '{ds_name}'")
                sys.exit(1)
        for col in ds.get("columns", []):
            for ct in col.get("tags", []):
                if ct not in valid_tags:
                    print(f"❌ Tags error: Unknown column tag '{ct}' in dataset '{ds_name}', column '{col['name']}'")
                    sys.exit(1)

    print("✓ Tags valid")

    # 6. Validate Metadata Gaps
    metadata_path = os.path.join(BASE_DIR, "metadata.json")
    meta = load_json(metadata_path)
    
    issues = meta.get("quality_issues", [])
    if not issues:
        print("❌ Metadata gaps error: Expected intentional quality issues in metadata.json")
        sys.exit(1)
        
    for issue in issues:
        if issue["dataset"] not in dataset_records:
            print(f"❌ Metadata gaps error: Issue references unknown dataset '{issue['dataset']}'")
            sys.exit(1)

    print("✓ Metadata gaps valid")

    print("\nDemo DataHub Context is ready.")

if __name__ == "__main__":
    validate()
