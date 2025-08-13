#!/usr/bin/env node

/**
 * Script para encontrar peticiones inseguras que necesitan ser migradas
 * a usar el sistema de autenticación con tokens de Firebase
 */

const fs = require('fs');
const path = require('path');

// Patrones de peticiones inseguras
const INSECURE_PATTERNS = [
  // fetch con x-user-email manual
  /fetch\([^)]*\{[^}]*['"]x-user-email['"][^}]*\}/g,
  // fetch a rutas protegidas sin autenticación
  /fetch\(['"]\/(api\/(documents|folders|contacts|templates|email-pages|email-history|business-context|calendar|prompts|ai-studio-key|gmail-credentials|users|gmail-notification))/g,
  // Headers con x-user-email
  /headers:[^}]*['"]x-user-email['"]:/g,
  // Peticiones GET/POST/PUT/DELETE manuales a APIs protegidas
  /method:[\s]*['"](?:GET|POST|PUT|DELETE)['"][^}]*api\/(documents|folders|contacts|templates)/g
];

// Rutas protegidas que requieren autenticación
const PROTECTED_ROUTES = [
  '/api/documents',
  '/api/folders',
  '/api/contacts', 
  '/api/templates',
  '/api/email-pages',
  '/api/email-history',
  '/api/business-context',
  '/api/calendar',
  '/api/prompts',
  '/api/ai-studio-key',
  '/api/gmail-credentials',
  '/api/users/track-usage',
  '/api/users/check-admin',
  '/api/gmail-notification'
];

// Archivos a excluir del análisis
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /\.next/,
  /dist/,
  /build/,
  /coverage/,
  /\.md$/,
  /\.json$/,
  /middleware\.ts$/,
  /useAuthenticatedFetch\.ts$/
];

function shouldExcludeFile(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath));
}

function findInsecureRequests(dir, results = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (shouldExcludeFile(filePath)) {
      continue;
    }
    
    if (stat.isDirectory()) {
      findInsecureRequests(filePath, results);
    } else if (stat.isFile() && (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx'))) {
      analyzeFile(filePath, results);
    }
  }
  
  return results;
}

function analyzeFile(filePath, results) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Buscar patrones inseguros
    INSECURE_PATTERNS.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          issues.push({
            type: getPatternType(index),
            match: match.substring(0, 100) + (match.length > 100 ? '...' : ''),
            line: getLineNumber(content, match)
          });
        });
      }
    });
    
    // Buscar referencias a rutas protegidas
    PROTECTED_ROUTES.forEach(route => {
      const regex = new RegExp(`['"]${route.replace(/\//g, '\\/')}`, 'g');
      const matches = content.match(regex);
      if (matches) {
        // Verificar si ya usa autenticación
        const hasAuth = content.includes('useAuthenticatedFetch') || 
                       content.includes('useAuthenticatedGet') ||
                       content.includes('useAuthenticatedPost') ||
                       content.includes('useAuthenticatedPut') ||
                       content.includes('useAuthenticatedDelete');
        
        if (!hasAuth) {
          matches.forEach(match => {
            issues.push({
              type: 'unprotected_route',
              match: match,
              line: getLineNumber(content, match),
              route: route
            });
          });
        }
      }
    });
    
    if (issues.length > 0) {
      results.push({
        file: filePath,
        issues: issues
      });
    }
  } catch (error) {
    console.error(`Error analizando ${filePath}:`, error.message);
  }
}

function getPatternType(index) {
  const types = [
    'manual_x_user_email',
    'unprotected_fetch',
    'manual_headers',
    'manual_methods'
  ];
  return types[index] || 'unknown';
}

function getLineNumber(content, searchText) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(searchText.substring(0, 50))) {
      return i + 1;
    }
  }
  return 'unknown';
}

function generateReport(results) {
  console.log('\n🔍 ANÁLISIS DE SEGURIDAD - PETICIONES INSEGURAS\n');
  console.log('=' .repeat(60));
  
  if (results.length === 0) {
    console.log('✅ ¡Excelente! No se encontraron peticiones inseguras.');
    return;
  }
  
  console.log(`❌ Se encontraron ${results.length} archivos con peticiones inseguras:\n`);
  
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.file}`);
    console.log('   Issues:');
    
    result.issues.forEach(issue => {
      const icon = getIssueIcon(issue.type);
      console.log(`   ${icon} ${getIssueDescription(issue.type)} (línea ${issue.line})`);
      console.log(`      Código: ${issue.match}`);
      if (issue.route) {
        console.log(`      Ruta: ${issue.route}`);
      }
    });
    console.log('');
  });
  
  console.log('\n📋 RESUMEN POR TIPO DE PROBLEMA:\n');
  
  const summary = {};
  results.forEach(result => {
    result.issues.forEach(issue => {
      summary[issue.type] = (summary[issue.type] || 0) + 1;
    });
  });
  
  Object.entries(summary).forEach(([type, count]) => {
    console.log(`${getIssueIcon(type)} ${getIssueDescription(type)}: ${count} ocurrencias`);
  });
  
  console.log('\n🔧 PASOS PARA CORREGIR:\n');
  console.log('1. Importar hooks de autenticación:');
  console.log('   import { useAuthenticatedGet, useAuthenticatedPost } from \'../hooks/useAuthenticatedFetch\';');
  console.log('');
  console.log('2. Reemplazar fetch manual con hooks seguros:');
  console.log('   const { get } = useAuthenticatedGet();');
  console.log('   const data = await get(\'/api/documents\');');
  console.log('');
  console.log('3. Eliminar headers x-user-email manuales');
  console.log('');
  console.log('4. Verificar que las rutas estén en la lista de rutas protegidas del middleware');
  console.log('');
  console.log('📖 Ver SEGURIDAD_USUARIOS.md para más detalles.');
}

function getIssueIcon(type) {
  const icons = {
    'manual_x_user_email': '🔓',
    'unprotected_fetch': '⚠️',
    'manual_headers': '🔧',
    'manual_methods': '📡',
    'unprotected_route': '🚨'
  };
  return icons[type] || '❓';
}

function getIssueDescription(type) {
  const descriptions = {
    'manual_x_user_email': 'Header x-user-email manual (inseguro)',
    'unprotected_fetch': 'Fetch a ruta protegida sin autenticación',
    'manual_headers': 'Headers manuales con x-user-email',
    'manual_methods': 'Métodos HTTP manuales a APIs protegidas',
    'unprotected_route': 'Ruta protegida sin usar hooks de autenticación'
  };
  return descriptions[type] || 'Problema desconocido';
}

// Ejecutar análisis
const projectRoot = path.join(__dirname, '..');
const results = findInsecureRequests(projectRoot);
generateReport(results);

// Guardar reporte en archivo
const reportPath = path.join(projectRoot, 'security-audit-report.json');
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
console.log(`\n💾 Reporte detallado guardado en: ${reportPath}`);