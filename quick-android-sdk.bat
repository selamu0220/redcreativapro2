@echo off
echo 🚀 Instalación rápida de Android SDK (solo herramientas esenciales)
echo.

:: Crear directorios
set "ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk"
echo 📁 Creando directorios del SDK...
if not exist "%ANDROID_HOME%" mkdir "%ANDROID_HOME%"
if not exist "%ANDROID_HOME%\cmdline-tools" mkdir "%ANDROID_HOME%\cmdline-tools"

:: Descargar SDK Command Line Tools
echo ⬇️ Descargando Android SDK Command Line Tools...
set "TEMP_DIR=%TEMP%\android-sdk-temp"
if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"

:: URL de descarga directa
set "SDK_URL=https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
set "ZIP_FILE=%TEMP_DIR%\commandlinetools.zip"

echo 📥 Descargando desde: %SDK_URL%
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%SDK_URL%' -OutFile '%ZIP_FILE%' -UseBasicParsing}"

if not exist "%ZIP_FILE%" (
    echo ❌ Error al descargar el SDK
    echo 💡 Solución alternativa: Instala Android Studio manualmente
    echo 🔗 https://developer.android.com/studio
    pause
    exit /b 1
)

echo ✅ Descarga completada

:: Extraer archivos
echo 📦 Extrayendo archivos...
powershell -Command "& {Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('%ZIP_FILE%', '%TEMP_DIR%')}"

:: Mover a la ubicación correcta
echo 📂 Configurando estructura de directorios...
if exist "%TEMP_DIR%\cmdline-tools" (
    if exist "%ANDROID_HOME%\cmdline-tools\latest" rmdir /s /q "%ANDROID_HOME%\cmdline-tools\latest"
    move "%TEMP_DIR%\cmdline-tools" "%ANDROID_HOME%\cmdline-tools\latest"
    echo ✅ Herramientas instaladas
) else (
    echo ❌ Error al extraer las herramientas
    exit /b 1
)

:: Configurar variables de entorno
echo 🔧 Configurando variables de entorno...
setx ANDROID_HOME "%ANDROID_HOME%" >nul 2>&1

:: Actualizar PATH
for /f "tokens=2*" %%a in ('reg query "HKCU\Environment" /v PATH 2^>nul') do set "USER_PATH=%%b"
setx PATH "%USER_PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin" >nul 2>&1

:: Actualizar variables para la sesión actual
set "PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin"

:: Instalar componentes esenciales
echo 📱 Instalando componentes esenciales del SDK...
set "SDKMANAGER=%ANDROID_HOME%\cmdline-tools\latest\bin\sdkmanager.bat"

if exist "%SDKMANAGER%" (
    echo 📋 Aceptando licencias...
    echo y | "%SDKMANAGER%" --licenses >nul 2>&1
    
    echo 📦 Instalando platform-tools...
    "%SDKMANAGER%" "platform-tools" >nul 2>&1
    
    echo 📦 Instalando build-tools...
    "%SDKMANAGER%" "build-tools;34.0.0" >nul 2>&1
    
    echo 📦 Instalando Android API 34...
    "%SDKMANAGER%" "platforms;android-34" >nul 2>&1
    
    echo ✅ Componentes instalados
) else (
    echo ❌ Error: No se encontró sdkmanager
)

:: Actualizar local.properties
echo 📝 Actualizando local.properties...
set "LOCAL_PROPS=%~dp0android\local.properties"
echo # Android SDK location > "%LOCAL_PROPS%"
echo sdk.dir=%ANDROID_HOME:\=\\% >> "%LOCAL_PROPS%"

:: Limpiar archivos temporales
echo 🧹 Limpiando archivos temporales...
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"

echo.
echo 🎉 ¡Android SDK configurado exitosamente!
echo.
echo 📍 ANDROID_HOME: %ANDROID_HOME%
echo 📍 SDK Manager: %SDKMANAGER%
echo.
echo ⚠️  IMPORTANTE: Reinicia tu terminal para que las variables surtan efecto
echo.
echo 🔄 Para construir el APK ahora, ejecuta:
echo    .\build-android.bat
echo.
pause