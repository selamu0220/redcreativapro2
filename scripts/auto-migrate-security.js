#!/usr/bin/env node

/**
 * Script automatizado para migrar archivos al sistema de autenticación seguro
 */

const fs = require('fs');
const path = require('path');

// Archivos prioritarios para migrar
const PRIORITY_FILES = [
  'app/plantillas/page.tsx',
  'app/prompts/page.tsx',
  'app/historial/page.tsx',
  'app/documentos/page.tsx',
  'app/correos-ia/page.tsx',
  'app/escritor-ia/page.tsx'
];

// Patrones de reemplazo
const MIGRATION_PATTERNS = [
  {
    // Agregar import de hooks autenticados
    search: /import { useAuth } from ['"](.*)\/useAuth['"]/,
    replace: "import { useAuth } from '$1/useAuth';\nimport { useAuthenticatedGet, useAuthenticatedPost, useAuthenticatedPut, useAuthenticatedDelete } from '$1/useAuthenticatedFetch';"
  },
  {
    // Inicializar hooks después de useAuth
    search: /(const { [^}]* } = useAuth\(\);)/,
    replace: "$1\n  const { get } = useAuthenticatedGet();\n  const { post } = useAuthenticatedPost();\n  const { put } = useAuthenticatedPut();\n  const { del } = useAuthenticatedDelete();"
  },
  {
    // Reemplazar fetch GET con headers x-user-email
    search: /fetch\((['"][^'"]*['"])\s*,\s*{\s*headers:\s*{[^}]*['"]x-user-email['"]:[^}]*}\s*}\)/g,
    replace: "get($1)"
  },
  {
    // Reemplazar fetch POST con headers x-user-email
    search: /fetch\((['"][^'"]*['"])\s*,\s*{\s*method:\s*['"]POST['"]\s*,\s*headers:\s*{[^}]*['"]x-user-email['"]:[^}]*}\s*,\s*body:\s*JSON\.stringify\(([^)]+)\)\s*}\)/g,
    replace: "post($1, $2)"
  },
  {
    // Reemplazar fetch PUT con headers x-user-email
    search: /fetch\((['"][^'"]*['"])\s*,\s*{\s*method:\s*['"]PUT['"]\s*,\s*headers:\s*{[^}]*['"]x-user-email['"]:[^}]*}\s*,\s*body:\s*JSON\.stringify\(([^)]+)\)\s*}\)/g,
    replace: "put($1, $2)"
  },
  {
    // Reemplazar fetch DELETE con headers x-user-email
    search: /fetch\((['"][^'"]*['"])\s*,\s*{\s*method:\s*['"]DELETE['"]\s*,\s*headers:\s*{[^}]*['"]x-user-email['"]:[^}]*}\s*,\s*body:\s*JSON\.stringify\(([^)]+)\)\s*}\)/g,
    replace: "del($1, $2)"
  }
];

// Patrones de limpieza post-migración
const CLEANUP_PATTERNS = [
  {
    // Remover manejo de response.ok redundante
    search: /if \(response\.ok\) {\s*const data = await response\.json\(\);/g,
    replace: "const data ="
  },
  {
    // Remover else con console.error de response
    search: /} else {\s*console\.error\([^)]*response\.statusText[^)]*\);\s*}/g,
    replace: ""
  },
  {
    // Simplificar asignación de datos
    search: /const response = await (get|post|put|del)\([^)]*\);\s*const data = await response\.json\(\);/g,
    replace: "const data = await $1($2);"
  }
];

function migrateFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ Archivo no encontrado: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let hasChanges = false;
  
  // Verificar si ya está migrado
  if (content.includes('useAuthenticatedFetch')) {
    console.log(`✅ Ya migrado: ${filePath}`);
    return true;
  }
  
  console.log(`🔄 Migrando: ${filePath}`);
  
  // Aplicar patrones de migración
  MIGRATION_PATTERNS.forEach((pattern, index) => {
    const originalContent = content;
    content = content.replace(pattern.search, pattern.replace);
    if (content !== originalContent) {
      hasChanges = true;
      console.log(`   ✓ Aplicado patrón ${index + 1}`);
    }
  });
  
  // Aplicar patrones de limpieza
  CLEANUP_PATTERNS.forEach((pattern, index) => {
    const originalContent = content;
    content = content.replace(pattern.search, pattern.replace);
    if (content !== originalContent) {
      hasChanges = true;
      console.log(`   ✓ Limpieza ${index + 1}`);
    }
  });
  
  if (hasChanges) {
    // Crear backup
    const backupPath = fullPath + '.backup';
    fs.writeFileSync(backupPath, fs.readFileSync(fullPath));
    
    // Escribir archivo migrado
    fs.writeFileSync(fullPath, content);
    console.log(`   💾 Guardado con backup en: ${backupPath}`);
    return true;
  } else {
    console.log(`   ⚠️  Sin cambios aplicados`);
    return false;
  }
}

function migrateAllFiles() {
  console.log('🚀 INICIANDO MIGRACIÓN AUTOMÁTICA DE SEGURIDAD\n');
  console.log('=' .repeat(60));
  
  let migratedCount = 0;
  let totalCount = 0;
  
  PRIORITY_FILES.forEach(filePath => {
    totalCount++;
    if (migrateFile(filePath)) {
      migratedCount++;
    }
    console.log(''); // Línea en blanco
  });
  
  console.log('=' .repeat(60));
  console.log(`📊 RESUMEN: ${migratedCount}/${totalCount} archivos procesados`);
  
  if (migratedCount > 0) {
    console.log('\n🔧 PRÓXIMOS PASOS:');
    console.log('1. Revisar los archivos migrados para verificar que funcionan correctamente');
    console.log('2. Ejecutar: node scripts/find-insecure-requests.js');
    console.log('3. Probar la aplicación para asegurar que todo funciona');
    console.log('4. Si hay problemas, restaurar desde los archivos .backup');
  }
  
  console.log('\n✨ Migración completada!');
}

// Ejecutar migración
migrateAllFiles();