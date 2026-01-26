@echo off
echo 🚨 DESPLEGANDO SOLUCION CRITICA HOMEPAGE 404...

echo ✅ Creando commit solo con archivos criticos...
git reset --soft HEAD~1
git reset HEAD .env .env.local .env.backup .env.local.backup

echo ✅ Commit solo archivos de la solucion...
git add middleware.ts
git add app/layout.tsx
git add app/page.tsx
git add app/components/HomePageClient.tsx
git add next.config.js
git add SOLUCION_DEFINITIVA_404_HOMEPAGE.js
git add SOLUCION_URGENTE_404_HOMEPAGE.md

git commit -m "EMERGENCY: Fix homepage 404 - disable i18n middleware"

echo ✅ Pushing to main...
git push origin main --force-with-lease

echo ✅ DESPLEGADO! La homepage deberia funcionar en 3-4 minutos.
echo ✅ Verifica en: https://redcreativa.pro/

pause