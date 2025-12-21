/**
 * Script para eliminar TODAS las referencias a Supabase del proyecto
 * Este script elimina archivos y limpia el código de cualquier mención a Supabase
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Eliminando TODAS las referencias a Supabase...\n');

// Archivos a eliminar completamente
const filesToDelete = [
  'app/lib/supabase.ts',
  'app/lib/supabase-client.ts',
  'app/lib/supabase-server.ts',
  'app/utils/promptExport.ts',
  'app/test-auth/page.tsx',
  'app/simple-estadisticas/page.tsx',
  'app/seo-dashboard/page.tsx',
  'app/seo-dashboard/opportunities/page.tsx',
  'app/users-debug/page.tsx',
  'supabase',
  'provision-users-supabase.js',
  'check_permissions.sql'
];

// Archivos a limpiar (eliminar imports y referencias)
const filesToClean = [
  'app/lib/db.ts',
  'app/lib/database.ts',
  'app/lib/subscription/SubscriptionStatusService.ts',
  'app/hooks/useAuth.ts',
  'next.config.js'
];

let deletedCount = 0;
let cleanedCount = 0;

// Función para eliminar archivos/directorios
function deleteFileOrDir(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  ${filePath} - No existe`);
    return false;
  }

  try {
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`✅ Directorio eliminado: ${filePath}`);
    } else {
      fs.unlinkSync(fullPath);
      console.log(`✅ Archivo eliminado: ${filePath}`);
    }
    
    deletedCount++;
    return true;
  } catch (error) {
    console.log(`❌ Error eliminando ${filePath}: ${error.message}`);
    return false;
  }
}

// Función para limpiar referencias en archivos
function cleanFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  ${filePath} - No existe`);
    return false;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf-8');
    const originalContent = content;
    
    // Eliminar imports de Supabase
    content = content.replace(/import\s+.*from\s+['"].*supabase.*['"]\s*;?\n?/gi, '');
    content = content.replace(/import\s+\{[^}]*\}\s+from\s+['"]@supabase\/.*['"]\s*;?\n?/gi, '');
    
    // Eliminar referencias a getSupabaseClient
    content = content.replace(/const\s+supabase\s*=\s*getSupabaseClient\(\)\s*;?\n?/gi, '');
    content = content.replace(/if\s*\(\s*!supabase\s*\)\s*\{[^}]*\}/gi, '');
    
    // Eliminar comentarios sobre Supabase
    content = content.replace(/\/\/.*supabase.*/gi, '');
    content = content.replace(/\/\*[\s\S]*?supabase[\s\S]*?\*\//gi, '');
    
    // Limpiar líneas vacías múltiples
    content = content.replace(/\n\n\n+/g, '\n\n');
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf-8');
      console.log(`✅ Limpiado: ${filePath}`);
      cleanedCount++;
      return true;
    } else {
      console.log(`⏭️  ${filePath} - Sin cambios necesarios`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error limpiando ${filePath}: ${error.message}`);
    return false;
  }
}

console.log('📁 Eliminando archivos y directorios...\n');
filesToDelete.forEach(deleteFileOrDir);

console.log('\n🧼 Limpiando referencias en archivos...\n');
filesToClean.forEach(cleanFile);

console.log('\n' + '='.repeat(60));
console.log(`✅ Proceso completado:`);
console.log(`   - ${deletedCount} archivos/directorios eliminados`);
console.log(`   - ${cleanedCount} archivos limpiados`);
console.log('\n💡 Próximos pasos:');
console.log('   1. Revisar los archivos modificados');
console.log('   2. Ejecutar: npm run build');
console.log('   3. Verificar que no hay errores de compilación');
console.log('\n🎯 Supabase ha sido completamente eliminado del proyecto');
