@echo off
echo [1/4] Restarting Docker containers...
docker-compose down
docker-compose up -d

echo.
echo [2/4] Waiting for PostgreSQL to be ready (15s)...
timeout /t 15 /nobreak

echo.
echo [3/4] Generating initial migration script...
cd backend
call uv run alembic revision --autogenerate -m "Initial tables"

echo.
echo [4/4] Applying migrations to Database...
call uv run alembic upgrade head

echo.
echo ==========================================
echo DB Setup Completed Successfully!
echo ==========================================
pause
