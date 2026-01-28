@echo off
echo ========================================
echo   Phone Directory - Build and Run
echo ========================================
echo.

echo [1/2] Building frontend...
cd /d "%~dp0frontend"
call npm run build
if errorlevel 1 (
    echo.
    echo ERROR: Frontend build failed.
    pause
    exit /b 1
)

echo.
echo [2/2] Starting backend (serves API + frontend build)...
cd /d "%~dp0backend"
echo.
echo Backend + frontend will run on http://localhost:5000
echo Open http://localhost:5000 in your browser.
echo.
node server.js

pause
