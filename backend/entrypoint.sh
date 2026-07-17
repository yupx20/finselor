#!/bin/sh
set -e

echo "⏳ Waiting for database to be ready..."

# Run seed (will skip if already seeded)
echo "🌱 Running database seeder..."
python seed.py

echo "🚀 Starting Finselor API..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
