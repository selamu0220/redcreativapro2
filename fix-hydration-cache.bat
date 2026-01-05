@echo off
echo Fixing hydration error by clearing all caches...

echo.
echo Step 1: Stopping any running dev servers...
taskkill /F /IM node.exe 2>nul

echo.
echo Step 2: Removing .next cache...
if exist .next rmdir /s /q .next

echo.
echo Step 3: Clearing node_modules/.cache...
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo Step 4: Done! Now restart your dev server with: npm run dev

echo.
pause
