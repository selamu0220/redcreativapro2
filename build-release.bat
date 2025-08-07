@echo off
echo ========================================
echo   Construyendo APK de Release - Escritor IA
echo ========================================
echo.

echo Verificando requisitos...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Java no esta instalado o no esta en el PATH
    echo Por favor instala JDK 11+ desde: https://adoptium.net/temurin/releases/
    pause
    exit /b 1
)

echo Java encontrado ✓
echo.

echo Sincronizando archivos web con Android...
npx cap sync android
if %errorlevel% neq 0 (
    echo ERROR: Fallo al sincronizar archivos
    pause
    exit /b 1
)

echo Sincronizacion completada ✓
echo.

echo Navegando al directorio Android...
cd android
if %errorlevel% neq 0 (
    echo ERROR: No se encontro el directorio android
    pause
    exit /b 1
)

echo Construyendo APK de release...
.\gradlew assembleRelease
if %errorlevel% neq 0 (
    echo ERROR: Fallo al construir APK de release
    echo Verifica que Android Studio este instalado y configurado
    cd ..
    pause
    exit /b 1
)

cd ..
echo.
echo ========================================
echo        ¡APK DE RELEASE CONSTRUIDO!
echo ========================================
echo.
echo El APK se encuentra en:
echo android\app\build\outputs\apk\release\app-release.apk
echo.
echo IMPORTANTE: Este APK necesita estar firmado para distribucion
echo Consulta la guia BUILD_APK_GUIDE.md para mas informacion
echo.
pause