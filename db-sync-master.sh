#!/bin/bash
set -e

echo "[1/2] Applying Prisma Migrations (Master: Prisma)..."
cd rfgo-web-nestjs
npx prisma migrate dev --name unified_schema_sync

echo "[2/2] Generating Prisma Client..."
npx prisma generate
cd ..

echo ""
echo "=== DB Sync Complete (Master: Prisma) ==="

