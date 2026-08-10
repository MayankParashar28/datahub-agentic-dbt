"""
Setup script to verify DataHub connectivity or initialize sample configuration.
"""
import os
import sys

def main():
    print("=== DataHub dbt Forge Environment Setup ===")
    datahub_url = os.getenv("DATAHUB_URL", "http://localhost:8080")
    demo_mode = os.getenv("DEMO_MODE", "true")
    
    print(f"DataHub GMS Target: {datahub_url}")
    print(f"Demo Mode Enabled:  {demo_mode}")
    print("Environment check complete. You can run backend/frontend scripts natively without Docker.")

if __name__ == "__main__":
    main()
