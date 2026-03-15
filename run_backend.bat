@echo off
echo Starting RFGo PhotoKey Backend...
cd backend
call uv run uvicorn app.main:app --reload --port 8080
pause
