#!/usr/bin/env node
/**
 * Script de Reindexación Masiva para Google Search Console
 * Solicita indexación de URLs en lotes
 * 
 * Uso: node scripts/bulk-reindex.js --urls=urls-200-ok.txt --limit=50
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Parsear argumentos
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    urlsFile: null,
    limit: 50,
    delay: 2000, // ms entre requests
    filter: null // filtrar por patrón
  };

  args.forEach(arg => {
    if (arg.startsWith('--urls=')) {
      options.urlsFile = arg.split('=')[1];
    } else if (arg.startsWith('--limit=')) {
      options.limit = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--delay=')) {
      options.delay = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--filter=')) {
      options.filter = arg.split('=')[1];
    }
  });

  return options;
}

// Simular indexación (esto requiere acceso a GSC API en producción)
async function requestIndexing(url, index) {
  // NOTA: Para implementación real, necesitarías:
  // 1. OAuth2 con Google
  // 2. Acceso a Indexing API
  // 3. Permisos en Google Search Console
  
  // Por ahora, generamos URLs para indexación manual
  const gscUrl = `https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent('sc-domain:redcreativa.pro')}&url=${encodeURIComponent(url)}`;
  
  return {
    url,
    gscUrl,
    status: 'manual_required',
    index
  };
}

async function main() {
  const options = parseArgs();

  log('\n' + '='.repeat(70), 'cyan');
  log('  SCRIPT DE REINDEXACIÓN MASIVA', 'cyan');
  log('  Generador de URLs para Google Search Console', 'cyan');
  log('='.repeat(70) + '\n', 'cyan');

  // Verificar archivo de URLs
  if (!options.urlsFile) {
    // Intentar encontrar automáticamente
    const reportsDir = path.join(__dirname, '..', 'reports');
    const possibleFiles = ['urls-200-ok.txt', 'urls-to-index.txt'];
    
    for (const file of possibleFiles) {
      const filePath = path.join(reportsDir, file);
      if (fs.existsSync(filePath)) {
        options.urlsFile = filePath;
        log(`✓ Archivo encontrado automáticamente: ${file}`, 'green');
        break;
      }
    }

    if (!options.urlsFile) {
      log('❌ No se especificó archivo de URLs', 'red');
      log('\nUso:', 'yellow');
      log('  node scripts/bulk-reindex.js --urls=reports/urls-200-ok.txt --limit=50', 'yellow');
      log('\nOpciones:', 'yellow');
      log('  --urls=archivo.txt    Archivo con URLs (una por línea)', 'yellow');
      log('  --limit=50            Máximo de URLs a procesar (default: 50)', 'yellow');
      log('  --delay=2000          Ms entre requests (default: 2000)', 'yellow');
      log('  --filter=blog         Solo URLs que contengan este patrón\n', 'yellow');
      process.exit(1);
    }
  }

  // Leer URLs
  if (!fs.existsSync(options.urlsFile)) {
    log(`❌ Archivo no encontrado: ${options.urlsFile}`, 'red');
    process.exit(1);
  }

  let urls = fs.readFileSync(options.urlsFile, 'utf8')
    .split('\n')
    .filter(url => url.trim() && url.startsWith('http'));

  log(`📄 ${urls.length} URLs cargadas del archivo`, 'blue');

  // Aplicar filtro si existe
  if (options.filter) {
    urls = urls.filter(url => url.includes(options.filter));
    log(`🔍 Filtro aplicado "${options.filter}": ${urls.length} URLs coinciden`, 'blue');
  }

  // Limitar cantidad
  const urlsToProcess = urls.slice(0, options.limit);
  log(`🎯 Procesando las primeras ${urlsToProcess.length} URLs\n`, 'cyan');

  // Priorizar URLs
  const priorityUrls = urlsToProcess.filter(url => url === 'https://redcreativa.pro/' || url === 'https://www.redcreativa.pro/');
  const blogUrls = urlsToProcess.filter(url => url.includes('/blog/') && !priorityUrls.includes(url));
  const otherUrls = urlsToProcess.filter(url => !priorityUrls.includes(url) && !blogUrls.includes(url));

  const prioritizedUrls = [...priorityUrls, ...blogUrls, ...otherUrls];

  log('Prioridad de indexación:', 'cyan');
  log(`  1. Homepage: ${priorityUrls.length}`, 'green');
  log(`  2. Blog posts: ${blogUrls.length}`, 'blue');
  log(`  3. Otras páginas: ${otherUrls.length}\n`, 'yellow');

  // Generar reporte de indexación
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const reportsDir = path.join(__dirname, '..', 'reports');
  
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const indexReport = {
    timestamp,
    totalUrls: prioritizedUrls.length,
    urls: prioritizedUrls.map((url, index) => ({
      priority: index + 1,
      url,
      gscUrl: `https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent('sc-domain:redcreativa.pro')}&url=${encodeURIComponent(url)}`,
      manualUrl: `https://search.google.com/search-console?resource_id=${encodeURIComponent('sc-domain:redcreativa.pro')}&action=inspect&url=${encodeURIComponent(url)}`
    }))
  };

  // Guardar reporte JSON
  const jsonPath = path.join(reportsDir, `reindex-queue-${timestamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(indexReport, null, 2));

  // Generar archivo de comandos para GSC
  const gscCommands = prioritizedUrls.map((url, i) => `
=== URL #${i + 1} ===
URL: ${url}
Abrir en GSC: https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent('sc-domain:redcreativa.pro')}&url=${encodeURIComponent(url)}

Pasos:
1. Abrir la URL de arriba
2. Esperar a que cargue el análisis
3. Click en "Request Indexing"
4. Esperar confirmación
5. Pasar al siguiente (~30 segundos por URL)
`).join('\n');

  const commandsPath = path.join(reportsDir, `gsc-commands-${timestamp}.txt`);
  fs.writeFileSync(commandsPath, gscCommands);

  // Generar script Python para Indexing API (opcional avanzado)
  const pythonScript = `
#!/usr/bin/env python3
"""
Script para Indexing API de Google
Requiere: pip install google-auth google-auth-oauthlib

Setup:
1. Crear proyecto en Google Cloud Console
2. Habilitar Indexing API
3. Crear credenciales OAuth2
4. Descargar client_secret.json
5. Ejecutar este script
"""

from google.oauth2 import service_account
from googleapiclient.discovery import build
import json

SCOPES = ['https://www.googleapis.com/auth/indexing']
SERVICE_ACCOUNT_FILE = 'client_secret.json'

URLs_TO_INDEX = [
${prioritizedUrls.slice(0, 100).map(url => `    "${url}"`).join(',\n')}
]

def index_urls():
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    
    service = build('indexing', 'v3', credentials=credentials)
    
    for url in URLs_TO_INDEX:
        try:
            response = service.urlNotifications().publish(
                body={"url": url, "type": "URL_UPDATED"}
            ).execute()
            print(f"✓ Indexed: {url}")
        except Exception as e:
            print(f"✗ Error indexing {url}: {e}")

if __name__ == '__main__':
    index_urls()
`;

  const pythonPath = path.join(reportsDir, `indexing-api-script-${timestamp}.py`);
  fs.writeFileSync(pythonPath, pythonScript);

  // Mostrar resumen
  log('\n' + '='.repeat(70), 'green');
  log('ARCHIVOS GENERADOS', 'green');
  log('='.repeat(70) + '\n', 'green');

  log(`✅ Cola de indexación (JSON):`, 'cyan');
  log(`   ${jsonPath}\n`, 'reset');

  log(`✅ Comandos para GSC (TXT):`, 'cyan');
  log(`   ${commandsPath}\n`, 'reset');

  log(`✅ Script Python Indexing API:`, 'cyan');
  log(`   ${pythonPath}\n`, 'reset');

  // Mostrar instrucciones
  log('='.repeat(70), 'yellow');
  log('INSTRUCCIONES DE USO', 'yellow');
  log('='.repeat(70) + '\n', 'yellow');

  log('MÉTODO 1: Manual (Recomendado para <50 URLs)', 'cyan');
  log('1. Ve a Google Search Console', 'reset');
  log('2. Selecciona tu propiedad: redcreativa.pro', 'reset');
  log('3. Para cada URL en el archivo de comandos:', 'reset');
  log('   - Abre la URL de inspección', 'reset');
  log('   - Espera el análisis', 'reset');
  log('   - Click "Solicitar Indexación"', 'reset');
  log('   - Espera ~30 segundos entre cada una\n', 'reset');

  log('MÉTODO 2: Indexing API (Para >100 URLs)', 'cyan');
  log('1. Ve a Google Cloud Console', 'reset');
  log('2. Crea un proyecto nuevo', 'reset');
  log('3. Habilita "Indexing API"', 'reset');
  log('4. Crea credenciales de servicio', 'reset');
  log('5. Descarga client_secret.json', 'reset');
  log(`6. Ejecuta: python ${pythonPath}\n`, 'reset');

  log('⚠️  IMPORTANTE:', 'red');
  log('   - No envíes más de 100 URLs por día manualmente', 'red');
  log('   - El Indexing API tiene cuotas (200 URLs/día)', 'red');
  log('   - Prioriza las URLs más importantes primero\n', 'red');

  // Mostrar las primeras 5 URLs
  log('='.repeat(70), 'magenta');
  log('PRIMERAS 5 URLs A INDEXAR', 'magenta');
  log('='.repeat(70) + '\n', 'magenta');

  prioritizedUrls.slice(0, 5).forEach((url, i) => {
    log(`${i + 1}. ${url}`, 'green');
    log(`   GSC: https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent('sc-domain:redcreativa.pro')}&url=${encodeURIComponent(url)}\n`, 'reset');
  });

  log('='.repeat(70), 'green');
  log('¡Listo para comenzar la reindexación! ✓', 'green');
  log('='.repeat(70) + '\n', 'green');
}

main();
