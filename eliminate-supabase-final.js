#!/usr/bin/env node

const fs = require('fs');

console.log('🧹 Eliminando Supabase completamente...\n');

// 1. Eliminar archivos de Supabase
console.log('1. Eliminando archivos de Supabase...');
const filesToDelete = [
  'app/lib/supabase-safe.ts',
  'app/lib/supabase-users.ts',
  'app/lib/subscription-middleware.ts',
  'app/lib/middleware/subscription.ts',
  'app/lib/middleware/page-middleware.ts',
  'app/api/test-supabase/route.ts'
];

filesToDelete.forEach(file => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(`  ✅ Eliminado: ${file}`);
  }
});

// 2. Eliminar dependencias de package.json
console.log('\n2. Eliminando dependencias de Supabase...');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const supabaseDeps = ['@supabase/auth-helpers-nextjs', '@supabase/supabase-js'];
let removed = false;

supabaseDeps.forEach(dep => {
  if (pkg.dependencies && pkg.dependencies[dep]) {
    delete pkg.dependencies[dep];
    console.log(`  ✅ Eliminado: ${dep}`);
    removed = true;
  }
});

if (removed) {
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
  console.log('\n  ⚠️  Ejecuta "npm install" para actualizar node_modules');
}

// 3. Limpiar .env.example
console.log('\n3. Limpiando .env.example...');
if (fs.existsSync('.env.example')) {
  let content = fs.readFileSync('.env.example', 'utf8');
  const lines = content.split('\n').filter(line => 
    !line.toUpperCase().includes('SUPABASE')
  );
  fs.writeFileSync('.env.example', lines.join('\n'));
  console.log('  ✅ Variables de Supabase eliminadas');
}

console.log('\n✅ Supabase eliminado completamente!');
console.log('\n📋 Próximos pasos:');
console.log('  1. npm install');
console.log('  2. Eliminar variables SUPABASE_* de Vercel');
console.log('  3. npm run build');
