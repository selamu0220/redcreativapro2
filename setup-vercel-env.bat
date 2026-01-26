@echo off
REM Script para configurar variables de entorno de Kinde en Vercel
REM Requiere: vercel CLI instalado (npm i -g vercel)

echo.
echo ================================
echo Configurando Kinde en Vercel
echo ================================
echo.

REM Variables de Kinde para produccion
set KINDE_CLIENT_ID=5065812b70004d75809f8d535cb0daa6
set KINDE_CLIENT_SECRET=KzUrUzfBKlHWq0n7GPmOOEO2IjzHGB3z8I3K6yDVaxr03wCfE42
set KINDE_ISSUER_URL=https://selamu.kinde.com
set KINDE_SITE_URL=https://redcreativa.pro
set KINDE_POST_LOGOUT_REDIRECT_URL=https://redcreativa.pro
set KINDE_POST_LOGIN_REDIRECT_URL=https://redcreativa.pro/dashboard

echo Este script configurara las siguientes variables en Vercel:
echo   - KINDE_CLIENT_ID
echo   - KINDE_CLIENT_SECRET
echo   - KINDE_ISSUER_URL
echo   - KINDE_SITE_URL
echo   - KINDE_POST_LOGOUT_REDIRECT_URL
echo   - KINDE_POST_LOGIN_REDIRECT_URL
echo.

set /p CONFIRM="Continuar? (S/N): "
if /i not "%CONFIRM%"=="S" (
    echo Cancelado
    exit /b 1
)

REM Verificar si vercel CLI esta instalado
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: vercel CLI no esta instalado
    echo Instalalo con: npm i -g vercel
    exit /b 1
)

echo.
echo Configurando variables...
echo.

REM Configurar variables en Vercel (solo produccion)
echo %KINDE_CLIENT_ID% | vercel env add KINDE_CLIENT_ID production
echo %KINDE_CLIENT_SECRET% | vercel env add KINDE_CLIENT_SECRET production
echo %KINDE_ISSUER_URL% | vercel env add KINDE_ISSUER_URL production
echo %KINDE_SITE_URL% | vercel env add KINDE_SITE_URL production
echo %KINDE_POST_LOGOUT_REDIRECT_URL% | vercel env add KINDE_POST_LOGOUT_REDIRECT_URL production
echo %KINDE_POST_LOGIN_REDIRECT_URL% | vercel env add KINDE_POST_LOGIN_REDIRECT_URL production

echo.
echo ================================
echo Variables configuradas correctamente
echo ================================
echo.
echo Proximos pasos:
echo 1. Ve a Kinde Dashboard (https://selamu.kinde.com)
echo 2. Agrega las callback URLs:
echo    - https://redcreativa.pro/api/auth/kinde_callback
echo 3. Agrega las logout redirect URLs:
echo    - https://redcreativa.pro
echo 4. Redeploy tu aplicacion en Vercel
echo.
echo Lee KINDE_SETUP_COMPLETO.md para mas detalles
echo.
pause
