@echo off
setlocal

echo [1/2] Applying Prisma Migrations (Master: Prisma)...
cd rfgo-web-nestjs
call npx prisma migrate dev --name unified_schema_sync
if %errorlevel% neq 0 (
    echo [ERROR] Prisma Migration failed!
    exit /b %errorlevel%
)

echo [2/2] Generating Prisma Client...
call npx prisma generate
cd ..

echo.
echo === DB Sync Complete (Master: Prisma) ===
pause

