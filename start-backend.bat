@echo off
echo Starting Backend Server...
cd /d "%~dp0backend"
node server.js
pause
