/**
 * Script de diagnóstico para verificar el flujo de autenticación
 * Ejecutar con: node diagnose-auth-flow.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnóstico del Flujo de Autenticación\n');
console.log('='.repeat(60));

// 1. Verificar variables de entorno de Kinde
console.log('\n1. Variables de Entorno de Kinde:');
const envFiles = ['.env', '.env.local'];
let kindeVars = {};

envFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach(line => {
      if (line.includes('KINDE_')) {
        const [key, value] = line.split('=');
        if (key && value) {
          kindeVars[key.trim()] = value.trim() ? '✅ Configurado' : '❌ Vacío';
        }
      }
    });
  }
});

const requiredKindeVars = [
  'KINDE_CLIENT_ID',
  'KINDE_CLIENT_SECRET',
  'KINDE_ISSUER_URL',
  'KINDE_SITE_URL',
  'KINDE_POST_LOGOUT_REDIRECT_URL',
  'KINDE_POST_LOGIN_REDIRECT_URL'
];

requiredKindeVars.forEach(varName => {
  const status = kindeVars[varName] || '❌ No encontrado';
  console.log(`   ${varName}: ${status}`);
});

// 2. Verificar archivos críticos
console.log('\n2. Archivos Críticos:');
const criticalFiles = [
  'app/components/WorkingAuthProvider.tsx',
  'app/components/ProtectedRoute.tsx',
  'app/hooks/useAuth.ts',
  'middleware.ts',
  'app/api/auth/[kindeAuth]/route.ts'
];

criticalFiles.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`   ${file}: ${exists ? '✅ Existe' : '❌ No encontrado'}`);
});

// 3. Verificar configuración del middleware
console.log('\n3. Configuración del Middleware:');
const middlewarePath = path.join(process.cwd(), 'middleware.ts');
if (fs.existsSync(middlewarePath)) {
  const content = fs.readFileSync(middlewarePath, 'utf-8');
  
  const hasKindeImport = content.includes('@kinde-oss/kinde-auth-nextjs/middleware');
  const hasProtectedPaths = content.includes('protectedPaths');
  const hasEscritorIA = content.includes('/escritor-ia');
  
  console.log(`   Importa Kinde: ${hasKindeImport ? '✅' : '❌'}`);
  console.log(`   Define rutas protegidas: ${hasProtectedPaths ? '✅' : '❌'}`);
  console.log(`   Protege /escritor-ia: ${hasEscritorIA ? '✅' : '❌'}`);
} else {
  console.log('   ❌ Middleware no encontrado');
}

// 4. Verificar página de escritor-ia
console.log('\n4. Página Escritor IA:');
const escritorPath = path.join(process.cwd(), 'app/escritor-ia/page.tsx');
if (fs.existsSync(escritorPath)) {
  const content = fs.readFileSync(escritorPath, 'utf-8');
  
  const hasProtectedRoute = content.includes('ProtectedRoute');
  const hasUseAuth = content.includes('useAuth');
  const hasWorkingClientLayout = content.includes('WorkingClientLayout');
  
  console.log(`   Usa ProtectedRoute: ${hasProtectedRoute ? '✅' : '❌'}`);
  console.log(`   Usa useAuth: ${hasUseAuth ? '✅' : '❌'}`);
  console.log(`   Usa WorkingClientLayout: ${hasWorkingClientLayout ? '✅' : '❌'}`);
} else {
  console.log('   ❌ Página no encontrada');
}

// 5. Resumen y recomendaciones
console.log('\n' + '='.repeat(60));
console.log('\n📋 RESUMEN Y RECOMENDACIONES:\n');

const issues = [];

if (!kindeVars['KINDE_CLIENT_ID'] || kindeVars['KINDE_CLIENT_ID'] === '❌ No encontrado') {
  issues.push('⚠️  Falta configurar KINDE_CLIENT_ID');
}

if (!kindeVars['KINDE_CLIENT_SECRET'] || kindeVars['KINDE_CLIENT_SECRET'] === '❌ No encontrado') {
  issues.push('⚠️  Falta configurar KINDE_CLIENT_SECRET');
}

if (!kindeVars['KINDE_ISSUER_URL'] || kindeVars['KINDE_ISSUER_URL'] === '❌ No encontrado') {
  issues.push('⚠️  Falta configurar KINDE_ISSUER_URL');
}

if (issues.length === 0) {
  console.log('✅ No se detectaron problemas de configuración');
  console.log('\n💡 Pasos siguientes:');
  console.log('   1. Ejecuta: npm run dev');
  console.log('   2. Abre: http://localhost:3000/escritor-ia');
  console.log('   3. Verifica que la autenticación funcione correctamente');
  console.log('   4. Revisa la consola del navegador para mensajes de [AUTH]');
} else {
  console.log('❌ Se detectaron los siguientes problemas:\n');
  issues.forEach(issue => console.log(`   ${issue}`));
  console.log('\n💡 Soluciones:');
  console.log('   1. Verifica tu archivo .env.local');
  console.log('   2. Copia las credenciales desde el dashboard de Kinde');
  console.log('   3. Reinicia el servidor de desarrollo');
}

console.log('\n' + '='.repeat(60));
