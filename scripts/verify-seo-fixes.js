#!/usr/bin/env node
/**
 * VERIFICACIÓN FINAL DE CORRECCIONES SEO
 * 
 * Este script verifica que todos los fixes SEO se han aplicado correctamente
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICACIÓN FINAL DE CORRECCIONES SEO\n');
console.log('========================================\n');

const checks = {
  passed: [],
  failed: [],
  warnings: [],
};

// Función para verificar si existe un archivo
function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    checks.passed.push(`✅ ${description}`);
    return true;
  } else {
    checks.failed.push(`❌ ${description} - No encontrado: ${filePath}`);
    return false;
  }
}

// Función para verificar contenido de archivo
function checkFileContains(filePath, searchString, description) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) {
    checks.failed.push(`❌ ${description} - Archivo no existe: ${filePath}`);
    return false;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  if (content.includes(searchString)) {
    checks.passed.push(`✅ ${description}`);
    return true;
  } else {
    checks.failed.push(`❌ ${description} - No contiene: "${searchString.substring(0, 50)}..."`);
    return false;
  }
}

// =====================================================
// VERIFICACIONES
// =====================================================

console.log('📋 Verificando archivos y configuraciones...\n');

// 1. robots.txt
checkFile('public/robots.txt', 'robots.txt existe');
checkFileContains('public/robots.txt', 'GPTBot', 'robots.txt incluye GPTBot');
checkFileContains('public/robots.txt', 'ClaudeBot', 'robots.txt incluye ClaudeBot');
checkFileContains('public/robots.txt', 'PerplexityBot', 'robots.txt incluye PerplexityBot');
checkFileContains('public/robots.txt', 'Sitemap:', 'robots.txt incluye referencias a sitemap');

// 2. Página 404
checkFile('app/not-found.tsx', 'Página 404 personalizada existe');
checkFileContains('app/not-found.tsx', 'Link href="/"', '404 incluye link al inicio');
checkFileContains('app/not-found.tsx', '404', '404 muestra código de error');

// 3. Helper de canonical
checkFile('lib/canonical.ts', 'Helper de canonical existe');
checkFileContains('lib/canonical.ts', 'generateCanonicalUrl', 'Helper incluye generateCanonicalUrl');
checkFileContains('lib/canonical.ts', 'generateAlternateUrls', 'Helper incluye generateAlternateUrls');

// 4. Blog pages con canonical
checkFileContains(
  'app/blog/(listing)/page.tsx', 
  "canonical: 'https://redcreativa.pro/blog'", 
  'Blog listing tiene canonical correcto'
);

checkFileContains(
  'app/blog/[slug]/page.tsx',
  'canonical:',
  'Blog post tiene canonical dinámico'
);

checkFileContains(
  'app/blog/[slug]/page.tsx',
  "'@type': 'Article'",
  'Blog post incluye Schema Article'
);

// 5. Redirecciones en next.config.mjs
checkFileContains(
  'next.config.mjs',
  'permanent: true',
  'next.config.mjs incluye redirecciones 301'
);

checkFileContains(
  'next.config.mjs',
  "value: 'www.redcreativa.pro'",
  'Redirección www→non-www configurada'
);

// 6. Archivos de documentación
checkFile('SEO_INDEXING_REPORT.md', 'Reporte SEO completo existe');
checkFile('SEO_INDEXING_CHECKLIST.md', 'Checklist de acciones existe');

// 7. Sitemap
checkFile('public/sitemap.xml', 'Sitemap principal existe');

// =====================================================
// RESULTADOS
// =====================================================

console.log('\n========================================');
console.log('📊 RESULTADOS DE LA VERIFICACIÓN');
console.log('========================================\n');

console.log(`✅ Verificaciones exitosas: ${checks.passed.length}`);
checks.passed.forEach(check => console.log(`   ${check}`));

console.log(`\n❌ Verificaciones fallidas: ${checks.failed.length}`);
if (checks.failed.length > 0) {
  checks.failed.forEach(check => console.log(`   ${check}`));
} else {
  console.log('   Ninguna - Todas las verificaciones pasaron!');
}

console.log(`\n⚠️  Advertencias: ${checks.warnings.length}`);
if (checks.warnings.length > 0) {
  checks.warnings.forEach(warning => console.log(`   ${warning}`));
} else {
  console.log('   Ninguna');
}

// =====================================================
// RESUMEN FINAL
// =====================================================

console.log('\n========================================');
console.log('🎯 RESUMEN FINAL');
console.log('========================================\n');

if (checks.failed.length === 0) {
  console.log('🎉 ¡TODAS LAS CORRECCIONES SEO CRÍTICAS HAN SIDO APLICADAS!\n');
  console.log('📁 Archivos creados/modificados:');
  console.log('   ✅ public/robots.txt - Optimizado para bots de IA');
  console.log('   ✅ app/not-found.tsx - Página 404 personalizada');
  console.log('   ✅ lib/canonical.ts - Helper de canonical URLs');
  console.log('   ✅ app/blog/[slug]/page.tsx - Canonical y Schema implementados');
  console.log('   ✅ app/blog/(listing)/page.tsx - Canonical implementado');
  console.log('   ✅ next.config.mjs - Redirecciones 301 verificadas');
  console.log('   ✅ SEO_INDEXING_REPORT.md - Reporte completo');
  console.log('   ✅ SEO_INDEXING_CHECKLIST.md - Checklist de acciones\n');
  
  console.log('🚀 SIGUIENTES PASOS:');
  console.log('   1. Ejecutar: npm run build');
  console.log('   2. Verificar en desarrollo que los canonicals estén presentes');
  console.log('   3. Desplegar a producción');
  console.log('   4. Ir a Google Search Console y:');
  console.log('      - Solicitar indexación de páginas principales');
  console.log('      - Revisar reporte de cobertura');
  console.log('      - Validar correcciones\n');
  
  console.log('📖 DOCUMENTACIÓN:');
  console.log('   • SEO_INDEXING_REPORT.md - Reporte completo de estado');
  console.log('   • SEO_INDEXING_CHECKLIST.md - Lista de acciones manuales\n');
  
  process.exit(0);
} else {
  console.log('⚠️  ALGUNAS VERIFICACIONES FALLARON\n');
  console.log('Por favor revisa los errores arriba y corrige antes de continuar.\n');
  process.exit(1);
}
