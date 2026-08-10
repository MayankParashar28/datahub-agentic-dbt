#!/bin/bash
set -e

cd "$(dirname "$0")/../frontend"

if [ ! -d "node_modules" ]; then
    echo "Installing frontend npm dependencies..."
    npm install
fi

echo "Starting DataHub dbt Forge Frontend on port 3000..."
npm run dev
