/**
 * Script para eliminar TODAS las referencias a Stripe del proyecto
 * Clerk maneja tanto autenticación como suscripciones
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Eliminando TODAS las referencias a Stripe...\n');

// Archivos y directorios a eliminar completamente
const filesToDelete = [
  'app/lib/stripe.ts',
  'app/api/stripe',
  'fix-stripe-env.js',
  'fix-stripe-configuration.js',
  'test-stripe-regional-payment-methods.js',
  'stripe-config-template.txt',
  'STRIPE_CUSTOMER_PORTAL_SETUP.md',
  'CONFIGURACION_PORTAL_STRIPE.md',
  'RESUMEN_PORTAL_STRIPE.md',
  'app/lib/subscription/ConflictDetectionService.ts',
  'app/lib/subscription/ConsolidationService.ts',
  'app/lib/audit/AuditLogger.ts',
  'app/lib/auth/PaymentSessionManager.ts',
  'app/components/PaymentAuthGuard.tsx',
  'app/components/PaymentMethodSelector.tsx',
  'test-authentication-guard.js',
  'test-subscription-status.js',
  '.kiro/specs/secure-payment-flow'
];

let deletedCount = 0;

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

console.log('📁 Eliminando archivos y directorios relacionados con Stripe...\n');
filesToDelete.forEach(deleteFileOrDir);

console.log('\n' + '='.repeat(60));
console.log(`✅ Proceso completado:`);
console.log(`   - ${deletedCount} archivos/directorios eliminados`);
console.log('\n💡 Próximos pasos:');
console.log('   1. Actualizar archivos que referencian Stripe');
console.log('   2. Ejecutar: npm run build');
console.log('   3. Verificar que no hay errores de compilación');
console.log('\n🎯 Stripe ha sido eliminado - Clerk maneja todo ahora');
