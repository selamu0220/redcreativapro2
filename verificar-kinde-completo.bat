@echo off
chcp 65001 >nul
echo.
echo ═══════════════════════════════════════════════════════════════
echo 🔍 VERIFICACIÓN COMPLETA DE KINDE
echo ═══════════════════════════════════════════════════════════════
echo.

echo 📋 Este script te ayudará a verificar tu configuración de Kinde
echo.
pause

echo.
echo ═══════════════════════════════════════════════════════════════
echo PASO 1: Verificar configuración local
echo ═══════════════════════════════════════════════════════════════
echo.
node verificar-kinde-dashboard.js
echo.
pause

echo.
echo ═══════════════════════════════════════════════════════════════
echo PASO 2: Abrir Kinde Dashboard
echo ═══════════════════════════════════════════════════════════════
echo.
echo Se abrirá el dashboard de Kinde en tu navegador...
echo.
echo IMPORTANTE: Verifica lo siguiente:
echo.
echo 1. Estás en la aplicación "Red Creativa Pro"
echo 2. El Client ID es: 5065812b70004d75809f8d535cb0daa6
echo 3. En "Allowed callback URLs" están estas URLs:
echo    - https://redcreativa.pro/api/auth/kinde_callback
echo    - http://localhost:3000/api/auth/kinde_callback
echo.
echo 4. En "Allowed logout redirect URLs" están estas URLs:
echo    - https://redcreativa.pro
echo    - http://localhost:3000
echo.
pause

start https://app.kinde.com/

echo.
echo ═══════════════════════════════════════════════════════════════
echo PASO 3: Verificar y guardar en Kinde
echo ═══════════════════════════════════════════════════════════════
echo.
echo En el dashboard de Kinde que se acaba de abrir:
echo.
echo 1. Ve a Applications ^> Red Creativa Pro ^> Details
echo 2. Verifica el Client ID: 5065812b70004d75809f8d535cb0daa6
echo 3. Copia y pega estas URLs en "Allowed callback URLs":
echo.
echo    https://redcreativa.pro/api/auth/kinde_callback
echo    http://localhost:3000/api/auth/kinde_callback
echo.
echo 4. Copia y pega estas URLs en "Allowed logout redirect URLs":
echo.
echo    https://redcreativa.pro
echo    http://localhost:3000
echo.
echo 5. Haz clic en "Save" (arriba a la derecha)
echo 6. ESPERA a ver un mensaje de confirmación
echo 7. Refresca la página (F5)
echo 8. Verifica que las URLs siguen ahí
echo.
echo ¿Ya guardaste las URLs en Kinde y las verificaste?
pause

echo.
echo ═══════════════════════════════════════════════════════════════
echo PASO 4: Verificar Vercel
echo ═══════════════════════════════════════════════════════════════
echo.
echo Se abrirá el dashboard de Vercel...
echo.
echo Verifica que estas variables tengan HTTPS (no HTTP):
echo.
echo - KINDE_SITE_URL = https://redcreativa.pro
echo - KINDE_POST_LOGOUT_REDIRECT_URL = https://redcreativa.pro
echo - KINDE_POST_LOGIN_REDIRECT_URL = https://redcreativa.pro/dashboard
echo.
echo Si alguna tiene HTTP, cámbiala a HTTPS y haz un redeploy.
echo.
pause

start https://vercel.com/selamu0220s-projects/redcreativapro2/settings/environment-variables

echo.
echo ═══════════════════════════════════════════════════════════════
echo PASO 5: Probar el login
echo ═══════════════════════════════════════════════════════════════
echo.
echo Se abrirá tu sitio en producción...
echo.
echo 1. Haz clic en "Iniciar Sesión"
echo 2. Deberías ver la página de login de Kinde
echo 3. Inicia sesión con tu cuenta
echo 4. Deberías ser redirigido al dashboard
echo.
echo Si ves el error "Invalid callback URL":
echo - Vuelve al PASO 3 y verifica que las URLs se guardaron
echo - Espera 1-2 minutos y vuelve a intentar
echo - Prueba en modo incógnito (Ctrl+Shift+N)
echo.
pause

start https://redcreativa.pro

echo.
echo ═══════════════════════════════════════════════════════════════
echo ✅ VERIFICACIÓN COMPLETA
echo ═══════════════════════════════════════════════════════════════
echo.
echo Si el login funciona: ¡Felicidades! Todo está configurado.
echo.
echo Si el login NO funciona:
echo.
echo 1. Abre DevTools (F12) en el navegador
echo 2. Ve a la pestaña Console
echo 3. Busca errores en rojo
echo 4. Toma una captura de pantalla del error
echo 5. Toma una captura de pantalla del dashboard de Kinde
echo 6. Comparte ambas capturas para ayudarte mejor
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo Documentación adicional:
echo - DIAGNOSTICO_KINDE_CALLBACK.md
echo - CONFIGURACION_KINDE_COMPLETA.md
echo - CHECKLIST_FINAL_KINDE.md
echo.
pause
