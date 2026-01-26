@echo off
echo 🔧 Configurando Android SDK después de la instalación...
echo.

:: Esperar a que Android Studio termine de instalarse
echo ⏳ Esperando a que Android Studio complete la instalación...
timeout /t 30 /nobreak >nul

:: Verificar si Android Studio está instalado
set "ANDROID_STUDIO_PATH=C:\Program Files\Android\Android Studio"
if not exist "%ANDROID_STUDIO_PATH%" (
    echo ❌ Android Studio no encontrado en la ruta esperada
    echo 📍 Buscando en rutas alternativas...
    
    :: Buscar en Program Files (x86)
    set "ANDROID_STUDIO_PATH=C:\Program Files (x86)\Android\Android Studio"
    if not exist "%ANDROID_STUDIO_PATH%" (
        echo ❌ Android Studio no encontrado
        echo 💡 Por favor, ejecuta Android Studio manualmente para completar la configuración inicial
        pause
        exit /b 1
    )
)

echo ✅ Android Studio encontrado en: %ANDROID_STUDIO_PATH%

:: Configurar variables de entorno
echo 🔧 Configurando variables de entorno...

:: Configurar ANDROID_HOME
set "ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk"
setx ANDROID_HOME "%ANDROID_HOME%" >nul 2>&1

:: Actualizar PATH
echo 📝 Actualizando PATH...
for /f "tokens=2*" %%a in ('reg query "HKCU\Environment" /v PATH 2^>nul') do set "USER_PATH=%%b"

:: Agregar rutas del SDK al PATH si no existen
echo %USER_PATH% | findstr /C:"%ANDROID_HOME%\platform-tools" >nul
if errorlevel 1 (
    setx PATH "%USER_PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools;%ANDROID_HOME%\cmdline-tools\latest\bin" >nul 2>&1
    echo ✅ PATH actualizado
) else (
    echo ✅ PATH ya contiene las rutas del Android SDK
)

:: Actualizar local.properties
echo 📝 Actualizando local.properties...
set "LOCAL_PROPS=%~dp0android\local.properties"
echo # Android SDK location > "%LOCAL_PROPS%"
echo sdk.dir=%ANDROID_HOME:\=\\% >> "%LOCAL_PROPS%"
echo ✅ local.properties actualizado

:: Mostrar instrucciones finales
echo.
echo 🎉 ¡Configuración completada!
echo.
echo 📋 PRÓXIMOS PASOS:
echo 1. Abre Android Studio
echo 2. Sigue el asistente de configuración inicial
echo 3. Acepta todas las licencias del SDK
echo 4. Una vez completado, ejecuta: .\build-android.bat
echo.
echo 📍 ANDROID_HOME configurado en: %ANDROID_HOME%
echo 📍 Android Studio en: %ANDROID_STUDIO_PATH%
echo.
echo ⚠️  IMPORTANTE: Reinicia tu terminal después de abrir Android Studio
echo.

:: Preguntar si quiere abrir Android Studio
set /p "OPEN_STUDIO=¿Quieres abrir Android Studio ahora? (s/n): "
if /i "%OPEN_STUDIO%"=="s" (
    echo 🚀 Abriendo Android Studio...
    start "" "%ANDROID_STUDIO_PATH%\bin\studio64.exe"
    echo.
    echo 💡 Sigue el asistente de configuración y acepta las licencias
    echo 💡 Después ejecuta: .\build-android.bat
)

echo.
echo ✅ Script completado. ¡Listo para construir tu APK!
pause