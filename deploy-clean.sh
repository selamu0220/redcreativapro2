#!/bin/bash

# Script para deployment limpio en Vercel
# Este script limpia el cache y hace un build fresco

echo "🧹 Limpiando cache de Next.js..."
rm -rf .next

echo "📦 Instalando dependencias..."
pnpm install

echo "🔨 Construyendo aplicación..."
pnpm run build

echo "✅ Build completado exitosamente!"
echo "📤 Listo para deployment en Vercel"