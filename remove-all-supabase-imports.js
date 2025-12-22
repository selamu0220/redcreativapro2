#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Eliminando TODOS los imports de Supabase...\n');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Eliminar imports de @supabase
  content = content.replace(/import.*from\s+['"]@supabase\/[^'"]+['"];?\n/g, '');
  
  // Eliminar funciones getSupabaseClient
  content = content.replace(/function getSupabaseClient\(\)[^}]*\{[^}]*\}/gs, '');
  
  // Eliminar llamadas a createClient de Supabase
  content = content.replace(/const supabase = createClient\([^)]*\);?\n/g, '');
  
  // Eliminar líneas que crean cliente de Supabase
  content = content.replace(/.*createClientComponentClient.*\n/g, '');

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let count = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        count += walkDir(filePath);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      if (processFile(filePath)) {
        console.log(`  ✅ ${filePath}`);
        count++;
      }
    }
  });

  return count;
}

const count = walkDir('app');

console.log(`\n✅ ${count} archivos limpiados!`);
console.log('\n⚠️  Nota: Algunos archivos pueden necesitar ajustes manuales');
console.log('   si usaban funciones de Supabase en su lógica.');
