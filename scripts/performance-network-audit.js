#!/usr/bin/env node

/**
 * Performance & Core Web Vitals Audit Script
 * Analiza TTFB, headers de cache, y recursos estáticos
 * 
 * Uso: node scripts/performance-audit.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://redcreativa.pro';
const PAGES_TO_TEST = [
  '/',
  '/blog',
  '/escritor-ia',
  '/planes',
  '/prompts',
  '/de/blog',
  '/en/blog'
];

// Colores para terminal
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

/**
 * Mide TTFB (Time to First Byte)
 */
async function measureTTFB(url) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      const ttfb = Date.now() - start;
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          ttfb,
          status: res.statusCode,
          contentLength: data.length,
          headers: res.headers
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

/**
 * Verifica headers de caché
 */
function checkCacheHeaders(headers) {
  const issues = [];
  
  if (!headers['cache-control']) {
    issues.push('❌ Falta header Cache-Control');
  } else {
    const cacheControl = headers['cache-control'].toLowerCase();
    if (!cacheControl.includes('max-age') && !cacheControl.includes('immutable')) {
      issues.push('⚠️ Cache-Control sin max-age');
    }
  }
  
  if (!headers['content-encoding'] && headers['content-type']?.includes('text')) {
    issues.push('⚠️ Sin compresión gzip/brotli');
  }
  
  return issues;
}

/**
 * Verifica headers de seguridad
 */
function checkSecurityHeaders(headers) {
  const required = {
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'SAMEORIGIN',
    'x-xss-protection': '1; mode=block',
    'referrer-policy': 'origin-when-cross-origin'
  };
  
  const issues = [];
  
  for (const [header, expected] of Object.entries(required)) {
    if (!headers[header]) {
      issues.push(`❌ Falta ${header}`);
    } else if (!headers[header].toLowerCase().includes(expected.toLowerCase())) {
      issues.push(`⚠️ ${header} incorrecto: ${headers[header]}`);
    }
  }
  
  return issues;
}

/**
 * Analiza recursos estáticos
 */
async function analyzeStaticAssets() {
  log('\n📦 Analizando recursos estáticos...', 'cyan');
  
  const assets = [
    '/icon.png',
    '/og-default.jpg'
  ];
  
  const results = [];
  
  for (const asset of assets) {
    try {
      const result = await measureTTFB(`${BASE_URL}${asset}`);
      const issues = checkCacheHeaders(result.headers);
      
      results.push({
        asset,
        size: result.contentLength,
        ttfb: result.ttfb,
        issues
      });
      
      const sizeKB = (result.contentLength / 1024).toFixed(2);
      const status = result.ttfb < 100 && result.contentLength < 100000 ? 'green' : 'yellow';
      log(`  ${asset}: ${sizeKB}KB (TTFB: ${result.ttfb}ms)`, status);
      
      if (issues.length > 0) {
        issues.forEach(issue => log(`    ${issue}`, 'red'));
      }
    } catch (error) {
      log(`  ❌ ${asset}: ${error.message}`, 'red');
    }
  }
  
  return results;
}

/**
 * Audita páginas principales
 */
async function auditPages() {
  log('\n🌐 Auditando páginas principales...', 'cyan');
  
  const results = [];
  
  for (const page of PAGES_TO_TEST) {
    try {
      const url = `${BASE_URL}${page}`;
      const result = await measureTTFB(url);
      
      const cacheIssues = checkCacheHeaders(result.headers);
      const securityIssues = checkSecurityHeaders(result.headers);
      
      results.push({
        page,
        ttfb: result.ttfb,
        status: result.status,
        size: result.contentLength,
        cacheIssues,
        securityIssues
      });
      
      const status = result.ttfb < 200 ? 'green' : result.ttfb < 600 ? 'yellow' : 'red';
      log(`  ${page}: ${result.ttfb}ms (${(result.contentLength / 1024).toFixed(2)}KB)`, status);
      
      if (cacheIssues.length > 0) {
        cacheIssues.forEach(issue => log(`    ${issue}`, 'yellow'));
      }
      
      if (securityIssues.length > 0) {
        securityIssues.forEach(issue => log(`    ${issue}`, 'red'));
      }
      
    } catch (error) {
      log(`  ❌ ${page}: ${error.message}`, 'red');
      results.push({ page, error: error.message });
    }
  }
  
  return results;
}

