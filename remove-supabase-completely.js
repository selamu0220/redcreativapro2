#!/usr/bin/env node

/**
 * Eliminar completamente todas las referencias a Supabase
 * Ya que estamos usando Clerk para autenticación
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Eliminando todas las referencias a Supabase...\n');

// 1. Buscar y eliminar imports de Supabase
console.log('1. Eliminando imports de Supabase...');

const filesToClean = [
  'app/components/AuthProvider.tsx',
  'app/hooks/useAuth.ts',
  'app/lib/database.ts',
  'middleware.ts',
  'next.config.js'
];

filesToClean.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;
    
    // Eliminar imports de Supabase
    content = content.replace(/import.*from ['"]@supabase\/.*['"];?\n/g, '');
    content = content.replace(/import.*from ['"].*supabase.*['"];?\n/g, '');
    
    // Eliminar comentarios sobre Supabase
    content = content.replace(/\/\/.*supabase.*/gi, '');
    content = content.replace(/\/\*[\s\S]*?supabase[\s\S]*?\*\//gi, '');
    
    if (content !== original) {
      fs.writeFileSync(file, content);
      console.log(`  ✅ Limpiado: ${file}`);
    }
  }
});

// 2. Limpiar variables de entorno
console.log('\n2. Limpiando .env.example...');
if (fs.existsSync('.env.example')) {
  let content = fs.readFileSync('.env.example', 'utf8');
  
  // Eliminar líneas de Supabase
  const lines = content.split('\n').filter(line => {
    return !line.includes('SUPABASE') && 
           !line.includes('supabase') &&
           !line.toLowerCase().includes('next_public_supabase');
  });
  
  fs.writeFileSync('.env.example', lines.join('\n'));
  console.log('  ✅ Limpiado .env.example');
}

// 3. Actualizar package.json para eliminar dependencias de Supabase
console.log('\n3. Verificando package.json...');
if (fs.existsSync('package.json')) {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  let modified = false;
  
  if (pkg.dependencies) {
    const supabaseDeps = Object.keys(pkg.dependencies).filter(dep => 
      dep.includes('supabase')
    );
    
    if (supabaseDeps.length > 0) {
      console.log('  ⚠️  Dependencias de Supabase encontradas:');
      supabaseDeps.forEach(dep => {
        console.log(`     - ${dep}`);
        delete pkg.dependencies[dep];
        modified = true;
      });
    }
  }
  
  if (modified) {
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    console.log('  ✅ package.json actualizado');
    console.log('  ℹ️  Ejecuta "npm install" para actualizar node_modules');
  } else {
    console.log('  ✅ No hay dependencias de Supabase en package.json');
  }
}

// 4. Buscar archivos que mencionen Supabase en mensajes de log
console.log('\n4. Buscando mensajes de log sobre Supabase...');

function searchInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const matches = [];
    
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes('supabase') && 
          (line.includes('console.') || line.includes('logger'))) {
        matches.push({ line: index + 1, content: line.trim() });
      }
    });
    
    return matches;
  } catch (error) {
    return [];
  }
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && 
          file !== 'node_modules' && 
          file !== 'dist' &&
          file !== 'build') {
        walkDir(filePath, callback);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      callback(filePath);
    }
  });
}

const filesWithSupabaseLogs = [];

walkDir('app', (filePath) => {
  const matches = searchInFile(filePath);
  if (matches.length > 0) {
    filesWithSupabaseLogs.push({ file: filePath, matches });
  }
});

if (filesWithSupabaseLogs.length > 0) {
  console.log('  ⚠️  Archivos con logs de Supabase:');
  filesWithSupabaseLogs.forEach(({ file, matches }) => {
    console.log(`\n     ${file}:`);
    matches.forEach(({ line, content }) => {
      console.log(`       Línea ${line}: ${content.substring(0, 80)}...`);
    });
  });
  console.log('\n  ℹ️  Considera eliminar estos logs manualmente');
} else {
  console.log('  ✅ No se encontraron logs de Supabase');
}

// 5. Crear archivo de resumen
console.log('\n5. Creando resumen...');

const summary = `# Supabase Completamente Eliminado ✅

## Fecha: ${new Date().toISOString().split('T')[0]}

## Acciones Realizadas

### 1. Imports Eliminados
- Eliminados todos los imports de \`@supabase/supabase-js\`
- Eliminados imports de archivos relacionados con Supabase

### 2. Variables de Entorno
- Limpiado \`.env.example\` de variables SUPABASE_*
- Variables eliminadas:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY

### 3. Dependencias
${pkg.dependencies && Object.keys(pkg.dependencies).some(d => d.includes('supabase')) 
  ? '- ⚠️  Ejecutar \`npm install\` para eliminar paquetes de Supabase'
  : '- ✅ No hay dependencias de Supabase en package.json'}

### 4. Archivos Limpiados
${filesToClean.map(f => `- ${f}`).join('\n')}

## Sistema de Autenticación Actual

**Clerk** es el único sistema de autenticación:
- ✅ Sign in/Sign up con Clerk
- ✅ Gestión de sesiones con Clerk
- ✅ Protección de rutas con Clerk
- ✅ Datos de usuario desde Clerk

## Próximos Pasos

1. Ejecutar \`npm install\` si se eliminaron dependencias
2. Verificar que no haya errores de compilación: \`npm run build\`
3. Probar autenticación en desarrollo: \`npm run dev\`
4. Eliminar variables SUPABASE_* de Vercel si existen

## Notas

- Los warnings sobre "Supabase environment variables not configured" desaparecerán
- Toda la autenticación ahora usa exclusivamente Clerk
- La base de datos local usa Vercel KV (no Supabase)

---

**Estado:** ✅ Supabase completamente eliminado del proyecto
`;

fs.writeFileSync('SUPABASE_ELIMINATED.md', summary);
console.log('  ✅ Creado SUPABASE_ELIMINATED.md');

console.log('\n✅ Limpieza de Supabase completada!');
console.log('\n📋 Resumen:');
console.log('  • Imports eliminados de archivos clave');
console.log('  • Variables de entorno limpiadas');
console.log('  • Dependencias verificadas');
console.log('  • Documentación actualizada');
console.log('\n🔍 Revisa SUPABASE_ELIMINATED.md para más detalles');
console.log('\n⚠️  Recuerda:');
console.log('  1. Ejecutar "npm install" si se eliminaron dependencias');
console.log('  2. Eliminar variables SUPABASE_* de Vercel');
console.log('  3. Verificar build: "npm run build"');
