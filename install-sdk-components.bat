@echo off
echo ========================================
echo   INSTALANDO COMPONENTES ANDROID SDK
echo ========================================

set ANDROID_HOME=C:\Users\programar\AppData\Local\Android\Sdk
set CMDLINE_TOOLS=%ANDROID_HOME%\cmdline-tools\latest\bin

REM Crear estructura de directorios necesaria
mkdir "%ANDROID_HOME%\cmdline-tools\latest\bin" 2>nul
mkdir "%ANDROID_HOME%\platforms" 2>nul
mkdir "%ANDROID_HOME%\build-tools" 2>nul
mkdir "%ANDROID_HOME%\platform-tools" 2>nul

echo ✅ Directorios creados

REM Descargar herramientas de línea de comandos si no existen
if not exist "%CMDLINE_TOOLS%\sdkmanager.bat" (
    echo 📥 Descargando Android SDK Command Line Tools...
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip' -OutFile '%TEMP%\commandlinetools.zip'}"
    
    if exist "%TEMP%\commandlinetools.zip" (
        echo 📦 Extrayendo herramientas...
        powershell -Command "Expand-Archive -Path '%TEMP%\commandlinetools.zip' -DestinationPath '%ANDROID_HOME%\cmdline-tools\temp' -Force"
        move "%ANDROID_HOME%\cmdline-tools\temp\cmdline-tools" "%ANDROID_HOME%\cmdline-tools\latest"
        rmdir /s /q "%ANDROID_HOME%\cmdline-tools\temp"
        del "%TEMP%\commandlinetools.zip"
        echo ✅ Herramientas extraídas
    ) else (
        echo ❌ Error descargando herramientas
        goto :manual_solution
    )
)

REM Verificar si sdkmanager existe
if exist "%CMDLINE_TOOLS%\sdkmanager.bat" (
    echo 🔧 Instalando componentes del SDK...
    
    REM Aceptar licencias primero
    echo y | "%CMDLINE_TOOLS%\sdkmanager.bat" --licenses
    
    REM Instalar componentes esenciales
    "%CMDLINE_TOOLS%\sdkmanager.bat" "platform-tools" "build-tools;34.0.0" "platforms;android-34" "platforms;android-35"
    
    echo ✅ Componentes instalados
) else (
    goto :manual_solution
)

echo.
echo ========================================
echo   INSTALACION COMPLETADA
echo ========================================
echo SDK Path: %ANDROID_HOME%
echo.
echo Componentes instalados:
dir "%ANDROID_HOME%" /b
echo.
goto :end

:manual_solution
echo.
echo ========================================
echo   SOLUCION MANUAL REQUERIDA
echo ========================================
echo.
echo Por favor, instala Android Studio desde:
echo https://developer.android.com/studio
echo.
echo O descarga manualmente las herramientas desde:
echo https://developer.android.com/studio#command-tools
echo.

:end
pause