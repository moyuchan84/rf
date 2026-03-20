#!/bin/bash
set -e

echo "[Step 1] Applying Prisma Schema changes (web-backend)..."
cd web-backend
npx prisma migrate dev --name sync_from_prisma
echo "[OK] Prisma Migration Applied."
cd ..

echo -e "\n[Step 2] Synchronizing Alembic History (backend)..."
cd backend
source .venv/bin/activate
alembic revision --autogenerate -m "sync_from_prisma" || echo "[WARNING] No changes detected in Alembic."
alembic upgrade head
echo "[OK] Alembic Sync Complete."
cd ..

echo -e "\n=== Database Synchronized (Source: Prisma) ==="