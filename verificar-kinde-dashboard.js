#!/usr/bin/env node

/**
 * Script para ayudar a verificar la configuración de Kinde
 * Este script NO puede acceder al dashboard de Kinde (requiere login manual)
 * Pero puede ayudarte a verificar que tu configuración local es correcta
 */

console.log('\n🔍 VERIFICACIÓN DE CONFIGURACIÓN KINDE\n');
console.log('=' .repeat(60));

// Leer variables de entorno
require('dotenv').config({ path: '.env.local' });

const config = {
  clientId: process.env.KINDE_CLIENT_ID,
  clientSecret: process.env.KINDE_CLIENT_SECRET,
  issuerUrl: process.env.KINDE_ISSUER_URL,
  siteUrl: process.env.KINDE_SITE_URL,
  postLogoutUrl: process.env.KINDE_POST_LOGOUT_REDIRECT_URL,
  postLoginUrl: process.env.KINDE_POST_LOGIN_REDIRECT_URL,
};

console.log('\n📋 CONFIGURACIÓN LOCAL (.env.local):\n');

// Verificar cada variable
const checks = [];

// Client ID
if (config.clientId === '5065812b70004d75809f8d535cb0daa6') {
  console.log('✅ KINDE_CLIENT_ID: Correcto');
  checks.push(true);
} else {
  console.log(`❌ KINDE_CLIENT_ID: ${config.clientId || 'NO DEFINIDO'}`);
  console.log('   Debería ser: 5065812b70004d75809f8d535cb0daa6');
  checks.push(false);
}

// Client Secret
if (config.clientSecret && config.clientSecret.length > 20) {
  console.log('✅ KINDE_CLIENT_SECRET: Definido');
  checks.push(true);
} else {
  console.log('❌ KINDE_CLIENT_SECRET: NO DEFINIDO o inválido');
  checks.push(false);
}

// Issuer URL
if (config.issuerUrl === 'https://selamu.kinde.com') {
  console.log('✅ KINDE_ISSUER_URL: Correcto');
  checks.push(true);
} else {
  console.log(`❌ KINDE_ISSUER_URL: ${config.issuerUrl || 'NO DEFINIDO'}`);
  console.log('   Debería ser: https://selamu.kinde.com');
  checks.push(false);
}

// Site URL
if (config.siteUrl === 'https://redcreativa.pro') {
  console.log('✅ KINDE_SITE_URL: Correcto (HTTPS)');
  checks.push(true);
} else if (config.siteUrl === 'http://redcreativa.pro') {
  console.log('⚠️  KINDE_SITE_URL: Usa HTTP en lugar de HTTPS');
  console.log('   Debería ser: https://redcreativa.pro');
  checks.push(false);
} else {
  console.log(`❌ KINDE_SITE_URL: ${config.siteUrl || 'NO DEFINIDO'}`);
  console.log('   Debería ser: https://redcreativa.pro');
  checks.push(false);
}

// Post Logout URL
if (config.postLogoutUrl === 'https://redcreativa.pro') {
  console.log('✅ KINDE_POST_LOGOUT_REDIRECT_URL: Correcto (HTTPS)');
  checks.push(true);
} else if (config.postLogoutUrl === 'http://redcreativa.pro') {
  console.log('⚠️  KINDE_POST_LOGOUT_REDIRECT_URL: Usa HTTP en lugar de HTTPS');
  console.log('   Debería ser: https://redcreativa.pro');
  checks.push(false);
} else {
  console.log(`❌ KINDE_POST_LOGOUT_REDIRECT_URL: ${config.postLogoutUrl || 'NO DEFINIDO'}`);
  console.log('   Debería ser: https://redcreativa.pro');
  checks.push(false);
}

// Post Login URL
if (config.postLoginUrl === 'https://redcreativa.pro/dashboard') {
  console.log('✅ KINDE_POST_LOGIN_REDIRECT_URL: Correcto (HTTPS)');
  checks.push(true);
} else if (config.postLoginUrl === 'http://redcreativa.pro/dashboard') {
  console.log('⚠️  KINDE_POST_LOGIN_REDIRECT_URL: Usa HTTP en lugar de HTTPS');
  console.log('   Debería ser: https://redcreativa.pro/dashboard');
  checks.push(false);
} else {
  console.log(`❌ KINDE_POST_LOGIN_REDIRECT_URL: ${config.postLoginUrl || 'NO DEFINIDO'}`);
  console.log('   Debería ser: https://redcreativa.pro/dashboard');
  checks.push(false);
}

