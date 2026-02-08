@echo off
echo ==========================================
echo   Sentinel-Eye Intrusion Detection System
echo           Automated Demo Script
echo ==========================================
echo.

echo [1/4] Starting Laravel Backend Server...
start "Sentinel-Eye Backend" /D "backend" php artisan serve
timeout /t 5 >nul

echo [2/4] Starting WebSocket Server (Reverb)...
start "Sentinel-Eye Reverb" /D "backend" php artisan reverb:start
timeout /t 5 >nul

echo [3/4] Starting Threat Simulation (Mock Attacks)...
start "Sentinel-Eye Simulation" python simulate_attacks.py

echo [4/4] Launching War Room Dashboard...
echo Opening frontend/index.html in your default browser...
start "" "frontend\index.html"

echo.
echo ==========================================
echo   DEMO RUNNING!
echo   - Check the new CMD windows for logs
echo   - Check your browser for the dashboard
echo ==========================================
echo.
echo Press any key to stop all demo services...
pause >nul

echo.
echo Stopping services...
taskkill /IM php.exe /F >nul 2>&1
taskkill /IM python.exe /F >nul 2>&1

echo Done.
pause
