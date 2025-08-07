# Android SDK Setup Script - Simplified Version
# This script helps set up Android SDK for building APKs

Write-Host "🔧 Configurando Android SDK..." -ForegroundColor Green

# Define paths
$androidHome = "C:\Users\programar\AppData\Local\Android\Sdk"
$tempDir = "C:\temp\android-sdk-setup"

# Create directories
Write-Host "📁 Creando directorios..." -ForegroundColor Yellow
if (!(Test-Path $androidHome)) {
    New-Item -ItemType Directory -Force -Path $androidHome | Out-Null
}
if (!(Test-Path "$androidHome\cmdline-tools")) {
    New-Item -ItemType Directory -Force -Path "$androidHome\cmdline-tools" | Out-Null
}
if (!(Test-Path $tempDir)) {
    New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
}

# Download Android SDK Command Line Tools
$sdkUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
$zipFile = "$tempDir\commandlinetools.zip"

Write-Host "⬇️ Descargando Android SDK Command Line Tools..." -ForegroundColor Yellow
Write-Host "URL: $sdkUrl" -ForegroundColor Gray
Write-Host "Destino: $zipFile" -ForegroundColor Gray

try {
    # Use System.Net.WebClient for better compatibility
    $webClient = New-Object System.Net.WebClient
    $webClient.DownloadFile($sdkUrl, $zipFile)
    Write-Host "✅ Descarga completada" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al descargar: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "" 
    Write-Host "🔧 SOLUCIÓN ALTERNATIVA:" -ForegroundColor Yellow
    Write-Host "1. Descarga manualmente Android Studio desde: https://developer.android.com/studio" -ForegroundColor White
    Write-Host "2. Instala Android Studio y acepta las licencias" -ForegroundColor White
    Write-Host "3. El SDK se instalará automáticamente en: C:\Users\programar\AppData\Local\Android\Sdk" -ForegroundColor White
    Write-Host "4. Luego ejecuta: .\build-android.bat" -ForegroundColor White
    exit 1
}

# Extract the zip file
Write-Host "📦 Extrayendo archivos..." -ForegroundColor Yellow
try {
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::ExtractToDirectory($zipFile, $tempDir)
    
    # Move cmdline-tools to the correct location
    $extractedDir = "$tempDir\cmdline-tools"
    if (Test-Path $extractedDir) {
        $latestDir = "$androidHome\cmdline-tools\latest"
        if (Test-Path $latestDir) {
            Remove-Item -Path $latestDir -Recurse -Force
        }
        Move-Item -Path $extractedDir -Destination $latestDir -Force
        Write-Host "✅ Archivos extraídos correctamente" -ForegroundColor Green
    } else {
        Write-Host "❌ Error: No se encontró el directorio cmdline-tools" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error al extraer: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Set environment variables
Write-Host "🔧 Configurando variables de entorno..." -ForegroundColor Yellow

try {
    # Set ANDROID_HOME
    [Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidHome, "User")
    $env:ANDROID_HOME = $androidHome
    
    # Update PATH
    $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    $newPaths = @(
        "$androidHome\cmdline-tools\latest\bin",
        "$androidHome\platform-tools",
        "$androidHome\tools",
        "$androidHome\tools\bin"
    )
    
    foreach ($newPath in $newPaths) {
        if ($currentPath -notlike "*$newPath*") {
            $currentPath = "$currentPath;$newPath"
        }
    }
    
    [Environment]::SetEnvironmentVariable("PATH", $currentPath, "User")
    $env:PATH = $currentPath
    
    Write-Host "✅ Variables de entorno configuradas" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Advertencia: No se pudieron configurar las variables de entorno automáticamente" -ForegroundColor Yellow
}

# Install essential SDK components
Write-Host "📱 Instalando componentes esenciales del SDK..." -ForegroundColor Yellow

$sdkmanager = "$androidHome\cmdline-tools\latest\bin\sdkmanager.bat"

if (Test-Path $sdkmanager) {
    try {
        # Accept licenses first
        Write-Host "📋 Aceptando licencias..." -ForegroundColor Yellow
        echo "y`ny`ny`ny`ny`ny`ny`ny`ny" | & $sdkmanager --licenses 2>$null
        
        # Install essential components
        Write-Host "📦 Instalando platform-tools..." -ForegroundColor Yellow
        & $sdkmanager "platform-tools" 2>$null
        
        Write-Host "📦 Instalando build-tools..." -ForegroundColor Yellow
        & $sdkmanager "build-tools;34.0.0" 2>$null
        
        Write-Host "📦 Instalando Android API 34..." -ForegroundColor Yellow
        & $sdkmanager "platforms;android-34" 2>$null
        
        Write-Host "✅ Componentes instalados" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Advertencia: Algunos componentes pueden no haberse instalado correctamente" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Error: No se encontró sdkmanager" -ForegroundColor Red
}

# Update local.properties
$localPropsPath = "$PSScriptRoot\android\local.properties"
Write-Host "📝 Actualizando local.properties..." -ForegroundColor Yellow

$androidHomeEscaped = $androidHome -replace '\\', '\\\\'
$localPropsContent = @"
# This file is automatically generated by Android.
# Do not modify this file -- YOUR CHANGES WILL BE ERASED!
#
# This file should *NOT* be checked into Version Control Systems,
# as it contains information specific to your local configuration.
#
# Location of the SDK. This is only used by Gradle.
# For customization when using a Version Control System, please read the
# header note.
sdk.dir=$androidHomeEscaped
"@

Set-Content -Path $localPropsPath -Value $localPropsContent -Encoding UTF8

# Clean up
Write-Host "🧹 Limpiando archivos temporales..." -ForegroundColor Yellow
Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "" 
Write-Host "🎉 ¡Android SDK configurado exitosamente!" -ForegroundColor Green
Write-Host "" 
Write-Host "📍 ANDROID_HOME: $androidHome" -ForegroundColor Cyan
Write-Host "📍 SDK Manager: $sdkmanager" -ForegroundColor Cyan
Write-Host "" 
Write-Host "⚠️  IMPORTANTE: Reinicia tu terminal o IDE para que las variables de entorno surtan efecto." -ForegroundColor Yellow
Write-Host "" 
Write-Host "🔄 Para continuar con la construcción del APK, ejecuta:" -ForegroundColor Cyan
Write-Host "   .\build-android.bat" -ForegroundColor White
Write-Host ""