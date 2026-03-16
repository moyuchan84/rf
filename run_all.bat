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
echo [3/4] Applying Database Migrations...
echo ==========================================
cd backend
:: Apply migrations to bring DB to latest state
call uv run alembic upgrade head
if %ERRORLEVEL% neq 0 (
    echo.
    echo [!] Warning: Migrations failed. Attempting to generate initial revision...
    call uv run alembic revision --autogenerate -m "Initial tables"
    call uv run alembic upgrade head
)

echo.
echo ==========================================
echo [4/4] Starting RFGo PhotoKey Backend...
echo ==========================================
echo Server will run on: http://localhost:8080
echo API Docs: http://localhost:8080/docs
echo.
call uv run uvicorn app.main:app --reload --port 8080

pause
