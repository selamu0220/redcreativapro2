#!/usr/bin/env node

/**
 * Script de diagnóstico para problemas de "Cargando sesión..." infinito
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnosticando problema de carga infinita de Clerk...\n');

// 1. Verificar .env.local
console.log('📋 Paso 1: Verificando variables de entorno\n');

const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ Error: No se encontró .env.local');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');

const requiredVars = {
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': 'Clave pública de Clerk',
  'CLERK_SECRET_KEY': 'Clave secreta de Clerk',
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL': 'URL de sign in',
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL': 'URL de sign up',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL': 'URL después de sign in',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL': 'URL después de sign up'
};

let allConfigured = true;
const config = {};

Object.entries(requiredVars).forEach(([varName, description]) => {
  const regex = new RegExp(`${varName}=(.+)`, 'm');
  const match = envContent.match(regex);
  
  if (match && match[1] && match[1].trim() !== '') {
    config[varName] = match[1].trim();
    console.log(`✅ ${varName}: ${match[1].substring(0, 30)}...`);
  } else {
    console.log(`❌ ${varName}: NO CONFIGURADA (${description})`);
    allConfigured = false;
  }
});

console.log('\n');

// 2. Verificar que las claves sean del tipo correcto
console.log('📋 Paso 2: Verificando tipo de claves\n');

if (config.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  if (config.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith('pk_live_')) {
    console.log('✅ Clave pública es de PRODUCCIÓN (pk_live_)');
  } else if (config.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith('pk_test_')) {
    console.log('⚠️  Clave pública es de DESARROLLO (pk_test_)');
  } else {
    console.log('❌ Clave pública tiene formato incorrecto');
    allConfigured = false;
  }
}

if (config.CLERK_SECRET_KEY) {
  if (config.CLERK_SECRET_KEY.startsWith('sk_live_')) {
    console.log('✅ Clave secreta es de PRODUCCIÓN (sk_live_)');
  } else if (config.CLERK_SECRET_KEY.startsWith('sk_test_')) {
    console.log('⚠️  Clave secreta es de DESARROLLO (sk_test_)');
  } else {
    console.log('❌ Clave secreta tiene formato incorrecto');
    allConfigured = false;
  }
}

console.log('\n');

// 3. Verificar archivos críticos
console.log('📋 Paso 3: Verificando archivos críticos\n');

const criticalFiles = [
  'app/components/WorkingAuthProvider.tsx',
  'app/components/Providers.tsx',
  'app/layout.tsx',
  'app/auth/page.tsx',
  'middleware.ts'
];

criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - NO ENCONTRADO`);
    allConfigured = false;
  }
});

console.log('\n');

// 4. Verificar next.config.js
console.log('📋 Paso 4: Verificando next.config.js\n');

const nextConfigPath = path.join(__dirname, 'next.config.js');
if (fs.existsSync(nextConfigPath)) {
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf-8');
  
  if (nextConfig.includes('typescript')) {
    console.log('✅ Configuración de TypeScript encontrada');
  }
  
  if (nextConfig.includes('webpack')) {
    console.log('✅ Configuración de Webpack encontrada');
  }
} else {
  console.log('❌ next.config.js no encontrado');
}

console.log('\n');

// 5. Resumen y recomendaciones
console.log('📊 RESUMEN\n');

if (allConfigured) {
  console.log('✅ Todas las configuraciones básicas están correctas\n');
  
  console.log('🔧 Soluciones para "Cargando sesión..." infinito:\n');
  console.log('1. Reinicia el servidor de desarrollo:');
  console.log('   npm run dev\n');
  
  console.log('2. Limpia la caché de Next.js:');
  console.log('   rmdir /s /q .next');
  console.log('   npm run dev\n');
  
  console.log('3. Verifica en el navegador:');
  console.log('   - Abre http://localhost:3001/test-clerk');
  console.log('   - Revisa la consola del navegador (F12)');
  console.log('   - Busca errores de Clerk\n');
  
  console.log('4. Verifica en Clerk Dashboard:');
  console.log('   - Ve a https://dashboard.clerk.com');
  console.log('   - Verifica que el dominio esté autorizado');
  console.log('   - Verifica que las claves sean correctas\n');
  
  console.log('5. Si el problema persiste:');
  console.log('   - El timeout de 3 segundos ahora permitirá que la app continúe');
  console.log('   - Revisa los logs del servidor para ver advertencias\n');
  
} else {
  console.log('❌ Hay problemas de configuración que deben resolverse\n');
  console.log('🔧 Acciones requeridas:\n');
  console.log('1. Configura todas las variables de entorno faltantes en .env.local');
  console.log('2. Ejecuta: node verify-clerk-config.js');
  console.log('3. Revisa CLERK_DOMAIN_CONFIGURATION.md para más detalles\n');
}

console.log('📚 Documentación:\n');
console.log('- CLERK_SETUP_CHECKLIST.md - Checklist completo');
console.log('- CLERK_DASHBOARD_SETUP.md - Configuración del dashboard');
console.log('- CLERK_DOMAIN_CONFIGURATION.md - Documentación técnica\n');

console.log('✨ Diagnóstico completado\n');
