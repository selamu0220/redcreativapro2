@echo off
echo ========================================
echo   OPTIMIZACION DE RENDIMIENTO
echo ========================================
echo.

echo [1/4] Limpiando cache...
if exist .next rmdir /s /q .next
if exist .turbo rmdir /s /q .turbo
echo ✓ Cache limpiado

echo.
echo [2/4] Verificando optimizaciones...
node scripts/performance-check.js

echo.
echo [3/4] Construyendo version optimizada...
call npm run build

echo.
echo [4/4] Listo!
echo.
echo ========================================
echo   OPTIMIZACION COMPLETADA
echo ========================================
echo.
echo Puedes iniciar el servidor con:
echo   npm start
echo.
echo O ejecutar Lighthouse con:
echo   npm run lighthouse
echo.
pause
