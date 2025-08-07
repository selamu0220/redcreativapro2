@echo off
echo ========================================
echo    Construyendo APK de Escritor IA
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

echo Construyendo APK de debug...
npx cap build android
if %errorlevel% neq 0 (
    echo ERROR: Fallo al construir APK
    echo Verifica que Android Studio este instalado y configurado
    pause
    exit /b 1
)

echo.
echo ========================================
echo           ¡APK CONSTRUIDO!
echo ========================================
echo.
echo El APK se encuentra en:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo Puedes instalar este archivo en tu dispositivo Android
echo.
pause