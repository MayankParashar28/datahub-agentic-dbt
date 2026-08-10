"""
Utility script to verify pre-built examples (orders, customers, revenue).
"""
import os
import json

EXAMPLES = ["orders", "customers", "revenue"]

def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    examples_dir = os.path.join(root, "examples")
    
    print("=== Verifying Pre-built Technical Examples ===")
    for ex in EXAMPLES:
        ex_path = os.path.join(examples_dir, ex)
        meta_file = os.path.join(ex_path, "metadata.json")
        reason_file = os.path.join(ex_path, "reasoning.json")
        sql_file = [f for f in os.listdir(ex_path) if f.endswith(".sql")][0]
        schema_file = os.path.join(ex_path, "schema.yml")
        readme_file = os.path.join(ex_path, "README.md")
        
        assert os.path.exists(meta_file), f"Missing {meta_file}"
        assert os.path.exists(reason_file), f"Missing {reason_file}"
        assert os.path.exists(schema_file), f"Missing {schema_file}"
        assert os.path.exists(readme_file), f"Missing {readme_file}"
        
        print(f"✓ Example '{ex}': Found metadata.json, reasoning.json, {sql_file}, schema.yml, README.md")

    print("All 3 pre-built examples verified successfully!")

if __name__ == "__main__":
    main()
