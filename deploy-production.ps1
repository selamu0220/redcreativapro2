# Script de Deployment para Escritor IA
# Soporta múltiples plataformas: Vercel, Render, Docker

Write-Host "🚀 Iniciando proceso de deployment para Escritor IA..." -ForegroundColor Green

# Verificar que estamos en el directorio correcto
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json. Ejecuta este script desde la raíz del proyecto." -ForegroundColor Red
    exit 1
}

# Mostrar opciones de deployment
Write-Host "`n📋 Opciones de Deployment Disponibles:" -ForegroundColor Cyan
Write-Host "1. 🌐 Vercel (Recomendado para Next.js)"
Write-Host "2. 🎨 Render (Docker)"
Write-Host "3. 🐳 Docker Local"
Write-Host "4. 📦 Build solamente"
Write-Host "5. ❌ Cancelar"

# Verificar dependencias
Write-Host "`n🔍 Verificando dependencias..." -ForegroundColor Yellow
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

# Procesar selección del usuario
$choice = Read-Host "`n🎯 Selecciona una opción (1-5)"

if ($choice -eq "1") {
    Write-Host "`n🌐 Preparando deployment para Vercel..." -ForegroundColor Yellow
    
    # Verificar si Vercel CLI está instalado
    if (!(Get-Command "vercel" -ErrorAction SilentlyContinue)) {
        Write-Host "📦 Instalando Vercel CLI..." -ForegroundColor Yellow
        npm install -g vercel
    }
    
    Write-Host "🔧 Configurando proyecto para Vercel..." -ForegroundColor Yellow
    Write-Host "🚀 Ejecutando deployment..." -ForegroundColor Green
    vercel --prod
    
    Write-Host "✅ Deployment en Vercel completado!" -ForegroundColor Green
}
elseif ($choice -eq "2") {
    Write-Host "`n🎨 Preparando deployment para Render..." -ForegroundColor Yellow
    
    Write-Host "📋 Instrucciones para Render:" -ForegroundColor Cyan
    Write-Host "1. Sube tu código a GitHub"
    Write-Host "2. Ve a https://render.com y conecta tu repositorio"
    Write-Host "3. Render detectará automáticamente el archivo render.yaml"
    Write-Host "4. Configura las variables de entorno en el dashboard de Render"
    Write-Host "5. ¡Haz deploy! 🚀"
    
    Write-Host "`n📁 Archivos de configuración ya preparados:" -ForegroundColor Green
    Write-Host "   ✅ render.yaml"
    Write-Host "   ✅ Dockerfile"
    Write-Host "   ✅ .dockerignore"
}
elseif ($choice -eq "3") {
    Write-Host "`n🐳 Preparando deployment con Docker..." -ForegroundColor Yellow
    
    # Verificar si Docker está instalado
    if (!(Get-Command "docker" -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Docker no está instalado. Por favor instala Docker Desktop." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "📦 Construyendo imagen Docker..." -ForegroundColor Yellow
    docker build -t escritor-ia:latest .
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Imagen Docker construida exitosamente!" -ForegroundColor Green
        
        $runLocal = Read-Host "`n🤔 ¿Quieres ejecutar el contenedor localmente? (y/n)"
        if ($runLocal -eq "y" -or $runLocal -eq "Y") {
            Write-Host "🏃 Ejecutando contenedor en puerto 3000..." -ForegroundColor Yellow
            Write-Host "🌐 Accede a la app en: http://localhost:3000" -ForegroundColor Cyan
            Write-Host "⏹️  Presiona Ctrl+C para detener el contenedor" -ForegroundColor Yellow
            
            docker run -p 3000:3000 --name escritor-ia-test --rm escritor-ia:latest
        }
    } else {
        Write-Host "❌ Error al construir la imagen Docker." -ForegroundColor Red
    }
}
elseif ($choice -eq "4") {
    Write-Host "`n📦 Ejecutando build del proyecto..." -ForegroundColor Yellow
    
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build completado exitosamente!" -ForegroundColor Green
        Write-Host "📁 Los archivos están en la carpeta .next" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Error durante el build." -ForegroundColor Red
    }
}
elseif ($choice -eq "5") {
    Write-Host "❌ Deployment cancelado." -ForegroundColor Yellow
    exit 0
}
else {
    Write-Host "❌ Opción inválida. Por favor selecciona 1-5." -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 Proceso completado!" -ForegroundColor Green
Write-Host "📚 Para más información, revisa los archivos:" -ForegroundColor Cyan
Write-Host "   - DEPLOYMENT-COMPLETE-GUIDE.md"
Write-Host "   - README-DOCKER.md"