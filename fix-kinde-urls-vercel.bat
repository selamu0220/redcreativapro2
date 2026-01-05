@echo off
echo 🔧 Actualizando URLs de Kinde en Vercel...
echo.

echo Configurando KINDE_SITE_URL...
vercel env add KINDE_SITE_URL production
echo https://redcreativa.pro

echo.
echo Configurando KINDE_POST_LOGOUT_REDIRECT_URL...
vercel env add KINDE_POST_LOGOUT_REDIRECT_URL production
echo https://redcreativa.pro

echo.
echo Configurando KINDE_POST_LOGIN_REDIRECT_URL...
vercel env add KINDE_POST_LOGIN_REDIRECT_URL production
echo https://redcreativa.pro/dashboard

echo.
echo ✅ Variables actualizadas. Ahora redeploy...
vercel --prod

pause
