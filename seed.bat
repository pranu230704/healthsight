@echo off
echo ========================================
echo HealthSight - Database Seeder
echo ========================================
echo.

echo This will populate the database with demo data:
echo - 3 Users (admin, doctor, staff)
echo - 3 Doctors
echo - 2 Patients  
echo - Sample appointments, billing, medications, and lab reports
echo.

pause

echo.
echo Seeding database...
echo.

npm run seed

echo.
echo ========================================
if errorlevel 1 (
    echo [ERROR] Database seeding failed!
    echo Make sure MongoDB is running.
) else (
    echo [SUCCESS] Database seeded successfully!
    echo.
    echo You can now start the server with: start.bat
    echo Or run: npm start
)
echo ========================================
echo.

pause
