@echo off
echo ========================================
echo Kaduna Court Database Setup
echo ========================================
echo.

echo Step 1: Please enter your MySQL root password when prompted
echo.

REM Run the SQL schema
mysql -u root -p < database\schema.sql

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo Database setup complete!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Create .env file with your database credentials
    echo 2. Run: npm run create-admin
    echo 3. Run: npm run dev
    echo.
) else (
    echo.
    echo ========================================
    echo Error: Database setup failed!
    echo ========================================
    echo.
    echo Make sure:
    echo - MySQL is installed and running
    echo - MySQL root password is correct
    echo - You have permission to create databases
    echo.
)

pause
