/**
 * Script para eliminar advertencias de Supabase durante el build
 * 
 * Este script comenta o elimina las verificaciones de variables de entorno
 * de Supabase que causan advertencias durante el build de Next.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Eliminando advertencias de Supabase...\n');

// Archivos a modificar
const filesToFix = [
  'app/lib/database.ts',
  'app/lib/db.ts',
  'app/lib/deployment-config.ts',
];

let filesModified = 0;

filesToFix.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  Saltando ${filePath} (no existe)`);
    return;
  }
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    // Reemplazar las advertencias de Supabase con versiones silenciosas
    content = content.replace(
      /console\.warn\(['"]Supabase environment variables not configured or using placeholder values['"]\);?/g,
      '// Supabase not configured (expected with Clerk)'
    );
    
    content = content.replace(
      /console\.warn\(['"]Missing Supabase.*?['"]\);?/g,
      '// Supabase not configured (expected with Clerk)'
    );
    
    // Comentar las verificaciones de variables de entorno de Supabase
    content = content.replace(
      /const supabaseUrl = process\.env\.NEXT_PUBLIC_SUPABASE_URL;?/g,
      '// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // Disabled - using Clerk'
    );
    
    content = content.replace(
      /const supabaseServiceKey = process\.env\.SUPABASE_SERVICE_ROLE_KEY;?/g,
      '// const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Disabled - using Clerk'
    );
    
    content = content.replace(
      /const supabaseAnonKey = process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY;?/g,
      '// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Disabled - using Clerk'
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Modificado: ${filePath}`);
      filesModified++;
    } else {
      console.log(`⏭️  Sin cambios: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
  }
});

console.log(`\n✅ Proceso completado. ${filesModified} archivo(s) modificado(s).`);
console.log('\n📝 Nota: Las funciones de Supabase seguirán retornando null,');
console.log('   pero ya no mostrarán advertencias durante el build.');
