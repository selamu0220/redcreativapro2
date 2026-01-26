#!/usr/bin/env node

/**
 * Script de verificación de configuración de Kinde Auth
 * Verifica que todas las variables de entorno estén configuradas correctamente
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de Kinde Auth...\n');

// Leer .env.local
const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('❌ ERROR: No se encontró el archivo .env.local');
  console.log('   Crea el archivo .env.local en la raíz del proyecto\n');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');

// Variables requeridas
const requiredVars = [
  'KINDE_CLIENT_ID',
  'KINDE_CLIENT_SECRET',
  'KINDE_ISSUER_URL',
  'KINDE_SITE_URL',
  'KINDE_POST_LOGOUT_REDIRECT_URL',
  'KINDE_POST_LOGIN_REDIRECT_URL'
];

let allConfigured = true;
const results = [];

requiredVars.forEach(varName => {
  const regex = new RegExp(`${varName}=(.+)`, 'i');
  const match = envContent.match(regex);
  
  if (!match) {
    results.push({ var: varName, status: '❌', message: 'No encontrada' });
    allConfigured = false;
  } else {
    const value = match[1].trim();
    
    // Verificar valores placeholder
    if (value.includes('your_') || value.includes('Hidden until copied')) {
      results.push({ var: varName, status: '⚠️', message: 'Valor placeholder - necesita actualización' });
      allConfigured = false;
    } else if (value.length < 10) {
      results.push({ var: varName, status: '⚠️', message: 'Valor muy corto - verifica' });
      allConfigured = false;
    } else {
      results.push({ var: varName, status: '✅', message: 'Configurada' });
    }
  }
});

// Mostrar resultados
console.log('📋 Estado de Variables de Entorno:\n');
results.forEach(result => {
  console.log(`${result.status} ${result.var}`);
  if (result.status !== '✅') {
    console.log(`   → ${result.message}`);
  }
});

console.log('\n');

// Verificar archivo de ruta API
const apiRoutePath = path.join(__dirname, 'app', 'api', 'auth', '[kindeAuth]', 'route.ts');
if (fs.existsSync(apiRoutePath)) {
  console.log('✅ Ruta API de Kinde configurada correctamente');
} else {
  console.log('❌ ERROR: No se encontró app/api/auth/[kindeAuth]/route.ts');
  allConfigured = false;
}

console.log('\n');

// Resultado final
if (allConfigured) {
  console.log('🎉 ¡Configuración completa! Tu aplicación está lista para usar Kinde Auth.\n');
  console.log('Siguiente paso:');
  console.log('  npm run dev\n');
  console.log('Luego abre: http://localhost:3000/auth\n');
} else {
  console.log('⚠️  Configuración incompleta. Acciones requeridas:\n');
  
  const needsUpdate = results.filter(r => r.status !== '✅');
  if (needsUpdate.length > 0) {
    console.log('1. Copia el Client Secret desde Kinde Dashboard:');
    console.log('   https://app.kinde.com/applications\n');
    console.log('2. Actualiza las variables en .env.local\n');
    console.log('3. Ejecuta este script nuevamente para verificar\n');
  }
  
  console.log('📖 Lee PASOS_FINALES_KINDE.md para instrucciones detalladas\n');
}

// Verificar package.json
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  
  if (packageJson.dependencies['@kinde-oss/kinde-auth-nextjs']) {
    console.log('✅ Paquete @kinde-oss/kinde-auth-nextjs instalado\n');
  } else {
    console.log('❌ ERROR: Paquete @kinde-oss/kinde-auth-nextjs no instalado');
    console.log('   Ejecuta: npm install @kinde-oss/kinde-auth-nextjs\n');
    allConfigured = false;
  }
  
  if (packageJson.dependencies['@clerk/nextjs']) {
    console.log('⚠️  ADVERTENCIA: @clerk/nextjs todavía está instalado');
    console.log('   Ejecuta: npm uninstall @clerk/nextjs\n');
  }
}

process.exit(allConfigured ? 0 : 1);
