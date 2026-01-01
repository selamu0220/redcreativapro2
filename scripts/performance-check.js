#!/usr/bin/env node

/**
 * Script para verificar el rendimiento de la aplicación
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando rendimiento de la aplicación...\n');

// 1. Verificar tamaño de bundle
console.log('📦 Verificando tamaño de bundles...');
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  const buildManifest = path.join(nextDir, 'build-manifest.json');
  if (fs.existsSync(buildManifest)) {
    const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
    console.log('✅ Build manifest encontrado');
    console.log(`   Páginas: ${Object.keys(manifest.pages).length}`);
  }
} else {
  console.log('⚠️  No se encontró el directorio .next. Ejecuta npm run build primero.');
}

// 2. Verificar optimizaciones en next.config.js
console.log('\n⚙️  Verificando configuración de Next.js...');
const nextConfig = path.join(process.cwd(), 'next.config.js');
if (fs.existsSync(nextConfig)) {
  const config = fs.readFileSync(nextConfig, 'utf8');
  
  const checks = [
    { name: 'swcMinify', pattern: /swcMinify:\s*true/, status: false },
    { name: 'compress', pattern: /compress:\s*true/, status: false },
    { name: 'images optimization', pattern: /images:\s*{/, status: false },
    { name: 'splitChunks', pattern: /splitChunks:\s*{/, status: false },
  ];
  
  checks.forEach(check => {
    check.status = check.pattern.test(config);
    console.log(`   ${check.status ? '✅' : '❌'} ${check.name}`);
  });
}

// 3. Verificar middleware
console.log('\n🛡️  Verificando middleware...');
const middleware = path.join(process.cwd(), 'middleware.ts');
if (fs.existsSync(middleware)) {
  const content = fs.readFileSync(middleware, 'utf8');
  const hasOptimizedMatcher = /matcher:\s*\[/.test(content);
  console.log(`   ${hasOptimizedMatcher ? '✅' : '⚠️ '} Matcher configurado`);
}

// 4. Verificar Service Worker
console.log('\n🔧 Verificando Service Worker...');
const sw = path.join(process.cwd(), 'public', 'sw.js');
if (fs.existsSync(sw)) {
  console.log('   ✅ Service Worker encontrado');
} else {
  console.log('   ❌ Service Worker no encontrado');
}

// 5. Verificar componentes memoizados
console.log('\n⚛️  Verificando componentes optimizados...');
const componentsDir = path.join(process.cwd(), 'app', 'components');
if (fs.existsSync(componentsDir)) {
  const files = fs.readdirSync(componentsDir);
  const memoizedFiles = files.filter(file => {
    const filePath = path.join(componentsDir, file);
    const stat = fs.statSync(filePath);
    if (!stat.isFile() || !file.endsWith('.tsx')) return false;
    const content = fs.readFileSync(filePath, 'utf8');
    return /memo\(/.test(content);
  });
  console.log(`   ✅ ${memoizedFiles.length} componentes memoizados encontrados`);
}

console.log('\n✨ Verificación completada\n');

// Recomendaciones
console.log('📋 Recomendaciones:');
console.log('   1. Ejecuta "npm run build" para verificar el tamaño final del bundle');
console.log('   2. Usa "npm run analyze" para analizar el bundle en detalle');
console.log('   3. Verifica las métricas de Web Vitals en producción');
console.log('   4. Considera implementar lazy loading para componentes pesados\n');
