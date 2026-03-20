@echo off
setlocal

echo [Step 1] Applying Alembic Migration (FastAPI Backend)...
cd backend
call .\.venv\Scripts\python -m alembic revision --autogenerate -m "auto_migration"
if %errorlevel% neq 0 (
    echo [WARNING] No changes detected in Alembic.
) else (
    call .\.venv\Scripts\python -m alembic upgrade head
    echo [OK] Alembic Upgrade Applied.
)
cd ..

echo.
echo [Step 2] Synchronizing Prisma Schema (web-backend)...
cd web-backend
call npx prisma db pull
if %errorlevel% neq 0 (
    echo [ERROR] Prisma db pull failed!
    exit /b %errorlevel%
)
call npx prisma generate
echo [OK] Prisma Client and Schema Synchronized.
cd ..

echo.
echo === Database Synchronized (Source: Alembic) ===
pause