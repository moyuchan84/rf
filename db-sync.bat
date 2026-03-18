@echo off
SETLOCAL
SET "MIG_NAME=%~1"

IF "%MIG_NAME%"=="" (
    SET /P MIG_NAME="Enter migration name (e.g., add_log_column): "
)

echo ======================================================
echo [1/2] Syncing NestJS (Prisma)
echo ======================================================
pushd web-backend
call npx prisma migrate dev --name %MIG_NAME%
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Prisma migration failed.
    popd
    goto :error
)
call npx prisma generate
popd

echo.
echo ======================================================
echo [2/2] Syncing FastAPI (SQLAlchemy/Alembic)
echo ======================================================
pushd backend
IF NOT EXIST .venv\Scripts\activate (
    echo [ERROR] Virtual environment not found in backend/.venv
    popd
    goto :error
)
call .venv\Scripts\activate

echo [Alembic] Upgrading database to current head...
call alembic upgrade head
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Initial Alembic upgrade failed.
    call deactivate
    popd
    goto :error
)

echo [Alembic] Generating new revision: %MIG_NAME%...
call alembic revision --autogenerate -m "%MIG_NAME%"
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Alembic revision generation failed.
    call deactivate
    popd
    goto :error
)

echo [Alembic] Applying new revision to database...
call alembic upgrade head
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Final Alembic upgrade failed.
    call deactivate
    popd
    goto :error
)
call deactivate
popd

echo.
echo ======================================================
echo SUCCESS: All DB/ORM updates completed!
echo ======================================================
pause
exit /b 0

:error
echo.
echo [FAILURE] Database synchronization stopped due to errors.
pause
exit /b 1
