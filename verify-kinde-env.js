#!/usr/bin/env node

/**
 * Script para verificar que las variables de entorno de Kinde estén configuradas
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de Kinde Auth...\n');

// Variables requeridas
const requiredVars = [
  'KINDE_CLIENT_ID',
  'KINDE_CLIENT_SECRET',
  'KINDE_ISSUER_URL',
  'KINDE_SITE_URL',
  'KINDE_POST_LOGOUT_REDIRECT_URL',
  'KINDE_POST_LOGIN_REDIRECT_URL'
];

// Leer .env.local
const envLocalPath = path.join(process.cwd(), '.env.local');
let envVars = {};

if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  console.log('✅ Archivo .env.local encontrado\n');
} else {
  console.log('❌ Archivo .env.local NO encontrado\n');
  process.exit(1);
}

// Verificar cada variable
let allPresent = true;
console.log('Variables de Kinde:');
console.log('─'.repeat(60));

requiredVars.forEach(varName => {
  const value = envVars[varName];
  if (value) {
    // Mostrar solo los primeros caracteres por seguridad
    const displayValue = value.length > 30 
      ? value.substring(0, 30) + '...' 
      : value;
    console.log(`✅ ${varName.padEnd(35)} = ${displayValue}`);
  } else {
    console.log(`❌ ${varName.padEnd(35)} = NO CONFIGURADA`);
    allPresent = false;
  }
});

console.log('─'.repeat(60));

if (allPresent) {
  console.log('\n✅ Todas las variables de Kinde están configuradas correctamente');
  console.log('\n📝 Próximos pasos:');
  console.log('   1. Reinicia el servidor de desarrollo: npm run dev');
  console.log('   2. Visita http://localhost:3000');
  console.log('   3. Haz clic en "Iniciar Sesión" o "Registrarse"');
  console.log('   4. Deberías ser redirigido a Kinde (selamu.kinde.com)');
  console.log('\n⚠️  IMPORTANTE: Si el servidor ya está corriendo, debes reiniciarlo');
  console.log('   para que tome las variables de entorno actualizadas.\n');
} else {
  console.log('\n❌ Faltan variables de Kinde en .env.local');
  console.log('\n📝 Agrega las variables faltantes a .env.local:');
  console.log('\nKINDE_CLIENT_ID=tu_client_id');
  console.log('KINDE_CLIENT_SECRET=tu_client_secret');
  console.log('KINDE_ISSUER_URL=https://tu-dominio.kinde.com');
  console.log('KINDE_SITE_URL=http://localhost:3000');
  console.log('KINDE_POST_LOGOUT_REDIRECT_URL=http://localhost:3000');
  console.log('KINDE_POST_LOGIN_REDIRECT_URL=http://localhost:3000/dashboard\n');
  process.exit(1);
}

// Verificar que no haya variables de Clerk
console.log('\n🔍 Verificando que no haya variables de Clerk...');
const clerkVars = Object.keys(envVars).filter(key => 
  key.includes('CLERK') || key.includes('clerk')
);

if (clerkVars.length > 0) {
  console.log('⚠️  Se encontraron variables de Clerk en .env.local:');
  clerkVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n   Estas variables ya no son necesarias y pueden ser eliminadas.\n');
} else {
  console.log('✅ No se encontraron variables de Clerk\n');
}

// Verificar configuración de URLs
console.log('🔍 Verificando configuración de URLs...');
const siteUrl = envVars['KINDE_SITE_URL'];
const appUrl = envVars['NEXT_PUBLIC_APP_URL'];

if (siteUrl && appUrl && siteUrl !== appUrl) {
  console.log('⚠️  ADVERTENCIA: KINDE_SITE_URL y NEXT_PUBLIC_APP_URL no coinciden');
  console.log(`   KINDE_SITE_URL: ${siteUrl}`);
  console.log(`   NEXT_PUBLIC_APP_URL: ${appUrl}`);
  console.log('   Asegúrate de que ambas apunten al mismo puerto.\n');
} else if (siteUrl) {
  console.log(`✅ URLs configuradas correctamente: ${siteUrl}\n`);
}
