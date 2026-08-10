#!/bin/bash
set -e

cd "$(dirname "$0")/../backend"

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -q -r requirements.txt

echo "Starting DataHub dbt Forge Backend on port 8000..."
python3 -m app.main
