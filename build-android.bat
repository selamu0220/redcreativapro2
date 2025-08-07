@echo off
echo ========================================
echo    CONSTRUCCION DE APLICACION ANDROID
echo ========================================
echo.

REM Buscar Android Studio y su JDK
set ANDROID_STUDIO_FOUND=0
set JAVA_FOUND=0

echo Buscando Android Studio...

REM Verificar ubicaciones comunes de Android Studio
if exist "%LOCALAPPDATA%\Android\Sdk" (
    set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
    echo Android SDK encontrado en: %ANDROID_HOME%
    set ANDROID_STUDIO_FOUND=1
)

if exist "%USERPROFILE%\AppData\Local\Android\Sdk" (
    set "ANDROID_HOME=%USERPROFILE%\AppData\Local\Android\Sdk"
    echo Android SDK encontrado en: %ANDROID_HOME%
    set ANDROID_STUDIO_FOUND=1
)

REM Buscar JDK de Android Studio
if exist "C:\Program Files\Android\Android Studio\jbr" (
    set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
    set JAVA_FOUND=1
    echo JDK de Android Studio encontrado: %JAVA_HOME%
)

if exist "C:\Program Files\Android\Android Studio\jre" (
    set "JAVA_HOME=C:\Program Files\Android\Android Studio\jre"
    set JAVA_FOUND=1
    echo JRE de Android Studio encontrado: %JAVA_HOME%
)

REM Buscar otras instalaciones de Java
if %JAVA_FOUND%==0 (
    echo Buscando otras instalaciones de Java...
    
    if exist "C:\Program Files\Java\jdk*" (
        for /d %%i in ("C:\Program Files\Java\jdk*") do (
            set "JAVA_HOME=%%i"
            set JAVA_FOUND=1
            echo Java encontrado: %%i
            goto :java_found
        )
    )
    
    if exist "C:\Program Files\Microsoft\jdk*" (
        for /d %%i in ("C:\Program Files\Microsoft\jdk*") do (
            set "JAVA_HOME=%%i"
            set JAVA_FOUND=1
            echo Java de Microsoft encontrado: %%i
            goto :java_found
        )
    )
)

:java_found

if %JAVA_FOUND%==0 (
    echo.
    echo ❌ ERROR: Java JDK no encontrado
    echo.
    echo SOLUCION:
    echo 1. Instala Android Studio desde: https://developer.android.com/studio
    echo 2. O instala Java JDK 17 desde: https://adoptium.net/temurin/releases/
    echo.
    echo Android Studio incluye todo lo necesario para desarrollo Android.
    echo.
    pause
    exit /b 1
)

if %ANDROID_STUDIO_FOUND%==0 (
    echo.
    echo ⚠️  ADVERTENCIA: Android SDK no encontrado
    echo Se recomienda instalar Android Studio para desarrollo completo.
    echo.
)

REM Configurar variables de entorno para esta sesion
set "PATH=%JAVA_HOME%\bin;%PATH%"
if defined ANDROID_HOME (
    set "PATH=%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools;%PATH%"
)

echo.
echo ========================================
echo Verificando herramientas...
echo ========================================

REM Verificar Java
echo Verificando Java...
"%JAVA_HOME%\bin\java" -version
if %ERRORLEVEL% neq 0 (
    echo ❌ Error: Java no funciona correctamente
    pause
    exit /b 1
)

echo ✅ Java configurado correctamente
echo.

echo ========================================
echo Iniciando construccion...
echo ========================================
echo.

REM Paso 1: Construir aplicacion web
echo 📦 Paso 1: Construyendo aplicacion web...
call npm run build:ionic
if %ERRORLEVEL% neq 0 (
    echo ❌ Error en la construccion web
    pause
    exit /b 1
)
echo ✅ Construccion web completada
echo.

REM Paso 2: Sincronizar con Capacitor
echo 🔄 Paso 2: Sincronizando con Capacitor...
call npx cap sync android
if %ERRORLEVEL% neq 0 (
    echo ❌ Error en sincronizacion de Capacitor
    pause
    exit /b 1
)
echo ✅ Sincronizacion completada
echo.

REM Paso 3: Construir APK
echo 🏗️  Paso 3: Construyendo APK de Android...
call npx cap build android
if %ERRORLEVEL% neq 0 (
    echo ❌ Error en construccion de Android
    echo.
    echo POSIBLES SOLUCIONES:
    echo 1. Asegurate de que Android Studio este instalado
    echo 2. Acepta las licencias de Android SDK ejecutando:
    echo    %%ANDROID_HOME%%\tools\bin\sdkmanager --licenses
    echo 3. Verifica que tengas las herramientas de construccion instaladas
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ CONSTRUCCION COMPLETADA EXITOSAMENTE
echo ========================================
echo.
echo El APK se encuentra en:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo Para instalar en dispositivo:
echo adb install android\app\build\outputs\apk\debug\app-debug.apk
echo.
pause