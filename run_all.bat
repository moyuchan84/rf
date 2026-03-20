@echo off
title RFGo Full System Starter
echo ==========================================
echo [1/4] Restarting Docker Containers...
echo ==========================================
docker-compose down
docker-compose up -d
if %ERRORLEVEL% neq 0 (
    echo.
    echo [!] ERROR: Failed to start Docker. 
    echo Please make sure Docker Desktop is running and try again.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ==========================================
echo [2/4] Waiting for PostgreSQL to be ready (15s)...
echo ==========================================
timeout /t 15 /nobreak

echo.
echo ==========================================
echo [3/4] Applying Database Migrations (Prisma Master)...
echo ==========================================
cd rfgo-web-nestjs
call npx prisma migrate dev --name unified_schema_sync
call npx prisma generate
cd ..

echo.
echo ==========================================
echo [4/4] Starting RFGo PhotoKey Backend (FastAPI)...
echo ==========================================
echo Server will run on: http://localhost:8080
echo API Docs: http://localhost:8080/docs
echo.
cd rfgo-vsto-fastapi
call uv run uvicorn app.main:app --reload --port 8080

pause
