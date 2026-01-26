#!/usr/bin/env node

/**
 * Script de verificación de configuración de Kinde
 * Verifica que todas las variables de entorno estén correctamente configuradas
 */

console.log('🔍 Verificando configuración de Kinde...\n');

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

const checks = {
  passed: [],
  failed: [],
  warnings: []
};

// Verificar variables requeridas
const requiredVars = {
  'KINDE_CLIENT_ID': process.env.KINDE_CLIENT_ID,
  'KINDE_CLIENT_SECRET': process.env.KINDE_CLIENT_SECRET,
  'KINDE_ISSUER_URL': process.env.KINDE_ISSUER_URL,
  'KINDE_SITE_URL': process.env.KINDE_SITE_URL,
  'KINDE_POST_LOGOUT_REDIRECT_URL': process.env.KINDE_POST_LOGOUT_REDIRECT_URL,
  'KINDE_POST_LOGIN_REDIRECT_URL': process.env.KINDE_POST_LOGIN_REDIRECT_URL
};

console.log('📋 Verificando variables de entorno:\n');

for (const [key, value] of Object.entries(requiredVars)) {
  if (!value) {
    checks.failed.push(`❌ ${key} no está definida`);
  } else {
    checks.passed.push(`✅ ${key} está definida`);
    
    // Verificar que las URLs usen HTTPS en producción
    if (key.includes('URL') && value.includes('redcreativa.pro')) {
      if (value.startsWith('http://')) {
        checks.warnings.push(`⚠️  ${key} usa HTTP en lugar de HTTPS: ${value}`);
      } else if (value.startsWith('https://')) {
        console.log(`   ✓ ${key} usa HTTPS correctamente`);
      }
    }
  }
}

console.log('\n' + '='.repeat(60) + '\n');

// Mostrar resultados
if (checks.passed.length > 0) {
  console.log('✅ Variables configuradas correctamente:\n');
  checks.passed.forEach(msg => console.log(`   ${msg}`));
  console.log('');
}

if (checks.warnings.length > 0) {
  console.log('⚠️  Advertencias:\n');
  checks.warnings.forEach(msg => console.log(`   ${msg}`));
  console.log('');
}

if (checks.failed.length > 0) {
  console.log('❌ Variables faltantes:\n');
  checks.failed.forEach(msg => console.log(`   ${msg}`));
  console.log('');
}

// Verificar valores específicos
console.log('🔍 Verificando valores específicos:\n');

const clientId = process.env.KINDE_CLIENT_ID;
const issuerUrl = process.env.KINDE_ISSUER_URL;
const siteUrl = process.env.KINDE_SITE_URL;

if (clientId === '5065812b70004d75809f8d535cb0daa6') {
  console.log('   ✓ Client ID correcto');
} else {
  console.log('   ⚠️  Client ID no coincide con el esperado');
}

if (issuerUrl === 'https://selamu.kinde.com') {
  console.log('   ✓ Issuer URL correcto');
} else {
  console.log('   ⚠️  Issuer URL no coincide con el esperado');
}

if (siteUrl === 'https://redcreativa.pro') {
  console.log('   ✓ Site URL correcto (HTTPS)');
} else if (siteUrl === 'http://redcreativa.pro') {
  console.log('   ❌ Site URL usa HTTP - debe ser HTTPS');
} else {
  console.log('   ⚠️  Site URL no coincide con el esperado');
}

console.log('\n' + '='.repeat(60) + '\n');

// Resumen final
const totalChecks = checks.passed.length + checks.failed.length;
const passRate = Math.round((checks.passed.length / totalChecks) * 100);

console.log('📊 Resumen:\n');
console.log(`   Total de verificaciones: ${totalChecks}`);
console.log(`   Pasadas: ${checks.passed.length}`);
console.log(`   Fallidas: ${checks.failed.length}`);
console.log(`   Advertencias: ${checks.warnings.length}`);
console.log(`   Tasa de éxito: ${passRate}%\n`);

if (checks.failed.length === 0 && checks.warnings.length === 0) {
  console.log('🎉 ¡Configuración local perfecta!\n');
  console.log('📝 Próximos pasos:\n');
  console.log('   1. Configurar las mismas URLs en Kinde Dashboard');
  console.log('   2. Verificar variables en Vercel');
  console.log('   3. Hacer redeploy en Vercel');
  console.log('   4. Probar el login en producción\n');
  console.log('📚 Ver: PASOS_FINALES_5_MINUTOS.md\n');
} else if (checks.failed.length === 0) {
  console.log('⚠️  Configuración local casi perfecta, pero hay advertencias.\n');
  console.log('📝 Revisa las advertencias arriba y corrígelas.\n');
} else {
  console.log('❌ Hay problemas en la configuración local.\n');
  console.log('📝 Revisa las variables faltantes y corrígelas en .env.local\n');
}

console.log('='.repeat(60) + '\n');

// URLs que deben estar en Kinde Dashboard
console.log('📋 URLs que debes agregar en Kinde Dashboard:\n');
console.log('Allowed callback URLs:');
console.log('   • https://redcreativa.pro/api/auth/kinde_callback');
console.log('   • http://localhost:3000/api/auth/kinde_callback\n');
console.log('Allowed logout redirect URLs:');
console.log('   • https://redcreativa.pro');
console.log('   • http://localhost:3000\n');

console.log('🔗 Dashboard: https://app.kinde.com/\n');
