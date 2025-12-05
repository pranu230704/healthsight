@echo off
echo ========================================
echo HealthSight - Hospital Management System
echo ========================================
echo.

echo Checking MongoDB...
mongod --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] MongoDB is not installed!
    echo.
    echo Please install MongoDB first:
    echo 1. Download from: https://www.mongodb.com/try/download/community
    echo 2. Or run: choco install mongodb
    echo.
    echo After installing, run this script again.
    pause
    exit /b 1
)

echo [OK] MongoDB is installed
echo.

echo Starting MongoDB service...
net start MongoDB >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Could not start MongoDB service
    echo MongoDB might already be running or you need Administrator privileges
    echo.
)

echo.
echo Starting HealthSight Backend Server...
echo.
echo Server will start at: http://localhost:3000
echo Login page will open automatically
echo.
echo Demo Credentials:
echo   Admin:  admin / admin123
echo   Doctor: doctor / doctor123
echo   Staff:  staff / staff123
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

start http://localhost:3000

npm start
