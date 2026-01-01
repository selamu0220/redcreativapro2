@echo off
echo.
echo ========================================
echo   DESPLIEGUE DE CORRECCIONES
echo ========================================
echo.

echo [1/4] Verificando cambios...
git status
echo.

echo [2/4] Agregando archivos modificados...
git add app/dashboard/page.tsx
git add app/components/ErrorBoundary.tsx
git add app/components/WorkingAuthProvider.tsx
git add app/components/Providers.tsx
git add .env.local
echo ✓ Archivos agregados
echo.

echo [3/4] Creando commit...
git commit -m "Fix: Resolver error de hidratación React #310 en dashboard y auth"
echo ✓ Commit creado
echo.

echo [4/4] Desplegando a producción...
git push origin main
echo.

echo ========================================
echo   DESPLIEGUE COMPLETADO
echo ========================================
echo.
echo Vercel desplegará automáticamente los cambios.
echo Espera 2-3 minutos y verifica: https://redcreativa.pro/dashboard
echo.
pause
