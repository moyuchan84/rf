#!/bin/bash

echo "[1/2] Synchronizing NestJS (Prisma) Schema..."
cd web-backend
npx prisma migrate dev --name auto_sync
if [ $? -ne 0 ]; then
    echo "Prisma migration failed!"
fi
cd ..

echo -e "\n[2/2] Synchronizing FastAPI (Alembic) Schema..."
cd backend
source .venv/bin/activate
alembic revision --autogenerate -m "auto_sync"
alembic upgrade head
if [ $? -ne 0 ]; then
    echo "Alembic migration failed!"
fi
cd ..

echo -e "\nDatabase synchronization complete."
