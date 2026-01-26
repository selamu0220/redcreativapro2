/**
 * Script de diagnóstico para página en blanco en producción
 * 
 * Este script ayuda a identificar la causa de la página en blanco
 */

console.log('🔍 DIAGNÓSTICO DE PÁGINA EN BLANCO\n');

// 1. Verificar variables de entorno críticas
console.log('1️⃣ Variables de Entorno:');
const criticalEnvVars = [
  'KINDE_CLIENT_ID',
  'KINDE_CLIENT_SECRET',
  'KINDE_ISSUER_URL',
  'KINDE_SITE_URL',
  'KINDE_POST_LOGOUT_REDIRECT_URL',
  'KINDE_POST_LOGIN_REDIRECT_URL',
  'NEXT_PUBLIC_KINDE_CLIENT_ID'
];

criticalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`   ❌ ${varName}: NO CONFIGURADA`);
  } else if (value.includes('localhost')) {
    console.log(`   ⚠️  ${varName}: ${value} (CONTIENE LOCALHOST - PROBLEMA EN PRODUCCIÓN)`);
  } else {
    console.log(`   ✅ ${varName}: ${value.substring(0, 20)}...`);
  }
});

console.log('\n2️⃣ Posibles Causas de Página en Blanco:\n');

const causes = [
  {
    title: 'URLs de Kinde con localhost',
    description: 'Las variables KINDE_SITE_URL, KINDE_POST_LOGIN_REDIRECT_URL o KINDE_POST_LOGOUT_REDIRECT_URL contienen localhost',
    solution: 'Cambiar todas las URLs a https://redcreativa.pro en Vercel',
    severity: 'CRÍTICO'
  },
  {
    title: 'Error de JavaScript no capturado',
    description: 'Un error en el cliente que no está siendo manejado por ErrorBoundary',
    solution: 'Revisar la consola del navegador (F12) en producción',
    severity: 'ALTO'
  },
  {
    title: 'Problema de hidratación de React',
    description: 'Diferencia entre el HTML del servidor y el renderizado del cliente',
    solution: 'Buscar warnings de hydration en la consola',
    severity: 'MEDIO'
  },
  {
    title: 'Componente que falla al montar',
    description: 'Un componente lanza un error durante useEffect o en el render inicial',
    solution: 'Revisar componentes con useKindeBrowserClient',
    severity: 'ALTO'
  },
  {
    title: 'Middleware bloqueando la página',
    description: 'El middleware está redirigiendo incorrectamente',
    solution: 'Verificar que las rutas públicas no estén protegidas',
    severity: 'MEDIO'
  }
];

causes.forEach((cause, index) => {
  console.log(`${index + 1}. [${cause.severity}] ${cause.title}`);
  console.log(`   Descripción: ${cause.description}`);
  console.log(`   Solución: ${cause.solution}\n`);
});

console.log('3️⃣ Pasos de Diagnóstico:\n');
console.log('   1. Abrir https://redcreativa.pro en modo incógnito');
console.log('   2. Presionar F12 para abrir DevTools');
console.log('   3. Ir a la pestaña Console');
console.log('   4. Buscar errores en rojo');
console.log('   5. Ir a la pestaña Network');
console.log('   6. Recargar la página (Ctrl+R)');
console.log('   7. Buscar requests que fallen (en rojo)\n');

console.log('4️⃣ Verificar en Vercel:\n');
console.log('   1. Ir a https://vercel.com/dashboard');
console.log('   2. Seleccionar el proyecto');
console.log('   3. Ir a Settings > Environment Variables');
console.log('   4. Verificar que NO haya "localhost" en ninguna variable');
console.log('   5. Ir al último deployment');
console.log('   6. Ver Runtime Logs para errores del servidor\n');

console.log('5️⃣ Solución Rápida (si es problema de Kinde):\n');
console.log('   En Vercel, actualizar estas variables:');
console.log('   KINDE_SITE_URL=https://redcreativa.pro');
console.log('   KINDE_POST_LOGIN_REDIRECT_URL=https://redcreativa.pro/dashboard');
console.log('   KINDE_POST_LOGOUT_REDIRECT_URL=https://redcreativa.pro');
console.log('   Luego hacer Redeploy\n');

console.log('✅ Diagnóstico completado. Revisa los puntos anteriores.\n');
