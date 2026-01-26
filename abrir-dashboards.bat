@echo off
echo ========================================
echo Abriendo Dashboards para Configuracion
echo ========================================
echo.

echo 1. Abriendo Kinde Dashboard...
start https://app.kinde.com/

timeout /t 2 /nobreak >nul

echo 2. Abriendo Vercel Environment Variables...
start https://vercel.com/selamu0220s-projects/redcreativapro2/settings/environment-variables

timeout /t 2 /nobreak >nul

echo 3. Abriendo tu sitio en produccion...
start https://redcreativa.pro

echo.
echo ========================================
echo Dashboards abiertos!
echo ========================================
echo.
echo Sigue estos pasos:
echo.
echo PASO 1 - Kinde Dashboard:
echo   - Applications ^> Red Creativa Pro
echo   - Agregar callback URLs
echo   - Agregar logout URLs
echo   - Hacer clic en "Save"
echo.
echo PASO 2 - Vercel:
echo   - Verificar que las 3 variables usen https://
echo   - Hacer Redeploy
echo.
echo PASO 3 - Probar:
echo   - Ir a tu sitio
echo   - Hacer clic en "Iniciar Sesion"
echo   - Deberia funcionar!
echo.
echo Ver guia completa: PASOS_FINALES_5_MINUTOS.md
echo.

pause
