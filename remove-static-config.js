const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Buscar todos los archivos route.ts en app/api
const routeFiles = glob.sync('app/api/**/route.ts');

console.log(`Encontrados ${routeFiles.length} archivos de rutas API`);

routeFiles.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Remover todas las configuraciones de export estático
    let newContent = content
      .replace(/\n\/\/ Configuración para export estático\nexport const dynamic = 'force-static';\nexport const revalidate = false;\n/g, '')
      .replace(/\n\n\/\/ Configuración para export estático\nexport const dynamic = 'force-static';\nexport const revalidate = false;\n/g, '')
      .replace(/\/\/ Configuración para export estático\nexport const dynamic = 'force-static';\nexport const revalidate = false;\n\n/g, '')
      .replace(/\/\/ Configuración para export estático\nexport const dynamic = 'force-static';\nexport const revalidate = false;\n/g, '')
      .replace(/\n\/\/ Generar parámetros estáticos para export\nexport async function generateStaticParams\(\) {\n  return \[\];\n}\n/g, '')
      .replace(/\/\/ Generar parámetros estáticos para export\nexport async function generateStaticParams\(\) {\n  return \[\];\n}\n\n/g, '')
      .replace(/\/\/ Generar parámetros estáticos para export\nexport async function generateStaticParams\(\) {\n  return \[\];\n}/g, '');
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✓ Removida configuración estática de ${filePath}`);
    } else {
      console.log(`- ${filePath} no tenía configuración estática`);
    }
    
  } catch (error) {
    console.error(`✗ Error procesando ${filePath}:`, error.message);
  }
});

console.log('\n¡Configuración estática removida de todas las rutas API!');