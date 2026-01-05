@echo off
echo ========================================
echo Verificando variables de Vercel
echo ========================================
echo.

echo Listando variables de entorno del proyecto...
echo.

vercel env ls

echo.
echo ========================================
echo Para agregar/actualizar variables:
echo ========================================
echo.
echo 1. Ve a: https://vercel.com/selamu0220s-projects/redcreativapro2/settings/environment-variables
echo 2. O usa: vercel env add KINDE_SITE_URL
echo.
echo Variables que deben estar configuradas:
echo - KINDE_CLIENT_ID
echo - KINDE_CLIENT_SECRET
echo - KINDE_ISSUER_URL
echo - KINDE_SITE_URL (debe ser https://redcreativa.pro)
echo - KINDE_POST_LOGOUT_REDIRECT_URL (debe ser https://redcreativa.pro)
echo - KINDE_POST_LOGIN_REDIRECT_URL (debe ser https://redcreativa.pro/dashboard)
echo.

pause
