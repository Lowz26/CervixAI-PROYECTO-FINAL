@echo off
echo =========================================
echo       Iniciando CervixAI System
echo =========================================

echo Iniciando servidor Backend (Express)...
start "Backend - Node" cmd /c "cd backend && npm start"

echo Iniciando servidor Frontend (Angular)...
start "Frontend - Angular" cmd /c "cd frontend && npm start"

echo Iniciando servidor Inteligencia Artificial (FastAPI)...
start "IA - Python" cmd /c "cd backend && python -m uvicorn main:app --port 8000"

echo.
echo Los servidores se estan iniciando en nuevas ventanas.
echo Backend Node: http://localhost:4000
echo Backend IA: http://localhost:8000
echo Frontend: http://localhost:4200
echo =========================================
pause
