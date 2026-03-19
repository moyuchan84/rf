@echo off
setlocal

echo [1/2] Synchronizing NestJS (Prisma) Schema...
cd web-backend
call npx prisma migrate dev --name auto_sync
if %errorlevel% neq 0 (
    echo Prisma migration failed!
)
cd ..

echo.
echo [2/2] Synchronizing FastAPI (Alembic) Schema...
cd backend
call .\.venv\Scripts\activate
call alembic revision --autogenerate -m "auto_sync"
call alembic upgrade head
if %errorlevel% neq 0 (
    echo Alembic migration failed!
)
cd ..

echo.
echo Database synchronization complete.
pause
