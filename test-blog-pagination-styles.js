#!/usr/bin/env node

/**
 * Script para diagnosticar problemas de CSS en la paginación del blog
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnosticando problemas de CSS en la paginación del blog...\n');

// 1. Verificar si hay problemas con la carga de CSS
console.log('1. Verificando archivos CSS...');

const cssFiles = [
  'app/globals.css',
  'tailwind.config.js',
  'postcss.config.js'
];

cssFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} existe`);
  } else {
    console.log(`❌ ${file} no encontrado`);
  }
});

// 2. Verificar la configuración de Next.js
console.log('\n2. Verificando configuración de Next.js...');

if (fs.existsSync('next.config.js')) {
  const nextConfig = fs.readFileSync('next.config.js', 'utf8');
  console.log('✅ next.config.js existe');
  
  // Verificar si hay configuraciones que puedan afectar CSS
  if (nextConfig.includes('experimental')) {
    console.log('⚠️  Configuraciones experimentales detectadas');
  }
  
  if (nextConfig.includes('webpack')) {
    console.log('⚠️  Configuraciones de webpack personalizadas detectadas');
  }
} else {
  console.log('❌ next.config.js no encontrado');
}

// 3. Verificar el layout principal
console.log('\n3. Verificando layout principal...');

if (fs.existsSync('app/layout.tsx')) {
  const layout = fs.readFileSync('app/layout.tsx', 'utf8');
  console.log('✅ app/layout.tsx existe');
  
  // Verificar importación de CSS
  if (layout.includes("import './globals.css'")) {
    console.log('✅ globals.css importado correctamente');
  } else {
    console.log('❌ globals.css no importado en layout');
  }
  
  // Verificar fuentes
  if (layout.includes('Inter')) {
    console.log('✅ Fuente Inter configurada');
  }
} else {
  console.log('❌ app/layout.tsx no encontrado');
}

// 4. Verificar componentes del blog
console.log('\n4. Verificando componentes del blog...');

const blogComponents = [
  'app/blog/page.tsx',
  'app/blog/[id]/page.tsx',
  'components/blog/BlogPostClient.tsx'
];

blogComponents.forEach(component => {
  if (fs.existsSync(component)) {
    console.log(`✅ ${component} existe`);
    
    const content = fs.readFileSync(component, 'utf8');
    
    // Verificar si usa 'use client'
    if (content.includes("'use client'")) {
      console.log(`   📱 ${component} es un componente cliente`);
    }
    
    // Verificar clases de Tailwind problemáticas
    const problematicClasses = [
      'bg-blue-',
      'text-blue-',
      'border-blue-'
    ];
    
    problematicClasses.forEach(cls => {
      if (content.includes(cls)) {
        console.log(`   ⚠️  ${component} usa clases ${cls}* que pueden tener overrides`);
      }
    });
    
  } else {
    console.log(`❌ ${component} no encontrado`);
  }
});

// 5. Verificar si hay CSS conflictivo
console.log('\n5. Verificando posibles conflictos de CSS...');

if (fs.existsSync('app/globals.css')) {
  const globalCSS = fs.readFileSync('app/globals.css', 'utf8');
  
  // Verificar overrides con !important
  const importantCount = (globalCSS.match(/!important/g) || []).length;
  console.log(`⚠️  Encontrados ${importantCount} usos de !important en globals.css`);
  
  // Verificar si hay CSS específico para paginación
  if (globalCSS.includes('pagination') || globalCSS.includes('page-')) {
    console.log('✅ CSS específico para paginación encontrado');
  } else {
    console.log('❌ No se encontró CSS específico para paginación');
  }
  
  // Verificar media queries problemáticas
  const mediaQueries = (globalCSS.match(/@media/g) || []).length;
  console.log(`📱 Encontradas ${mediaQueries} media queries`);
}

// 6. Generar recomendaciones
console.log('\n📋 RECOMENDACIONES PARA SOLUCIONAR EL PROBLEMA:\n');

console.log('1. 🔧 Verificar la carga de CSS en tiempo de ejecución:');
console.log('   - Abrir DevTools en la tercera página del blog');
console.log('   - Verificar si globals.css se carga correctamente');
console.log('   - Comprobar si hay errores de red en la pestaña Network\n');

console.log('2. 🎨 Verificar conflictos de CSS:');
console.log('   - Revisar si hay CSS inline que sobrescriba los estilos');
console.log('   - Verificar si hay componentes que inyecten CSS dinámicamente');
console.log('   - Comprobar si hay CSS-in-JS que cause conflictos\n');

console.log('3. 🔄 Verificar hidratación:');
console.log('   - El problema podría ser de hidratación diferida');
console.log('   - Verificar si los estilos se aplican después de la hidratación');
console.log('   - Comprobar si hay diferencias entre SSR y CSR\n');

console.log('4. 📱 Verificar paginación específica:');
console.log('   - El problema podría estar en la lógica de paginación');
console.log('   - Verificar si los componentes se re-renderizan correctamente');
console.log('   - Comprobar si hay memory leaks en los estilos\n');

console.log('5. 🛠️  Soluciones inmediatas a probar:');
console.log('   - Forzar re-render con key prop en la paginación');
console.log('   - Añadir CSS específico para la tercera página');
console.log('   - Verificar si es un problema de lazy loading de CSS');

console.log('\n✨ Ejecuta este script después de hacer cambios para verificar mejoras.');