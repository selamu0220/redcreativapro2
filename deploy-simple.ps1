Write-Host "Iniciando deployment de Escritor IA..." -ForegroundColor Green

if (!(Test-Path "package.json")) {
    Write-Host "Error: package.json no encontrado" -ForegroundColor Red
    exit 1
}

Write-Host "Opciones de Deployment:" -ForegroundColor Cyan
Write-Host "1. Vercel"
Write-Host "2. Render"
Write-Host "3. Docker Local"
Write-Host "4. Build"
Write-Host "5. Cancelar"

if (!(Test-Path "node_modules")) {
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

$choice = Read-Host "Selecciona opcion (1-5)"

if ($choice -eq "1") {
    Write-Host "Deployment con Vercel" -ForegroundColor Yellow
    try {
        vercel --version
    }
    catch {
        Write-Host "Instalando Vercel CLI..." -ForegroundColor Yellow
        npm install -g vercel
    }
    Write-Host "Ejecutando deployment..." -ForegroundColor Green
    vercel --prod
    Write-Host "Deployment completado" -ForegroundColor Green
}

if ($choice -eq "2") {
    Write-Host "Deployment con Render" -ForegroundColor Yellow
    Write-Host "Instrucciones:" -ForegroundColor Cyan
    Write-Host "1. Sube codigo a GitHub"
    Write-Host "2. Ve a render.com"
    Write-Host "3. Conecta repositorio"
    Write-Host "4. Configura variables de entorno"
    Write-Host "5. Deploy automatico"
    Write-Host "Archivos listos: render.yaml, Dockerfile" -ForegroundColor Green
}

if ($choice -eq "3") {
    Write-Host "Deployment con Docker" -ForegroundColor Yellow
    try {
        docker --version
    }
    catch {
        Write-Host "Docker no instalado" -ForegroundColor Red
        exit 1
    }
    Write-Host "Construyendo imagen..." -ForegroundColor Yellow
    docker build -t escritor-ia:latest .
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Imagen construida" -ForegroundColor Green
        $run = Read-Host "Ejecutar localmente? (y/n)"
        if ($run -eq "y") {
            Write-Host "Ejecutando en puerto 3000..." -ForegroundColor Yellow
            docker run -p 3000:3000 --rm escritor-ia:latest
        }
    }
}

if ($choice -eq "4") {
    Write-Host "Build del proyecto" -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Build completado" -ForegroundColor Green
    }
}

if ($choice -eq "5") {
    Write-Host "Cancelado" -ForegroundColor Yellow
    exit 0
}

Write-Host "Proceso completado" -ForegroundColor Green