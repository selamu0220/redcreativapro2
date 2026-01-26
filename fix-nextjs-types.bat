@echo off
echo ========================================
echo Fixing Next.js Type Generation Issues
echo ========================================
echo.
echo This script will:
echo - Stop all Node.js processes
echo - Delete the .next folder
echo - Clear caches
echo - Force Next.js to regenerate types cleanly
echo.
pause

echo.
echo Step 1: Stopping any running Next.js processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo Node processes stopped
    timeout /t 3 /nobreak >nul
) else (
    echo No Node processes found running
)

echo.
echo Step 2: Deleting .next folder...
if exist .next (
    rmdir /s /q .next
    if %errorlevel% equ 0 (
        echo .next folder deleted successfully
    ) else (
        echo ERROR: Could not delete .next folder. Close all editors and try again.
        pause
        exit /b 1
    )
) else (
    echo .next folder not found (already clean)
)

echo.
echo Step 3: Clearing npm cache...
call npm cache clean --force

echo.
echo Step 4: Deleting node_modules/.cache if it exists...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo Cache deleted successfully
) else (
    echo Cache folder not found (already clean)
)

echo.
echo Step 5: Deleting TypeScript build info...
if exist tsconfig.tsbuildinfo (
    del /f /q tsconfig.tsbuildinfo
    echo Build info deleted
)

echo.
echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo IMPORTANT: Next steps to fix the issue:
echo.
echo 1. Close this window
echo 2. In your terminal, run: npm run dev
echo 3. Wait for "compiled successfully" message
echo 4. The TypeScript errors should be gone
echo.
echo If errors STILL persist after restart:
echo - Check for syntax errors in app/escritor-ia/page.tsx
echo - Check for syntax errors in app/correosia/[userEmail]/page.tsx
echo - Look for any unusual characters in route folder names
echo.
pause
