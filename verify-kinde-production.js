#!/usr/bin/env node

/**
 * Script para verificar la configuración de Kinde en producción
 * Ejecutar: node verify-kinde-production.js
 */

console.log('🔍 Verificando configuración de Kinde...\n');

const requiredVars = {
  'KINDE_CLIENT_ID': process.env.KINDE_CLIENT_ID,
  'KINDE_CLIENT_SECRET': process.env.KINDE_CLIENT_SECRET,
  'KINDE_ISSUER_URL': process.env.KINDE_ISSUER_URL,
  'KINDE_SITE_URL': process.env.KINDE_SITE_URL,
  'KINDE_POST_LOGOUT_REDIRECT_URL': process.env.KINDE_POST_LOGOUT_REDIRECT_URL,
  'KINDE_POST_LOGIN_REDIRECT_URL': process.env.KINDE_POST_LOGIN_REDIRECT_URL,
};

let hasErrors = false;

console.log('📋 Variables de entorno encontradas:\n');

for (const [key, value] of Object.entries(requiredVars)) {
  if (!value) {
    console.log(`❌ ${key}: NO DEFINIDA`);
    hasErrors = true;
  } else {
    // Ocultar secretos
    const displayValue = key.includes('SECRET') 
      ? value.substring(0, 10) + '...' 
      : value;
    
    console.log(`✅ ${key}: ${displayValue}`);
    
    // Verificar si contiene localhost en producción
    if (value.includes('localhost') && process.env.NODE_ENV === 'production') {
      console.log(`   ⚠️  ADVERTENCIA: Contiene "localhost" en producción!`);
      hasErrors = true;
    }
  }
}

console.log('\n📊 Resumen de verificación:\n');

if (hasErrors) {
  console.log('❌ Se encontraron problemas en la configuración');
  console.log('\n📖 Solución:');
  console.log('1. Ve a Vercel Dashboard → Settings → Environment Variables');
  console.log('2. Actualiza las variables con URLs de producción:');
  console.log('   - KINDE_SITE_URL=https://redcreativa.pro');
  console.log('   - KINDE_POST_LOGOUT_REDIRECT_URL=https://redcreativa.pro');
  console.log('   - KINDE_POST_LOGIN_REDIRECT_URL=https://redcreativa.pro/dashboard');
  console.log('\n3. También actualiza en Kinde Dashboard:');
  console.log('   - Allowed callback URLs: https://redcreativa.pro/api/auth/kinde_callback');
  console.log('   - Allowed logout redirect URLs: https://redcreativa.pro');
  console.log('\n📄 Lee FIX_KINDE_PRODUCTION_500.md para más detalles');
  process.exit(1);
} else {
  console.log('✅ Configuración correcta');
  console.log('\n🔗 URLs configuradas:');
  console.log(`   Site URL: ${requiredVars.KINDE_SITE_URL}`);
  console.log(`   Login redirect: ${requiredVars.KINDE_POST_LOGIN_REDIRECT_URL}`);
  console.log(`   Logout redirect: ${requiredVars.KINDE_POST_LOGOUT_REDIRECT_URL}`);
  process.exit(0);
}
