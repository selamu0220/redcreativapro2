#!/usr/bin/env node
/**
 * Diagnóstico SEO Inteligente - Red Creativa Pro
 * Extrae URLs del sitemap y verifica su estado HTTP
 * 
 * Uso: node scripts/seo-diagnostic.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const SITEMAP_URL = 'https://redcreativa.pro/sitemap.xml';
const SITEMAP_INDEX_URL = 'https://redcreativa.pro/sitemap-0.xml';
const CONCURRENCY = 10; // Número de requests simultáneos
const TIMEOUT = 10000; // 10 segundos timeout

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Función para hacer requests HTTP/HTTPS
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    const req = client.request(url, { method: 'HEAD', timeout: TIMEOUT }, (res) => {
      resolve({
        statusCode: res.statusCode,
        headers: res.headers,
        url: url
      });
    });

    req.on('error', (error) => {
      reject({ url, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({ url, error: 'Timeout' });
    });

    req.end();
  });
}

// Extraer URLs del sitemap XML
function extractUrlsFromSitemap(xmlContent) {
  const urls = [];
  const locMatches = xmlContent.match(/<loc>([^<]+)<\/loc>/g);
  
  if (locMatches) {
    locMatches.forEach(match => {
      const url = match.replace(/<\/?loc>/g, '');
      urls.push(url);
    });
  }
  
  return urls;
}

// Verificar URLs en lotes para no sobrecargar
async function checkUrlsInBatches(urls, batchSize = CONCURRENCY) {
  const results = {
    ok: [],
    notFound: [],
    redirects: [],
    errors: [],
    timeouts: []
  };

  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`VERIFICANDO ${urls.length} URLs...`, 'cyan');
  log(`${'='.repeat(60)}\n`, 'cyan');

  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(urls.length / batchSize);
    
    log(`[Lote ${batchNumber}/${totalBatches}] Verificando ${batch.length} URLs...`, 'blue');
    
    const promises = batch.map(async (url) => {
      try {
        const result = await fetchUrl(url);
        const status = result.statusCode;
        
        if (status >= 200 && status < 300) {
          results.ok.push({ url, status });
          process.stdout.write(`${colors.green}.${colors.reset}`);
        } else if (status >= 300 && status < 400) {
          results.redirects.push({ url, status, location: result.headers.location });
          process.stdout.write(`${colors.yellow}R${colors.reset}`);
        } else if (status === 404) {
          results.notFound.push({ url, status });
          process.stdout.write(`${colors.red}✗${colors.reset}`);
        } else {
          results.errors.push({ url, status, error: `HTTP ${status}` });
          process.stdout.write(`${colors.magenta}E${colors.reset}`);
        }
      } catch (err) {
        if (err.error === 'Timeout') {
          results.timeouts.push({ url, error: 'Timeout' });
          process.stdout.write(`${colors.yellow}T${colors.reset}`);
        } else {
          results.errors.push({ url, status: 0, error: err.error });
          process.stdout.write(`${colors.red}!${colors.reset}`);
        }
      }
    });

    await Promise.all(promises);
    
    // Pequeña pausa entre lotes
    if (i + batchSize < urls.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n'); // Nueva línea después de los indicadores
  return results;
}

// Generar reporte
function generateReport(results, totalUrls) {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const reportDir = path.join(__dirname, '..', 'reports');
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportPath = path.join(reportDir, `seo-diagnostic-${timestamp}.json`);
  const summaryPath = path.join(reportDir, `seo-diagnostic-${timestamp}.txt`);

  // Reporte JSON completo
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  // Reporte de texto resumido
  const summary = `
DIAGNÓSTICO SEO - RED CREATIVA PRO
====================================
Fecha: ${new Date().toLocaleString()}
Total URLs analizadas: ${totalUrls}

RESULTADOS:
-----------
✓ OK (200):           ${results.ok.length} (${((results.ok.length / totalUrls) * 100).toFixed(1)}%)
✗ No encontrado (404): ${results.notFound.length} (${((results.notFound.length / totalUrls) * 100).toFixed(1)}%)
→ Redirecciones (3xx): ${results.redirects.length} (${((results.redirects.length / totalUrls) * 100).toFixed(1)}%)
⚠ Errores (5xx):       ${results.errors.length} (${((results.errors.length / totalUrls) * 100).toFixed(1)}%)
⏱ Timeouts:           ${results.timeouts.length} (${((results.timeouts.length / totalUrls) * 100).toFixed(1)}%)

URLs CON ERROR 404 (Necesitan atención):
=========================================
${results.notFound.map(r => `- ${r.url}`).join('\n') || 'Ninguna'}

REDIRECCIONES:
==============
${results.redirects.map(r => `- ${r.url} → ${r.location || '?'}`).join('\n') || 'Ninguna'}

ERRORES DEL SERVIDOR:
=====================
${results.errors.map(r => `- ${r.url} (Error: ${r.error})`).join('\n') || 'Ninguno'}

TIMEOUTS:
=========
${results.timeouts.map(r => `- ${r.url}`).join('\n') || 'Ninguno'}

RECOMENDACIONES INMEDIATAS:
===========================
${results.notFound.length > 0 ? `1. URGENTE: Hay ${results.notFound.length} URLs que devuelven 404
   - Verificar si el contenido existe en la base de datos
   - Crear redirecciones 301 si las URLs cambiaron
   - O eliminar estas URLs del sitemap` : '1. No hay errores 404 críticos ✓'}

${results.ok.length / totalUrls < 0.8 ? `2. Solo ${((results.ok.length / totalUrls) * 100).toFixed(0)}% de las URLs responden correctamente
   - Revisar la generación del sitemap
   - Asegurar que las URLs coincidan con el contenido real` : `2. ${((results.ok.length / totalUrls) * 100).toFixed(0)}% de URLs funcionan correctamente ✓`}

3. Próximos pasos:
   - Verificar Google Search Console
   - Comparar URLs funcionales con las registradas en Supabase
   - Generar sitemap.xml limpio solo con URLs reales

Archivo completo guardado en: ${reportPath}
`;

  fs.writeFileSync(summaryPath, summary);

  return { reportPath, summaryPath, summary };
}

// Función principal
async function main() {
  log('\n' + '='.repeat(60), 'magenta');
  log('  DIAGNÓSTICO SEO INTELIGENTE - RED CREATIVA PRO', 'magenta');
  log('  Verificación masiva de indexación', 'magenta');
  log('='.repeat(60) + '\n', 'magenta');

  try {
    // Intentar primero con sitemap-0.xml (generado por next-sitemap)
    log('Descargando sitemap...', 'blue');
    let sitemapContent = '';
    
    try {
      const response = await fetchUrl(SITEMAP_INDEX_URL);
      if (response.statusCode === 200) {
        log(`✓ Encontrado: ${SITEMAP_INDEX_URL}`, 'green');
        // Necesitamos hacer GET en lugar de HEAD para obtener el contenido
        const https = require('https');
        sitemapContent = await new Promise((resolve, reject) => {
          https.get(SITEMAP_INDEX_URL, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
          }).on('error', reject);
        });
      }
    } catch (e) {
      log(`✗ No se pudo acceder a sitemap-0.xml, intentando sitemap.xml...`, 'yellow');
    }

    // Si no funcionó, intentar con sitemap.xml
    if (!sitemapContent) {
      const https = require('https');
      sitemapContent = await new Promise((resolve, reject) => {
        https.get(SITEMAP_URL, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve(data));
        }).on('error', reject);
      });
    }

    log('✓ Sitemap descargado', 'green');

    // Extraer URLs
    const urls = extractUrlsFromSitemap(sitemapContent);
    log(`✓ ${urls.length} URLs extraídas del sitemap\n`, 'green');

    if (urls.length === 0) {
      log('ERROR: No se encontraron URLs en el sitemap', 'red');
      process.exit(1);
    }

    // Mostrar muestra de URLs
    log('Muestra de URLs encontradas:', 'cyan');
    urls.slice(0, 10).forEach(url => log(`  - ${url}`, 'reset'));
    if (urls.length > 10) {
      log(`  ... y ${urls.length - 10} más`, 'reset');
    }
    console.log('');

    // Verificar URLs
    const results = await checkUrlsInBatches(urls);

    // Generar reporte
    const { summaryPath, summary } = generateReport(results, urls.length);

    // Mostrar resumen en consola
    log('\n' + '='.repeat(60), 'cyan');
    log('RESUMEN DE RESULTADOS', 'cyan');
    log('='.repeat(60) + '\n', 'cyan');
    
    log(`✓ OK (200):           ${results.ok.length} URLs (${((results.ok.length / urls.length) * 100).toFixed(1)}%)`, 'green');
    log(`✗ No encontrado (404): ${results.notFound.length} URLs (${((results.notFound.length / urls.length) * 100).toFixed(1)}%)`, results.notFound.length > 0 ? 'red' : 'green');
    log(`→ Redirecciones (3xx): ${results.redirects.length} URLs (${((results.redirects.length / urls.length) * 100).toFixed(1)}%)`, 'yellow');
    log(`⚠ Errores (5xx):       ${results.errors.length} URLs (${((results.errors.length / urls.length) * 100).toFixed(1)}%)`, results.errors.length > 0 ? 'magenta' : 'green');
    log(`⏱ Timeouts:           ${results.timeouts.length} URLs (${((results.timeouts.length / urls.length) * 100).toFixed(1)}%)\n`, 'yellow');

    // Guardar listas separadas para uso posterior
    const reportsDir = path.join(__dirname, '..', 'reports');
    fs.writeFileSync(
      path.join(reportsDir, 'urls-200-ok.txt'),
      results.ok.map(r => r.url).join('\n')
    );
    fs.writeFileSync(
      path.join(reportsDir, 'urls-404-error.txt'),
      results.notFound.map(r => r.url).join('\n')
    );

    log(`✓ Reporte guardado en: ${summaryPath}`, 'green');
    log(`✓ Lista de URLs OK: ${path.join(reportsDir, 'urls-200-ok.txt')}`, 'green');
    log(`✓ Lista de URLs 404: ${path.join(reportsDir, 'urls-404-error.txt')}`, 'green');

    // Alertas críticas
    if (results.notFound.length > 50) {
      log(`\n🚨 ALERTA CRÍTICA: ${results.notFound.length} URLs devuelven 404`, 'red');
      log('   Esto está dañando severamente tu SEO.', 'red');
      log('   Acción requerida: Corregir sitemap o contenido inmediatamente.\n', 'red');
    }

    if (results.ok.length / urls.length < 0.7) {
      log(`\n⚠️  ADVERTENCIA: Menos del 70% de URLs funcionan`, 'yellow');
      log('    Revisar la generación del sitemap y la base de datos.\n', 'yellow');
    }

    log('\n' + '='.repeat(60), 'green');
    log('Diagnóstico completado exitosamente ✓', 'green');
    log('='.repeat(60) + '\n', 'green');

  } catch (error) {
    log(`\n✗ Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar si se corre directamente
if (require.main === module) {
  main();
}

module.exports = { extractUrlsFromSitemap, checkUrlsInBatches, fetchUrl };
