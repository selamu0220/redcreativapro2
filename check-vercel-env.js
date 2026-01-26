// Script para verificar las variables de entorno de Kinde en producción
console.log('=== VERIFICACIÓN DE VARIABLES DE ENTORNO KINDE ===\n');

const requiredVars = [
  'KINDE_CLIENT_ID',
  'KINDE_CLIENT_SECRET',
  'KINDE_ISSUER_URL',
  'KINDE_SITE_URL',
  'KINDE_POST_LOGOUT_REDIRECT_URL',
  'KINDE_POST_LOGIN_REDIRECT_URL'
];

let allPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const isSet = !!value;
  const display = isSet ? (varName.includes('SECRET') ? '***OCULTO***' : value) : '❌ NO CONFIGURADA';
  
  console.log(`${varName}: ${display}`);
  
  if (!isSet) {
    allPresent = false;
  }
});

console.log('\n=== RESULTADO ===');
if (allPresent) {
  console.log('✅ Todas las variables están configuradas');
} else {
  console.log('❌ Faltan variables de entorno');
  console.log('\nPara configurar en Vercel:');
  console.log('1. Ve a tu proyecto en Vercel');
  console.log('2. Settings > Environment Variables');
  console.log('3. Agrega las variables faltantes para Production');
  console.log('\nValores recomendados para producción:');
  console.log('KINDE_SITE_URL=https://redcreativa.pro');
  console.log('KINDE_POST_LOGOUT_REDIRECT_URL=https://redcreativa.pro');
  console.log('KINDE_POST_LOGIN_REDIRECT_URL=https://redcreativa.pro/dashboard');
}

console.log('\n=== CALLBACK URLs EN KINDE ===');
console.log('Asegúrate de tener estas URLs en Kinde:');
console.log('Allowed callback URLs:');
console.log('  - https://redcreativa.pro/api/auth/kinde_callback');
console.log('  - http://localhost:3000/api/auth/kinde_callback');
console.log('\nAllowed logout redirect URLs:');
console.log('  - https://redcreativa.pro');
console.log('  - http://localhost:3000');
