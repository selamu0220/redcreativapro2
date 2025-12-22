@echo off
echo ========================================
echo Solucion Rapida del Sitemap
echo ========================================
echo.

echo [1/4] Verificando configuracion actual...
node check-domain-config.js
echo.

echo [2/4] Actualizando .env.local...
echo NEXT_PUBLIC_SITE_URL=https://www.redcreativa.pro >> .env.local
echo ✓ Variable agregada a .env.local
echo.

echo [3/4] Archivos ya actualizados:
echo ✓ app/sitemap.ts
echo ✓ app/robots.ts
echo ✓ vercel.json
echo.

echo [4/4] Preparando para commit...
git add .env.example
git add app/sitemap.ts
git add app/robots.ts
git add vercel.json
git add SOLUCION_SITEMAP_GOOGLE.md
git add RESUMEN_PROBLEMA_SITEMAP.md
git add verify-sitemap.js
git add check-domain-config.js
echo ✓ Archivos agregados al staging
echo.

echo ========================================
echo Siguiente paso:
echo ========================================
echo.
echo 1. Ejecuta: git commit -m "fix: configurar sitemap para usar www"
echo 2. Ejecuta: git push
echo 3. Espera 10 minutos para que Vercel redeploy
echo 4. Ejecuta: node verify-sitemap.js
echo 5. Actualiza Google Search Console con:
echo    https://www.redcreativa.pro/sitemap.xml
echo.
echo ========================================
pause