console.log('\n' + '='.repeat(60));

// Resumen
const allCorrect = checks.every(check => check);

if (allCorrect) {
  console.log('\n✅ CONFIGURACIÓN LOCAL: CORRECTA\n');
} else {
  console.log('\n❌ CONFIGURACIÓN LOCAL: TIENE ERRORES\n');
  console.log('Corrige los errores en tu archivo .env.local\n');
}

console.log('='.repeat(60));

// URLs que deben estar en Kinde Dashboard
console.log('\n📋 URLS QUE DEBEN ESTAR EN KINDE DASHBOARD:\n');
console.log('Ve a: https://app.kinde.com/');
console.log('Applications → Red Creativa Pro → Details\n');

console.log('1️⃣  Application homepage URI:');
console.log('   https://redcreativa.pro\n');

console.log('2️⃣  Application login URI:');
console.log('   https://redcreativa.pro/api/auth/login\n');

console.log('3️⃣  Allowed callback URLs (una por línea):');
console.log('   https://redcreativa.pro/api/auth/kinde_callback');
console.log('   http://localhost:3000/api/auth/kinde_callback\n');

console.log('4️⃣  Allowed logout redirect URLs (una por línea):');
console.log('   https://redcreativa.pro');
console.log('   http://localhost:3000\n');

console.log('='.repeat(60));

console.log('\n🎯 PASOS PARA VERIFICAR EN KINDE:\n');
console.log('1. Abre: https://app.kinde.com/');
console.log('2. Ve a Applications → Red Creativa Pro');
console.log('3. Verifica que el Client ID sea: 5065812b70004d75809f8d535cb0daa6');
console.log('4. Ve a la pestaña "Details"');
console.log('5. Verifica que las callback URLs estén exactamente como arriba');
console.log('6. Si no están, cópialas y pégalas');
console.log('7. Haz clic en "Save"');
console.log('8. ESPERA a ver un mensaje de confirmación');
console.log('9. Refresca la página (F5) y verifica que siguen ahí');
console.log('10. Si siguen ahí después de refrescar, están guardadas correctamente\n');

console.log('='.repeat(60));

console.log('\n🔧 TROUBLESHOOTING:\n');
console.log('Si el error persiste después de guardar en Kinde:');
console.log('1. Espera 1-2 minutos (Kinde puede tardar en propagar cambios)');
console.log('2. Prueba en modo incógnito (Ctrl+Shift+N)');
console.log('3. Limpia la caché del navegador (Ctrl+Shift+Delete)');
console.log('4. Verifica que estás en la aplicación correcta (Client ID)');
console.log('5. Toma una captura de pantalla del dashboard de Kinde\n');

console.log('='.repeat(60));

console.log('\n📸 CAPTURA DE PANTALLA:\n');
console.log('Para ayudarte mejor, toma una captura de pantalla de:');
console.log('- El dashboard de Kinde mostrando las "Allowed callback URLs"');
console.log('- El Client ID visible en la página');
console.log('- El error completo que recibes al intentar hacer login\n');

console.log('='.repeat(60));

console.log('\n💡 INFORMACIÓN ADICIONAL:\n');
console.log('El callback URL es la URL a la que Kinde redirige después del login.');
console.log('Kinde REQUIERE que esta URL esté registrada por seguridad.');
console.log('No se puede configurar desde código, DEBE hacerse en el dashboard.\n');

console.log('Si funciona en local pero no en producción:');
console.log('- Local usa: http://localhost:3000/api/auth/kinde_callback');
console.log('- Producción usa: https://redcreativa.pro/api/auth/kinde_callback');
console.log('- Ambas URLs deben estar registradas en Kinde\n');

console.log('='.repeat(60));

// Generar comando para abrir dashboards
console.log('\n🚀 COMANDOS ÚTILES:\n');
console.log('Abrir Kinde Dashboard:');
console.log('   start https://app.kinde.com/\n');
console.log('Abrir Vercel Dashboard:');
console.log('   start https://vercel.com/selamu0220s-projects/redcreativapro2/settings/environment-variables\n');
console.log('Abrir sitio en producción:');
console.log('   start https://redcreativa.pro\n');

console.log('='.repeat(60));
console.log('\n');
