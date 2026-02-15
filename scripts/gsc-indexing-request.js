#!/usr/bin/env node
/**
 * Script de Indexación Google Search Console
 * Solicita indexación manual de URLs según estrategia "First Page in 7 Days"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// URLs a indexar (generadas por el sistema SEO)
const URLS_TO_INDEX = [
  {
    url: 'https://redcreativa.pro/blog/corrector-textos-ia-gratis',
    keyword: 'corrector textos ia gratis',
    priority: 'high',
    volume: 950
  },
  {
    url: 'https://redcreativa.pro/blog/ia-para-escribir-libros',
    keyword: 'ia para escribir libros',
    priority: 'high',
    volume: 890
  },
  {
    url: 'https://redcreativa.pro/blog/generador-contenido-ia-gratis',
    keyword: 'generador contenido ia gratis',
    priority: 'high',
    volume: 820
  },
  {
    url: 'https://redcreativa.pro/blog/copywriting-ia-redes-sociales',
    keyword: 'copywriting ia para redes sociales',
    priority: 'high',
    volume: 780
  },
  {
    url: 'https://redcreativa.pro/blog/mejor-escritor-ia-2025',
    keyword: 'mejor escritor ia 2025',
    priority: 'high',
    volume: 590
  }
];

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║  🔍 INDEXACIÓN GOOGLE SEARCH CONSOLE                    ║');
console.log('║  Estrategia: First Page in 7 Days                      ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

console.log('📋 URLs a Indexar:');
console.log('=' .repeat(70));

URLS_TO_INDEX.forEach((item, i) => {
  console.log(`\n${i + 1}. ${item.url}`);
  console.log(`   Keyword: "${item.keyword}"`);
  console.log(`   Volumen: ${item.volume} búsquedas/mes`);
  console.log(`   Prioridad: ${item.priority.toUpperCase()}`);
});

console.log('\n' + '=' .repeat(70));

// Instrucciones para indexación manual
console.log('\n📤 INSTRUCCIONES PARA INDEXACIÓN MANUAL (Tareas 61-70):');
console.log('\n1. Abre Google Search Console:');
console.log('   https://search.google.com/search-console');
console.log('\n2. Selecciona tu propiedad: redcreativa.pro');
console.log('\n3. Para cada URL:');
console.log('   a. Copia la URL de abajo');
console.log('   b. Pégala en la barra de búsqueda superior');
console.log('   c. Espera a que GSC cargue la información');
console.log('   d. Clic en "Solicitar indexación"');
console.log('   e. Confirma el envío');

console.log('\n' + '=' .repeat(70));
console.log('\n🔗 URLs Listas para Copiar:');

URLS_TO_INDEX.forEach((item, i) => {
  console.log(`\n${i + 1}. ${item.url}`);
});

console.log('\n' + '=' .repeat(70));

// Crear archivo CSV para importar
const csvContent = [
  'URL,Keyword,Volume,Priority,Status,Date Submitted',
  ...URLS_TO_INDEX.map(item => 
    `"${item.url}","${item.keyword}",${item.volume},"${item.priority}","PENDING","${new Date().toISOString()}"`
  )
].join('\n');

const outputDir = path.join(process.cwd(), 'seo-automation-results');
const csvPath = path.join(outputDir, 'gsc-indexing-queue.csv');

fs.writeFileSync(csvPath, csvContent);

console.log('\n✅ Archivo CSV creado: seo-automation-results/gsc-indexing-queue.csv');

// Crear reporte de indexación
const report = {
  timestamp: new Date().toISOString(),
  totalUrls: URLS_TO_INDEX.length,
  totalVolume: URLS_TO_INDEX.reduce((sum, item) => sum + item.volume, 0),
  urls: URLS_TO_INDEX,
  instructions: {
    manual: [
      'Ir a https://search.google.com/search-console',
      'Seleccionar propiedad: redcreativa.pro',
      'Usar barra de búsqueda superior para cada URL',
      'Clic en "Solicitar indexación"',
      'Esperar confirmación de envío'
    ],
    automatic: 'Requiere configuración de Service Account GSC API'
  },
  nextSteps: [
    'Indexar manualmente las 5 URLs en GSC',
    'Esperar 24-48 horas para indexación',
    'Verificar con site:URL en Google',
    'Monitorear posiciones día 3 y día 5'
  ],
  checkDates: {
    day1: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    day3: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    day5: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    day7: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  }
};

const reportPath = path.join(outputDir, 'gsc-indexing-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log('✅ Reporte JSON creado: seo-automation-results/gsc-indexing-report.json');

console.log('\n' + '=' .repeat(70));
console.log('\n⏰ CRONOGRAMA DE MONITOREO (Tareas 76-100):');
console.log(`\n📅 Día 1 (${new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()}): Verificar indexación`);
console.log(`📅 Día 3 (${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}): Primera verificación rankings`);
console.log(`📅 Día 5 (${new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}): Evaluación y optimización`);
console.log(`📅 Día 7 (${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}): Reporte final de resultados`);

console.log('\n' + '=' .repeat(70));
console.log('\n🎯 RESUMEN DE IMPLEMENTACIÓN:');
console.log(`   ✅ Keywords encontradas: 28`);
console.log(`   ✅ Keywords seleccionadas: ${URLS_TO_INDEX.length}`);
console.log(`   ✅ Posts creados: ${URLS_TO_INDEX.length}`);
console.log(`   ✅ Volumen total: ${report.totalVolume.toLocaleString()} búsquedas/mes`);
console.log(`   ⏳ URLs pendientes de indexación: ${URLS_TO_INDEX.length}`);

console.log('\n' + '=' .repeat(70));
console.log('\n📁 ARCHIVOS GENERADOS:');
console.log('   • seo-automation-results/phase1-keywords.json');
console.log('   • seo-automation-results/phase2-content.json');
console.log('   • seo-automation-results/phase3-indexing.json');
console.log('   • seo-automation-results/phase4-monitoring.json');
console.log('   • seo-automation-results/gsc-indexing-queue.csv');
console.log('   • seo-automation-results/gsc-indexing-report.json');
console.log('   • lib/blog-data.ts (actualizado con 5 nuevos posts)');

console.log('\n' + '=' .repeat(70));
console.log('\n🚀 PRÓXIMOS PASOS INMEDIATOS:');
console.log('\n1. Indexar las 5 URLs en Google Search Console (manual)');
console.log('2. Construir el proyecto: npm run build');
console.log('3. Desplegar a producción: git push');
console.log('4. Esperar indexación (24-48h)');
console.log('5. Monitorear rankings en día 3 y día 5');

console.log('\n' + '=' .repeat(70));
console.log('\n💡 CONSEJO PRO:');
console.log('   Si una URL no indexa en 48h, verifica:');
console.log('   • Que no tenga errores 404');
console.log('   • Que el sitemap.xml esté actualizado');
console.log('   • Que no tenga etiqueta noindex');
console.log('   • Que tenga internal links desde páginas indexadas');

console.log('\n' + '=' .repeat(70));
console.log('\n✅ ¡SISTEMA SEO "FIRST PAGE IN 7 DAYS" IMPLEMENTADO!');
console.log('\n');

// Exportar para uso programático
module.exports = { URLS_TO_INDEX, report };
