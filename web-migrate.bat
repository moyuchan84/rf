@echo off
echo ==========================================
echo   Web Backend Prisma Migration Start
echo ==========================================
echo.

cd web-backend

echo [1/2] Generating Prisma Client...
call npx prisma generate

echo.
echo [2/2] Running Prisma Migration...
call npx prisma migrate dev --name auto_migration

echo.
echo ==========================================
echo   Migration Completed Successfully!
echo ==========================================
pause
