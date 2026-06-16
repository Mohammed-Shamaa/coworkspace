@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ===== Coworkspace Development Server =====
echo.

REM Step 1: Kill orphaned backend processes
echo [1] Killing orphaned backend processes...
for /f "tokens=2" %%a in ('tasklist /fi "imagename eq dotnet.exe" /nh 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo   Done.

REM Step 2: Check port 5000
echo [2] Checking port 5000...
set PORT=5000
netstat -ano | findstr ":5000 " >nul 2>&1
if not errorlevel 1 (
    echo   Port 5000 is in use, trying 5001...
    netstat -ano | findstr ":5001 " >nul 2>&1
    if not errorlevel 1 (
        echo   Port 5001 is also in use, trying 5002...
        set PORT=5002
    ) else (
        set PORT=5001
    )
)
echo   Using port %PORT%

REM Step 3: Start backend
echo [3] Starting backend on http://localhost:%PORT% ...
start "Coworkspace Backend" /MIN cmd /c "cd /d backend && dotnet run --project Coworkspace.API.csproj --urls http://localhost:%PORT%"

REM Wait for backend
echo   Waiting for backend...
:waitloop
timeout /t 3 /nobreak >nul
curl -s http://localhost:%PORT%/api/health >nul 2>&1
if errorlevel 1 goto waitloop
echo   Backend is ready!

REM Step 4: Start frontend
echo [4] Starting frontend on http://localhost:3000 ...
set API_BACKEND_URL=http://localhost:%PORT%
start "Coworkspace Frontend" /MIN cmd /c "cd /d frontend && npm run dev"

REM Step 5: Done
echo.
echo ===== Summary =====
echo   Backend:  http://localhost:%PORT%
echo   Frontend: http://localhost:3000
echo.
echo Close the server windows or use Task Manager to stop.
echo.
pause
