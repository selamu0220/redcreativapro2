# Script para deployment limpio en Vercel (PowerShell)
# Este script limpia el cache y hace un build fresco

Write-Host "🧹 Limpiando cache de Next.js..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "Cache eliminado" -ForegroundColor Green
} else {
    Write-Host "No hay cache para limpiar" -ForegroundColor Gray
}

Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
pnpm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
    exit 1
}

Write-Host "🔨 Construyendo aplicación..." -ForegroundColor Yellow
pnpm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build completado exitosamente!" -ForegroundColor Green
    Write-Host "📤 Listo para deployment en Vercel" -ForegroundColor Cyan
} else {
    Write-Host "❌ Error en el build" -ForegroundColor Red
    exit 1
}