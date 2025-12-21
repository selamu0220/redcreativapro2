#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Eliminando referencias restantes de Supabase y Stripe...\n');

// Archivos a eliminar completamente
const filesToDelete = [
  'app/current-user-status/page.tsx',
  'app/api/all-users/route.ts',
  'app/api/check-and-register-user/route.ts',
  'app/api/debug-user/route.ts'
];

// Archivos a modificar
const filesToModify = [
  {
    path: 'app/subscription/page.tsx',
    remove: [
      "import { PaymentMethodSelector } from '../components/PaymentMethodSelector'",
      '<PaymentMethodSelector',
      'amount={4.99}',
      'onMethodSelect={(method) => {',
      'console.log(\'Selected payment method:\', method)',
      '}}'
    ]
  }
];

let deletedCount = 0;
let modifiedCount = 0;
let errorCount = 0;

// Eliminar archivos
console.log('📁 Eliminando archivos...');
filesToDelete.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`  ✅ Eliminado: ${file}`);
      deletedCount++;
    } else {
      console.log(`  ⚠️  No existe: ${file}`);
    }
  } catch (error) {
    console.error(`  ❌ Error eliminando ${file}:`, error.message);
    errorCount++;
  }
});

console.log('\n📝 Modificando archivos...');

// Modificar app/subscription/page.tsx
try {
  const subscriptionPath = 'app/subscription/page.tsx';
  if (fs.existsSync(subscriptionPath)) {
    let content = fs.readFileSync(subscriptionPath, 'utf8');
    
    // Eliminar import de PaymentMethodSelector
    content = content.replace(/import\s+{\s*PaymentMethodSelector\s*}\s+from\s+['"]\.\.\/components\/PaymentMethodSelector['"]\s*\n?/g, '');
    
    // Eliminar el componente PaymentMethodSelector y su contenido
    // Buscar desde <PaymentMethodSelector hasta el cierre />
    content = content.replace(/<PaymentMethodSelector[\s\S]*?\/>/g, '');
    
    // Limpiar líneas vacías múltiples
    content = content.replace(/\n\n\n+/g, '\n\n');
    
    fs.writeFileSync(subscriptionPath, content, 'utf8');
    console.log(`  ✅ Modificado: ${subscriptionPath}`);
    modifiedCount++;
  } else {
    console.log(`  ⚠️  No existe: ${subscriptionPath}`);
  }
} catch (error) {
  console.error(`  ❌ Error modificando subscription/page.tsx:`, error.message);
  errorCount++;
}

console.log('\n' + '='.repeat(50));
console.log('📊 Resumen:');
console.log(`  ✅ Archivos eliminados: ${deletedCount}`);
console.log(`  📝 Archivos modificados: ${modifiedCount}`);
console.log(`  ❌ Errores: ${errorCount}`);
console.log('='.repeat(50));

if (errorCount === 0) {
  console.log('\n✨ ¡Limpieza completada exitosamente!');
  console.log('\n📋 Siguiente paso:');
  console.log('   npm run build');
} else {
  console.log('\n⚠️  Hubo algunos errores. Revisa los mensajes arriba.');
  process.exit(1);
}
