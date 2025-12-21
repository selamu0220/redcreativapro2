#!/usr/bin/env node

/**
 * Script de verificación pre-deploy
 * Verifica que el build esté listo para Vercel
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración para deploy...\n');

const checks = [];

// 1. Verificar package.json tiene flags webpack
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const hasBuildWebpack = packageJson.scripts.build.includes('--webpack');
const hasDevWebpack = packageJson.scripts.dev.includes('--webpack');

checks.push({
  name: 'Build script usa --webpack',
  passed: hasBuildWebpack,
  value: packageJson.scripts.build
});

checks.push({
  name: 'Dev script usa --webpack',
  passed: hasDevWebpack,
  value: packageJson.scripts.dev
});

// 2. Verificar next.config.js no tiene turbopack habilitado
const nextConfig = fs.readFileSync('next.config.js', 'utf8');
const hasTurbopackEnabled = nextConfig.includes('turbopack: true') || 
                            nextConfig.includes('turbo: true');

checks.push({
  name: 'Turbopack NO está habilitado',
  passed: !hasTurbopackEnabled,
  value: hasTurbopackEnabled ? 'Turbopack encontrado' : 'OK'
});

// 3. Verificar vercel.json existe y tiene buildCommand
const vercelJson = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
checks.push({
  name: 'vercel.json tiene buildCommand',
  passed: !!vercelJson.buildCommand,
  value: vercelJson.buildCommand || 'No definido'
});

// 4. Verificar variables de entorno críticas (warning only)
const envExample = fs.readFileSync('.env.example', 'utf8');
const requiredVars = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY'
];

const missingVars = requiredVars.filter(v => !envExample.includes(v));
checks.push({
  name: 'Variables de entorno documentadas (warning)',
  passed: true, // No bloqueante
  warning: missingVars.length > 0,
  value: missingVars.length === 0 ? 'Todas presentes' : `⚠️  Faltan: ${missingVars.join(', ')}`
});

// 5. Verificar que .next existe (build previo)
const buildExists = fs.existsSync('.next/BUILD_ID');
checks.push({
  name: 'Build local exitoso',
  passed: buildExists,
  value: buildExists ? fs.readFileSync('.next/BUILD_ID', 'utf8').trim() : 'No encontrado'
});

// Mostrar resultados
console.log('Resultados de verificación:\n');
let allPassed = true;

checks.forEach(check => {
  const icon = check.passed ? '✅' : '❌';
  console.log(`${icon} ${check.name}`);
  if (!check.passed || check.warning || process.env.VERBOSE) {
    console.log(`   ${check.value}`);
  }
  if (!check.passed) allPassed = false;
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('✅ Todo listo para deploy en Vercel!');
  console.log('\nPróximos pasos:');
  console.log('1. git add .');
  console.log('2. git commit -m "fix: Force webpack usage"');
  console.log('3. git push');
  console.log('4. vercel --prod');
  process.exit(0);
} else {
  console.log('❌ Hay problemas que resolver antes del deploy');
  console.log('\nRevisa los items marcados con ❌ arriba');
  process.exit(1);
}
