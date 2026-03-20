#!/bin/bash
set -e

echo "[Step 1] Applying Alembic Migration (FastAPI Backend)..."
cd backend
source .venv/bin/activate
alembic revision --autogenerate -m "auto_migration" || echo "[WARNING] No changes detected in Alembic."
alembic upgrade head
echo "[OK] Alembic Upgrade Applied."
cd ..

echo -e "\n[Step 2] Synchronizing Prisma Schema (web-backend)..."
cd web-backend
npx prisma db pull
npx prisma generate
echo "[OK] Prisma Client & Schema Synchronized."
cd ..

echo -e "\n=== Database Synchronized (Source: Alembic) ==="