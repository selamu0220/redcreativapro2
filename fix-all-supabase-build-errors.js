const fs = require('fs');
const path = require('path');

// Lista de archivos que necesitan ser corregidos
const filesToFix = [
  'app/api/user/profile/route.ts',
  'app/api/seo/analytics/route.ts',
  'app/api/seo/content/generate/route.ts',
  'app/api/seo/backlinks/route.ts',
  'app/api/seo/projects/route.ts',
  'app/api/seo/analyze-intent/route.ts',
  'app/api/seo/optimize-three-kings/route.ts',
  'app/api/subscription/cancel/route.ts',
  'app/api/seo/keywords/research/route.ts',
  'app/api/seo/opportunities/route.ts',
  'app/lib/database.ts',
  'app/api/subscription/status/route.ts',
  'app/lib/supabase-safe.ts',
  'app/lib/supabase-users.ts',
  'app/api/usage-stats/route.ts',
  'app/api/webhooks/stripe/route.ts',
  'app/api/contact/suggestion/route.ts',
  'app/api/seo/request-reindex/route.ts',
  'app/api/test-supabase/route.ts',
  'app/api/subscription/create/route.ts'
];

// Patrones de código a buscar y reemplazar
const patterns = [
  {
    // Patrón 1: return createClient(supabaseUrl, supabaseServiceKey);
    search: /return createClient\(supabaseUrl, supabaseServiceKey\);/g,
    replace: `// Verificar que las variables no sean placeholders
  if (!supabaseUrl || !supabaseServiceKey || 
      supabaseUrl === 'your_supabase_url' || 
      supabaseServiceKey === 'your_supabase_service_role_key') {
    console.warn('Supabase environment variables not configured or using placeholder values');
    return null;
  }
  
  try {
    // Validar URL
    new URL(supabaseUrl);
    return createClient(supabaseUrl, supabaseServiceKey);
  } catch (error) {
    console.warn('Failed to initialize Supabase client during build:', error);
    return null;
  }`
  },
  {
    // Patrón 2: supabase = createClient(supabaseUrl, supabaseServiceKey);
    search: /(\s+)supabase = createClient\(supabaseUrl, supabaseServiceKey\);/g,
    replace: `$1// Verificar que las variables no sean placeholders
$1if (!supabaseUrl || !supabaseServiceKey || 
$1    supabaseUrl === 'your_supabase_url' || 
$1    supabaseServiceKey === 'your_supabase_service_role_key') {
$1  console.warn('Supabase environment variables not configured or using placeholder values');
$1  supabase = null;
$1} else {
$1  try {
$1    // Validar URL
$1    new URL(supabaseUrl);
$1    supabase = createClient(supabaseUrl, supabaseServiceKey);
$1  } catch (error) {
$1    console.warn('Failed to initialize Supabase client during build:', error);
$1    supabase = null;
$1  }
$1}`
  }
];

function fixFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Archivo no encontrado: ${filePath}`);
    return false;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Aplicar cada patrón
    patterns.forEach((pattern, index) => {
      if (pattern.search.test(content)) {
        content = content.replace(pattern.search, pattern.replace);
        modified = true;
        console.log(`✅ Aplicado patrón ${index + 1} en: ${filePath}`);
      }
    });

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Archivo corregido: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  No se necesitaron cambios en: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

// Ejecutar correcciones
console.log('🔧 Iniciando corrección de errores de Supabase...\n');

let fixedCount = 0;
let totalCount = 0;

filesToFix.forEach(filePath => {
  totalCount++;
  if (fixFile(filePath)) {
    fixedCount++;
  }
});

console.log(`\n📊 Resumen:`);
console.log(`   Archivos procesados: ${totalCount}`);
console.log(`   Archivos corregidos: ${fixedCount}`);
console.log(`   Archivos sin cambios: ${totalCount - fixedCount}`);

if (fixedCount > 0) {
  console.log('\n✅ Correcciones aplicadas exitosamente!');
  console.log('   Los archivos ahora manejan correctamente los placeholders de Supabase');
  console.log('   y no fallarán durante el build process.');
} else {
  console.log('\n✅ Todos los archivos ya estaban correctos o no se encontraron.');
}