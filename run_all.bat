@echo off
echo ====================================================================
echo  AI SMART LOGISTICS & ACCESSIBILITY INTELLIGENCE PLATFORM (NER)
echo  Smart India Hackathon 2026 - Production MVP
echo ====================================================================
echo.

set PATH=C:\Program Files\nodejs;C:\Users\babua\AppData\Local\Programs\nodejs;%PATH%

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "NER Logistics Backend (FastAPI)" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 >nul

echo [2/2] Starting React + Vite Frontend on http://127.0.0.1:5173 ...
start "NER Logistics Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Application successfully launched!
echo - Frontend: http://127.0.0.1:5173
echo - Backend & Swagger Docs: http://127.0.0.1:8000/docs
echo - Demo Account: admin@nerlogistics.gov.in / admin123
echo.
pause
