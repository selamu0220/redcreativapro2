@echo off
echo ========================================
echo FIX: Pagina en Blanco en Produccion
echo ========================================
echo.

echo Este script te guiara para solucionar el problema de pagina en blanco.
echo.

echo PASO 1: Verificar variables de entorno locales
echo -----------------------------------------------
node diagnose-blank-page.js
echo.

echo PASO 2: Instrucciones para Vercel
echo -----------------------------------
echo.
echo 1. Abre tu navegador y ve a: https://vercel.com/dashboard
echo 2. Selecciona tu proyecto
echo 3. Ve a Settings ^> Environment Variables
echo 4. Verifica que estas variables NO contengan "localhost":
echo.
echo    KINDE_SITE_URL
echo    KINDE_POST_LOGIN_REDIRECT_URL
echo    KINDE_POST_LOGOUT_REDIRECT_URL
echo.
echo 5. Si contienen localhost, cambialas a:
echo.
echo    KINDE_SITE_URL=https://redcreativa.pro
echo    KINDE_POST_LOGIN_REDIRECT_URL=https://redcreativa.pro/dashboard
echo    KINDE_POST_LOGOUT_REDIRECT_URL=https://redcreativa.pro
echo.
echo 6. Guarda los cambios
echo 7. Ve a Deployments y haz Redeploy
echo.

echo PASO 3: Actualizar Kinde Dashboard
echo ------------------------------------
echo.
echo 1. Ve a: https://selamu.kinde.com
echo 2. Ve a Settings ^> Applications
echo 3. Selecciona tu aplicacion
echo 4. En "Allowed callback URLs", agrega:
echo    https://redcreativa.pro/api/auth/kinde_callback
echo.
echo 5. En "Allowed logout redirect URLs", agrega:
echo    https://redcreativa.pro
echo.
echo 6. Guarda los cambios
echo.

echo PASO 4: Verificar en el navegador
echo -----------------------------------
echo.
echo 1. Abre https://redcreativa.pro en modo incognito
echo 2. Presiona F12 para abrir DevTools
echo 3. Ve a la pestana Console
echo 4. Busca errores en rojo
echo 5. Si hay errores, copia el mensaje y buscalo en Google
echo.

echo ========================================
echo Documentacion completa en:
echo FIX_PAGINA_BLANCO_PRODUCCION.md
echo ========================================
echo.

pause
