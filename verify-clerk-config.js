#!/usr/bin/env node

/**
 * Script para verificar la configuración de Clerk
 * Verifica que todas las variables de entorno necesarias estén configuradas
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de Clerk...\n');

// Leer .env.local
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ Error: No se encontró el archivo .env.local');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');

// Variables requeridas
const requiredVars = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL'
];

let allConfigured = true;
const config = {};

requiredVars.forEach(varName => {
  const regex = new RegExp(`${varName}=(.+)`, 'm');
  const match = envContent.match(regex);
  
  if (match && match[1] && match[1].trim() !== '') {
    config[varName] = match[1].trim();
    console.log(`✅ ${varName}: ${match[1].substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: NO CONFIGURADA`);
    allConfigured = false;
  }
});

console.log('\n📋 Resumen de Configuración:\n');

if (allConfigured) {
  console.log('✅ Todas las variables de Clerk están configuradas correctamente\n');
  
  console.log('📍 Rutas configuradas:');
  console.log(`   Sign In URL: ${config.NEXT_PUBLIC_CLERK_SIGN_IN_URL}`);
  console.log(`   Sign Up URL: ${config.NEXT_PUBLIC_CLERK_SIGN_UP_URL}`);
  console.log(`   After Sign In: ${config.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL}`);
  console.log(`   After Sign Up: ${config.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL}\n`);
  
  console.log('🎯 Próximos pasos:');
  console.log('   1. Configura las mismas rutas en Clerk Dashboard');
  console.log('   2. Ve a: Configure → Paths');
  console.log('   3. Selecciona "Sign-in page on application domain"');
  console.log('   4. Ingresa: https://www.redcreativa.pro/auth');
  console.log('   5. Repite para Sign Up y Sign Out');
  console.log('   6. Guarda los cambios\n');
  
  console.log('📚 Documentación completa: CLERK_DOMAIN_CONFIGURATION.md\n');
} else {
  console.log('❌ Faltan variables de configuración');
  console.log('   Revisa el archivo .env.local y agrega las variables faltantes\n');
  process.exit(1);
}

// Verificar que la página /auth existe
const authPagePath = path.join(__dirname, 'app', 'auth', 'page.tsx');
if (fs.existsSync(authPagePath)) {
  console.log('✅ Página de autenticación encontrada: /app/auth/page.tsx\n');
} else {
  console.log('⚠️  Advertencia: No se encontró /app/auth/page.tsx\n');
}

console.log('✨ Verificación completada\n');
