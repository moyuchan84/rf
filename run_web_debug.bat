@echo off
TITLE RFGo Web Full-Stack Debugger
SETLOCAL

echo [1/3] Checking Web Backend...
cd web-backend
if not exist node_modules (
    echo node_modules not found. Installing...
    call npm install
)
start "Web-Backend-Debug" cmd /k "npm run start:debug"

echo [2/3] Checking Web Frontend...
cd ../web-frontend
if not exist node_modules (
    echo node_modules not found. Installing...
    call npm install
)
start "Web-Frontend-Dev" cmd /k "npm run dev"

echo [3/3] Ready! 
echo Backend: http://localhost:9999/graphql
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this manager (Servers will keep running in separate windows).
pause > size
