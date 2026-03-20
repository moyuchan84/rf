@echo off
setlocal

echo [Step 1] Applying Prisma Schema changes (web-backend)...
cd web-backend
call npx prisma migrate dev --name sync_from_prisma
if %errorlevel% neq 0 (
    echo [ERROR] Prisma migrate dev failed!
    exit /b %errorlevel%
)
echo [OK] Prisma Migration Applied.
cd ..

echo.
echo [Step 2] Synchronizing Alembic History (backend)...
cd backend
call .\.venv\Scripts\python -m alembic revision --autogenerate -m "sync_from_prisma"
if %errorlevel% neq 0 (
    echo [WARNING] Alembic autogenerate failed or no changes detected.
) else (
    call .\.venv\Scripts\python -m alembic upgrade head
    echo [OK] Alembic Sync Complete.
)
cd ..

echo.
echo === Database Synchronized (Source: Prisma) ===
pause