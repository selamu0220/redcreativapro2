@echo off
echo 🚀 Forzando rebuild completo en Vercel...
echo.

echo Step 1: Agregando cambio para forzar rebuild...
echo. >> .vercelignore
git add .
git commit -m "fix: resolve hydration mismatch in AuthAwareNav - force rebuild"

echo.
echo Step 2: Desplegando a producción con --force...
vercel --prod --force

echo.
echo ✅ Despliegue completado
pause
