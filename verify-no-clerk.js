#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const excludeDirs = ['node_modules', '.next', 'dist', '.git', '.kiro'];
const clerkImports = [];

function searchFiles(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        searchFiles(filePath);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('@clerk/nextjs')) {
        clerkImports.push(filePath);
      }
    }
  }
}

console.log('🔍 Buscando imports de Clerk...\n');
searchFiles('.');

if (clerkImports.length === 0) {
  console.log('✅ ¡Éxito! No se encontraron imports de Clerk.');
  console.log('✅ La migración a Kinde está completa.\n');
  process.exit(0);
} else {
  console.log(`❌ Se encontraron ${clerkImports.length} archivos con imports de Clerk:\n`);
  clerkImports.forEach(file => console.log(`  - ${file}`));
  console.log('\n⚠️  Estos archivos necesitan ser actualizados.\n');
  process.exit(1);
}
