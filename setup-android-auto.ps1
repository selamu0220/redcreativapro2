# Script automático para configurar entorno Android
# Ejecutar como administrador: PowerShell -ExecutionPolicy Bypass -File setup-android-auto.ps1

Write-Host "🚀 Configuración Automática de Android" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si se ejecuta como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "⚠️  Este script necesita ejecutarse como administrador." -ForegroundColor Yellow
    Write-Host "Reiniciando como administrador..." -ForegroundColor Yellow
    Start-Process PowerShell -ArgumentList "-ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

Write-Host "✅ Ejecutándose como administrador" -ForegroundColor Green
Write-Host ""

# Función para verificar si un comando existe
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Verificar si winget está disponible
if (-not (Test-Command "winget")) {
    Write-Host "❌ winget no está disponible. Instalando App Installer..." -ForegroundColor Red
    try {
        Add-AppxPackage -RegisterByFamilyName -MainPackage Microsoft.DesktopAppInstaller_8wekyb3d8bbwe
        Write-Host "✅ App Installer instalado" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error instalando App Installer. Continuando con método manual..." -ForegroundColor Red
    }
}

# Verificar Java
Write-Host "🔍 Verificando Java..." -ForegroundColor Blue
$javaInstalled = $false

try {
    $javaVersion = java -version 2>&1
    if ($javaVersion -match "17|18|19|20|21") {
        Write-Host "✅ Java ya está instalado y es compatible" -ForegroundColor Green
        $javaInstalled = $true
    } else {
        Write-Host "⚠️  Java instalado pero versión incompatible" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Java no encontrado" -ForegroundColor Red
}

# Instalar Java si es necesario
if (-not $javaInstalled) {
    Write-Host "📦 Instalando Java JDK 17..." -ForegroundColor Blue
    
    try {
        if (Test-Command "winget") {
            winget install Microsoft.OpenJDK.17 --accept-package-agreements --accept-source-agreements
        } else {
            # Método alternativo sin winget
            Write-Host "Descargando Java manualmente..." -ForegroundColor Yellow
            $javaUrl = "https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_windows-x64_bin.msi"
            $javaInstaller = "$env:TEMP\openjdk-17.msi"
            
            Invoke-WebRequest -Uri $javaUrl -OutFile $javaInstaller
            Start-Process msiexec.exe -ArgumentList "/i", $javaInstaller, "/quiet" -Wait
            Remove-Item $javaInstaller
        }
        
        Write-Host "✅ Java JDK 17 instalado" -ForegroundColor Green
        
    } catch {
        Write-Host "❌ Error instalando Java: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Por favor, instala Java manualmente desde: https://adoptium.net/temurin/releases/" -ForegroundColor Yellow
    }
}

# Verificar Android Studio
Write-Host "🔍 Verificando Android Studio..." -ForegroundColor Blue
$androidStudioInstalled = $false

$androidStudioPaths = @(
    "C:\Program Files\Android\Android Studio",
    "${env:LOCALAPPDATA}\Android\Sdk",
    "${env:USERPROFILE}\AppData\Local\Android\Sdk"
)

foreach ($path in $androidStudioPaths) {
    if (Test-Path $path) {
        Write-Host "✅ Android Studio/SDK encontrado en: $path" -ForegroundColor Green
        $androidStudioInstalled = $true
        break
    }
}

if (-not $androidStudioInstalled) {
    Write-Host "❌ Android Studio no encontrado" -ForegroundColor Red
    Write-Host "📦 ¿Deseas instalar Android Studio? (s/n): " -ForegroundColor Blue -NoNewline
    $response = Read-Host
    
    if ($response -eq "s" -or $response -eq "S" -or $response -eq "y" -or $response -eq "Y") {
        Write-Host "📦 Descargando Android Studio..." -ForegroundColor Blue
        
        try {
            $androidStudioUrl = "https://redirector.gvt1.com/edgedl/android/studio/install/2023.3.1.18/android-studio-2023.3.1.18-windows.exe"
            $androidStudioInstaller = "$env:TEMP\android-studio-installer.exe"
            
            Write-Host "Descargando desde: $androidStudioUrl" -ForegroundColor Gray
            Invoke-WebRequest -Uri $androidStudioUrl -OutFile $androidStudioInstaller
            
            Write-Host "Ejecutando instalador de Android Studio..." -ForegroundColor Blue
            Write-Host "⚠️  Sigue las instrucciones del instalador y acepta todas las licencias" -ForegroundColor Yellow
            
            Start-Process $androidStudioInstaller -Wait
            Remove-Item $androidStudioInstaller
            
            Write-Host "✅ Android Studio instalado" -ForegroundColor Green
            
        } catch {
            Write-Host "❌ Error descargando Android Studio: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Por favor, descarga manualmente desde: https://developer.android.com/studio" -ForegroundColor Yellow
        }
    }
}

# Configurar variables de entorno
Write-Host "🔧 Configurando variables de entorno..." -ForegroundColor Blue

# Buscar JAVA_HOME
$javaPaths = @(
    "C:\Program Files\Microsoft\jdk-17*",
    "C:\Program Files\Java\jdk-17*",
    "C:\Program Files\Eclipse Adoptium\jdk-17*",
    "C:\Program Files\Android\Android Studio\jbr"
)

$javaHome = $null
foreach ($pattern in $javaPaths) {
    $found = Get-ChildItem $pattern -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) {
        $javaHome = $found.FullName
        break
    }
}

if ($javaHome) {
    [Environment]::SetEnvironmentVariable("JAVA_HOME", $javaHome, "Machine")
    Write-Host "✅ JAVA_HOME configurado: $javaHome" -ForegroundColor Green
} else {
    Write-Host "❌ No se pudo encontrar Java para configurar JAVA_HOME" -ForegroundColor Red
}

# Buscar ANDROID_HOME
$androidPaths = @(
    "${env:LOCALAPPDATA}\Android\Sdk",
    "${env:USERPROFILE}\AppData\Local\Android\Sdk",
    "C:\Android\Sdk"
)

$androidHome = $null
foreach ($path in $androidPaths) {
    if (Test-Path $path) {
        $androidHome = $path
        break
    }
}

if ($androidHome) {
    [Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidHome, "Machine")
    Write-Host "✅ ANDROID_HOME configurado: $androidHome" -ForegroundColor Green
} else {
    Write-Host "⚠️  ANDROID_HOME no configurado (instala Android Studio)" -ForegroundColor Yellow
}

# Actualizar PATH
$currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
$pathsToAdd = @()

if ($javaHome -and $currentPath -notlike "*$javaHome\bin*") {
    $pathsToAdd += "$javaHome\bin"
}

if ($androidHome) {
    if ($currentPath -notlike "*$androidHome\platform-tools*") {
        $pathsToAdd += "$androidHome\platform-tools"
    }
    if ($currentPath -notlike "*$androidHome\tools*") {
        $pathsToAdd += "$androidHome\tools"
    }
}

if ($pathsToAdd.Count -gt 0) {
    $newPath = $currentPath + ";" + ($pathsToAdd -join ";")
    [Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")
    Write-Host "✅ PATH actualizado" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Configuración completada!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Resumen:" -ForegroundColor White
if ($javaHome) { Write-Host "✅ Java: $javaHome" -ForegroundColor Green }
if ($androidHome) { Write-Host "✅ Android SDK: $androidHome" -ForegroundColor Green }
Write-Host ""
Write-Host "🔄 IMPORTANTE: Reinicia PowerShell para aplicar los cambios" -ForegroundColor Yellow
Write-Host "Luego ejecuta: ./build-android.bat" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")