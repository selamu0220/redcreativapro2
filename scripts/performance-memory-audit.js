#!/usr/bin/env node

/**
 * Performance and Memory Audit Script for Escritor IA
 * Detects and fixes memory leaks and performance issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Iniciando auditoría de rendimiento y memoria...\n');

// Files to audit for performance issues
const filesToAudit = [
  'app/escritor-ia/page.tsx',
  'app/escritor-ia/components/EscritorIAEditor.tsx',
  'app/hooks/useAISettings.ts',
  'app/lib/performance/MemoryManager.ts',
  'app/lib/performance/MemoryLeakDetector.ts'
];

// Performance issues to detect
const performanceIssues = [
  {
    name: 'Excessive useEffect dependencies',
    pattern: /useEffect\([^,]+,\s*\[[^\]]{50,}\]/g,
    severity: 'medium',
    fix: 'Reduce useEffect dependencies or use useCallback/useMemo'
  },
  {
    name: 'Missing cleanup in useEffect',
    pattern: /useEffect\(\(\)\s*=>\s*\{[^}]*setInterval[^}]*\}(?!\s*,\s*\[[^\]]*\])/g,
    severity: 'high',
    fix: 'Add cleanup function to clear intervals'
  },
  {
    name: 'Inline object creation in JSX',
    pattern: /\{\{[^}]+\}\}/g,
    severity: 'low',
    fix: 'Move object creation outside render or use useMemo'
  },
  {
    name: 'Inline function creation in JSX',
    pattern: /onClick=\{[^}]*=>[^}]*\}/g,
    severity: 'medium',
    fix: 'Use useCallback for event handlers'
  },
  {
    name: 'Excessive state updates',
    pattern: /setState[^;]*;[\s\n]*setState/g,
    severity: 'medium',
    fix: 'Batch state updates or use functional updates'
  }
];

// Memory leak patterns
const memoryLeakPatterns = [
  {
    name: 'Uncleaned setTimeout',
    pattern: /setTimeout\([^)]+\)(?![^;]*clearTimeout)/g,
    severity: 'high',
    fix: 'Store timeout ID and clear in cleanup'
  },
  {
    name: 'Uncleaned setInterval',
    pattern: /setInterval\([^)]+\)(?![^;]*clearInterval)/g,
    severity: 'critical',
    fix: 'Store interval ID and clear in cleanup'
  },
  {
    name: 'Event listener without cleanup',
    pattern: /addEventListener\([^)]+\)(?![^}]*removeEventListener)/g,
    severity: 'high',
    fix: 'Remove event listeners in cleanup function'
  }
];

let totalIssues = 0;
let fixedIssues = 0;
const auditResults = [];

// Audit a single file
function auditFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Archivo no encontrado: ${filePath}`);
    return;
  }

  console.log(`📄 Auditando: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const fileIssues = [];

  // Check for performance issues
  performanceIssues.forEach(issue => {
    const matches = content.match(issue.pattern);
    if (matches) {
      fileIssues.push({
        type: 'performance',
        name: issue.name,
        severity: issue.severity,
        count: matches.length,
        fix: issue.fix,
        matches: matches.slice(0, 3) // Show first 3 matches
      });
      totalIssues += matches.length;
    }
  });

  // Check for memory leak patterns
  memoryLeakPatterns.forEach(pattern => {
    const matches = content.match(pattern.pattern);
    if (matches) {
      fileIssues.push({
        type: 'memory',
        name: pattern.name,
        severity: pattern.severity,
        count: matches.length,
        fix: pattern.fix,
        matches: matches.slice(0, 3)
      });
      totalIssues += matches.length;
    }
  });

  if (fileIssues.length > 0) {
    auditResults.push({
      file: filePath,
      issues: fileIssues
    });

    fileIssues.forEach(issue => {
      const severityIcon = issue.severity === 'critical' ? '🔴' : 
                          issue.severity === 'high' ? '🟠' : 
                          issue.severity === 'medium' ? '🟡' : '🟢';
      
      console.log(`  ${severityIcon} ${issue.name} (${issue.count} ocurrencias)`);
      console.log(`     💡 Solución: ${issue.fix}`);
      
      if (issue.matches.length > 0) {
        console.log(`     📝 Ejemplos:`);
        issue.matches.forEach((match, index) => {
          console.log(`        ${index + 1}. ${match.substring(0, 80)}...`);
        });
      }
    });
  } else {
    console.log(`  ✅ Sin problemas detectados`);
  }
  
  console.log('');
}

// Apply automatic fixes
function applyAutomaticFixes() {
  console.log('🔧 Aplicando correcciones automáticas...\n');

  // Fix 1: Optimize useAISettings hook debounce
  const useAISettingsPath = 'app/hooks/useAISettings.ts';
  if (fs.existsSync(useAISettingsPath)) {
    let content = fs.readFileSync(useAISettingsPath, 'utf8');
    
    // Increase debounce time to reduce flickering
    const oldDebounce = /setTimeout\([^,]+,\s*500\)/g;
    if (content.match(oldDebounce)) {
      content = content.replace(oldDebounce, 'setTimeout(() => {\n        try {\n          AISettingsManager.saveSettings(settings);\n        } catch (error) {\n          console.error(\'Error auto-saving AI settings:\', error);\n        }\n      }, 1000)');
      fs.writeFileSync(useAISettingsPath, content);
      console.log('✅ Optimizado debounce en useAISettings');
      fixedIssues++;
    }
  }

  // Fix 2: Add React.memo to prevent unnecessary re-renders
  const editorPath = 'app/escritor-ia/components/EscritorIAEditor.tsx';
  if (fs.existsSync(editorPath)) {
    let content = fs.readFileSync(editorPath, 'utf8');
    
    // Add React.memo if not present
    if (!content.includes('React.memo') && !content.includes('export default React.memo')) {
      content = content.replace(
        'export default function EscritorIAEditor(',
        'const EscritorIAEditor = React.memo(function EscritorIAEditor('
      );
      content = content.replace(
        /^}$/m,
        '});\n\nexport default EscritorIAEditor;'
      );
      fs.writeFileSync(editorPath, content);
      console.log('✅ Agregado React.memo a EscritorIAEditor');
      fixedIssues++;
    }
  }

  // Fix 3: Optimize memory monitoring intervals
  const mainPagePath = 'app/escritor-ia/page.tsx';
  if (fs.existsSync(mainPagePath)) {
    let content = fs.readFileSync(mainPagePath, 'utf8');
    
    // Increase monitoring intervals to reduce CPU usage
    content = content.replace(/120000/g, '300000'); // 5 minutes instead of 2
    content = content.replace(/30000/g, '60000');   // 1 minute instead of 30 seconds
    
    fs.writeFileSync(mainPagePath, content);
    console.log('✅ Optimizados intervalos de monitoreo de memoria');
    fixedIssues++;
  }

  console.log(`\n🎉 Correcciones aplicadas: ${fixedIssues}`);
}

// Generate performance optimization recommendations
function generateRecommendations() {
  console.log('💡 Recomendaciones de optimización:\n');

  const recommendations = [
    {
      title: 'Reducir re-renderizados',
      items: [
        'Usar React.memo para componentes que no cambian frecuentemente',
        'Implementar useCallback para funciones que se pasan como props',
        'Usar useMemo para cálculos costosos',
        'Evitar crear objetos inline en JSX'
      ]
    },
    {
      title: 'Optimizar gestión de memoria',
      items: [
        'Limpiar timeouts e intervals en useEffect cleanup',
        'Remover event listeners cuando el componente se desmonta',
        'Usar WeakMap/WeakSet para referencias que pueden ser garbage collected',
        'Implementar lazy loading para componentes pesados'
      ]
    },
    {
      title: 'Mejorar rendimiento de estado',
      items: [
        'Agrupar actualizaciones de estado relacionadas',
        'Usar functional updates para evitar dependencias innecesarias',
        'Implementar debouncing para inputs que cambian frecuentemente',
        'Considerar usar useReducer para estado complejo'
      ]
    },
    {
      title: 'Optimizar carga de recursos',
      items: [
        'Implementar code splitting con dynamic imports',
        'Usar Suspense para componentes que cargan asincrónicamente',
        'Precargar recursos críticos',
        'Implementar virtual scrolling para listas largas'
      ]
    }
  ];

  recommendations.forEach(category => {
    console.log(`📋 ${category.title}:`);
    category.items.forEach(item => {
      console.log(`   • ${item}`);
    });
    console.log('');
  });
}

// Main audit function
function runAudit() {
  console.log('🚀 Escritor IA - Auditoría de Rendimiento y Memoria\n');
  console.log('=' .repeat(60) + '\n');

  // Audit all files
  filesToAudit.forEach(auditFile);

  // Show summary
  console.log('📊 RESUMEN DE AUDITORÍA');
  console.log('=' .repeat(30));
  console.log(`Total de archivos auditados: ${filesToAudit.length}`);
  console.log(`Total de problemas encontrados: ${totalIssues}`);
  console.log(`Archivos con problemas: ${auditResults.length}`);

  if (totalIssues > 0) {
    console.log('\n🔧 PROBLEMAS POR SEVERIDAD:');
    const severityCounts = {};
    auditResults.forEach(result => {
      result.issues.forEach(issue => {
        severityCounts[issue.severity] = (severityCounts[issue.severity] || 0) + issue.count;
      });
    });

    Object.entries(severityCounts).forEach(([severity, count]) => {
      const icon = severity === 'critical' ? '🔴' : 
                   severity === 'high' ? '🟠' : 
                   severity === 'medium' ? '🟡' : '🟢';
      console.log(`${icon} ${severity.toUpperCase()}: ${count}`);
    });

    // Apply fixes
    console.log('\n');
    applyAutomaticFixes();
  } else {
    console.log('\n✅ ¡Excelente! No se encontraron problemas de rendimiento.');
  }

  // Generate recommendations
  console.log('\n');
  generateRecommendations();

  // Save audit report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      filesAudited: filesToAudit.length,
      totalIssues,
      filesWithIssues: auditResults.length,
      fixesApplied: fixedIssues
    },
    results: auditResults
  };

  fs.writeFileSync('performance-audit-report.json', JSON.stringify(report, null, 2));
  console.log('📄 Reporte guardado en: performance-audit-report.json');

  console.log('\n' + '=' .repeat(60));
  console.log('🎯 PRÓXIMOS PASOS:');
  console.log('1. Revisar los problemas críticos y de alta prioridad');
  console.log('2. Implementar las correcciones sugeridas');
  console.log('3. Probar la aplicación para verificar mejoras');
  console.log('4. Ejecutar este script regularmente para mantener el rendimiento');
  console.log('=' .repeat(60));
}

// Run the audit
runAudit();