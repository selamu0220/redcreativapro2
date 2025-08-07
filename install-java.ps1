# Script para instalar Java JDK 17 para desarrollo Android
# Ejecutar como administrador

Write-Host "Instalando Java JDK 17 para desarrollo Android..." -ForegroundColor Green

# Verificar si ya está instalado
$javaInstalled = $false
try {
    $javaVersion = & java -version 2>&1
    if ($javaVersion -match "17") {
        Write-Host "Java JDK 17 ya está instalado." -ForegroundColor Yellow
        $javaInstalled = $true
    }
} catch {
    Write-Host "Java no encontrado. Procediendo con la instalación..." -ForegroundColor Yellow
}

if (-not $javaInstalled) {
    # Descargar e instalar Java JDK 17 usando winget
    Write-Host "Descargando e instalando Java JDK 17..." -ForegroundColor Blue
    
    try {
        # Intentar instalar con winget
        winget install Microsoft.OpenJDK.17
        
        Write-Host "Java JDK 17 instalado exitosamente." -ForegroundColor Green
        
        # Configurar JAVA_HOME
        $javaPath = "C:\Program Files\Microsoft\jdk-17.0.11.9-hotspot"
        if (Test-Path $javaPath) {
            [Environment]::SetEnvironmentVariable("JAVA_HOME", $javaPath, "Machine")
            $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
            if ($currentPath -notlike "*$javaPath\bin*") {
                [Environment]::SetEnvironmentVariable("Path", "$currentPath;$javaPath\bin", "Machine")
            }
            Write-Host "JAVA_HOME configurado en: $javaPath" -ForegroundColor Green
        }
        
    } catch {
        Write-Host "Error instalando Java con winget. Intentando método alternativo..." -ForegroundColor Red
        
        # Método alternativo: descargar directamente
        $downloadUrl = "https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_windows-x64_bin.zip"
        $downloadPath = "$env:TEMP\openjdk-17.zip"
        $extractPath = "C:\Program Files\Java\jdk-17"
        
        Write-Host "Descargando OpenJDK 17..." -ForegroundColor Blue
        Invoke-WebRequest -Uri $downloadUrl -OutFile $downloadPath
        
        Write-Host "Extrayendo archivos..." -ForegroundColor Blue
        Expand-Archive -Path $downloadPath -DestinationPath "C:\Program Files\Java" -Force
        
        # Renombrar directorio
        $extractedDir = Get-ChildItem "C:\Program Files\Java" | Where-Object { $_.Name -like "jdk-17*" } | Select-Object -First 1
        if ($extractedDir) {
            Rename-Item $extractedDir.FullName $extractPath -Force
        }
        
        # Configurar variables de entorno
        [Environment]::SetEnvironmentVariable("JAVA_HOME", $extractPath, "Machine")
        $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
        if ($currentPath -notlike "*$extractPath\bin*") {
            [Environment]::SetEnvironmentVariable("Path", "$currentPath;$extractPath\bin", "Machine")
        }
        
        # Limpiar archivo temporal
        Remove-Item $downloadPath -Force
        
        Write-Host "Java JDK 17 instalado y configurado exitosamente." -ForegroundColor Green
    }
}

# Verificar instalación
Write-Host "Verificando instalación..." -ForegroundColor Blue
try {
    # Refrescar variables de entorno en la sesión actual
    $env:JAVA_HOME = [Environment]::GetEnvironmentVariable("JAVA_HOME", "Machine")
    $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine")
    
    $javaVersion = & "$env:JAVA_HOME\bin\java.exe" -version 2>&1
    Write-Host "Java instalado correctamente:" -ForegroundColor Green
    Write-Host $javaVersion -ForegroundColor White
    
    Write-Host "JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Green
    
} catch {
    Write-Host "Error verificando la instalación de Java." -ForegroundColor Red
    Write-Host "Por favor, reinicia PowerShell y verifica manualmente." -ForegroundColor Yellow
}

Write-Host "\nInstalación completada. Reinicia PowerShell para usar Java." -ForegroundColor Cyan
Write-Host "Luego ejecuta: npx cap build android" -ForegroundColor Cyan