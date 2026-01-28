@echo off
echo Starting Phone Directory Project...
echo.
echo Starting Backend on http://localhost:5000 ...
start "Backend Server" cmd /k "cd /d "%~dp0backend" && node server.js"
timeout /t 3 /nobreak >nul
echo Starting Frontend on http://localhost:3000 ...
start "Frontend Server" cmd /k "cd /d "%~dp0frontend" && npm run dev"
echo.
echo Both servers are starting!
echo - Backend:  http://localhost:5000
echo - Frontend: http://localhost:3000
echo.
echo Open http://localhost:3000 in your browser when ready.
pause