/**
 * Genera recomendaciones
 */
function generateRecommendations(results) {
  log('\n📋 Recomendaciones de Performance:', 'magenta');
  
  const recommendations = [];
  
  // Analizar TTFB
  const slowPages = results.filter(r => r.ttfb > 600);
  if (slowPages.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      issue: 'TTFB lento (>600ms)',
      pages: slowPages.map(p => p.page),
      solution: 'Implementar cache en edge (Vercel Edge Config) o usar CDN'
    });
  }
  
  // Analizar tamaño
  const largePages = results.filter(r => r.size > 500000);
  if (largePages.length > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      issue: 'Páginas muy grandes (>500KB)',
      pages: largePages.map(p => p.page),
      solution: 'Implementar lazy loading, comprimir imágenes, code splitting'
    });
  }
  
  // Cache headers
  const noCachePages = results.filter(r => r.cacheIssues?.length > 0);
  if (noCachePages.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      issue: 'Headers de cache incorrectos',
      pages: noCachePages.map(p => p.page),
      solution: 'Configurar Cache-Control en next.config.mjs'
    });
  }
  
  // Mostrar recomendaciones
  if (recommendations.length === 0) {
    log('  ✅ No se encontraron problemas críticos', 'green');
  } else {
    recommendations.forEach(rec => {
      const color = rec.priority === 'HIGH' ? 'red' : 'yellow';
      log(`\n  [${rec.priority}] ${rec.issue}`, color);
      log(`  Páginas: ${rec.pages.join(', ')}`, 'reset');
      log(`  Solución: ${rec.solution}`, 'cyan');
    });
  }
  
  return recommendations;
}

/**
 * Genera reporte JSON
 */
function generateReport(results, assets) {
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {
      totalPages: results.length,
      averageTTFB: Math.round(results.reduce((acc, r) => acc + (r.ttfb || 0), 0) / results.length),
      slowPages: results.filter(r => r.ttfb > 600).length,
      issues: results.filter(r => (r.cacheIssues?.length || 0) + (r.securityIssues?.length || 0) > 0).length
    },
    pages: results,
    assets: assets
  };
  
  const reportPath = path.join(process.cwd(), 'performance-network-audit.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n📄 Reporte guardado: ${reportPath}`, 'blue');
  
  return report;
}

/**
 * Función principal
 */
async function main() {
  log('╔════════════════════════════════════════════════╗', 'cyan');
  log('║     AUDITORÍA DE PERFORMANCE - Red Creativa    ║', 'cyan');
  log('╚════════════════════════════════════════════════╝', 'cyan');
  log(`\n🎯 URL Base: ${BASE_URL}\n`, 'blue');
  
  try {
    // Auditar páginas
    const pageResults = await auditPages();
    
    // Analizar assets
    const assetResults = await analyzeStaticAssets();
    
    // Generar recomendaciones
    const recommendations = generateRecommendations(pageResults);
    
    // Generar reporte
    const report = generateReport(pageResults, assetResults);
    
    // Resumen final
    log('\n' + '═'.repeat(50), 'cyan');
    log('📊 RESUMEN:', 'magenta');
    log(`  Páginas auditadas: ${report.summary.totalPages}`, 'reset');
    log(`  TTFB promedio: ${report.summary.averageTTFB}ms`, report.summary.averageTTFB < 300 ? 'green' : 'yellow');
    log(`  Páginas lentas: ${report.summary.slowPages}`, report.summary.slowPages === 0 ? 'green' : 'red');
    log(`  Problemas encontrados: ${report.summary.issues}`, report.summary.issues === 0 ? 'green' : 'yellow');
    log('═'.repeat(50) + '\n', 'cyan');
    
    // Exit code basado en resultados
    const hasCriticalIssues = report.summary.slowPages > 0 || report.summary.issues > 3;
    process.exit(hasCriticalIssues ? 1 : 0);
    
  } catch (error) {
    log(`\n❌ Error en auditoría: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { measureTTFB, checkCacheHeaders, checkSecurityHeaders };
