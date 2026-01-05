@echo off
echo ========================================
echo CONFIGURAR VARIABLES DE KINDE EN VERCEL
echo ========================================
echo.
echo Este script te ayudara a configurar las variables de entorno de Kinde en Vercel.
echo.
echo PASO 1: Configurar variables en Vercel CLI
echo.

vercel env add KINDE_CLIENT_ID production
vercel env add KINDE_CLIENT_SECRET production
vercel env add KINDE_ISSUER_URL production
vercel env add KINDE_SITE_URL production
vercel env add KINDE_POST_LOGOUT_REDIRECT_URL production
vercel env add KINDE_POST_LOGIN_REDIRECT_URL production

echo.
echo ========================================
echo VALORES RECOMENDADOS:
echo ========================================
echo KINDE_CLIENT_ID: 5065812b70004d75809f8d535cb0daa6
echo KINDE_CLIENT_SECRET: KzUrUzfBKlHWq0n7GPmOOEO2IjzHGB3z8I3K6yDVaxr03wCfE42
echo KINDE_ISSUER_URL: https://selamu.kinde.com
echo KINDE_SITE_URL: https://redcreativa.pro
echo KINDE_POST_LOGOUT_REDIRECT_URL: https://redcreativa.pro
echo KINDE_POST_LOGIN_REDIRECT_URL: https://redcreativa.pro/dashboard
echo.
echo ========================================
echo PASO 2: Redesplegar
echo ========================================
echo.
pause
vercel --prod --yes
