const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Buscar todos los archivos route.ts en app/api
const routeFiles = glob.sync('app/api/**/route.ts');

console.log(`Encontrados ${routeFiles.length} archivos de rutas API`);

routeFiles.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Si ya tiene la configuración en el lugar correcto, saltar
    if (content.includes('} from') && content.indexOf('export const dynamic') > content.lastIndexOf('} from')) {
      console.log(`✓ ${filePath} ya tiene configuración estática correcta`);
      return;
    }
    
    // Si tiene la configuración en el lugar incorrecto, corregir
    if (content.includes('export const dynamic') && content.includes('export const revalidate')) {
      console.log(`🔧 Corrigiendo ${filePath}...`);
      
      // Remover la configuración mal ubicada
      let newContent = content
        .replace(/\n\/\/ Configuración para export estático\nexport const dynamic = 'force-static';\nexport const revalidate = false;\n/g, '')
        .replace(/\n\n\/\/ Configuración para export estático\nexport const dynamic = 'force-static';\nexport const revalidate = false;\n/g, '')
        .replace(/\/\/ Configuración para export estático\nexport const dynamic = 'force-static';\nexport const revalidate = false;\n\n/g, '');
      
      // Encontrar el final de todos los imports
      const lines = newContent.split('\n');
      let insertIndex = -1;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('} from ')) {
          insertIndex = i + 1;
        }
      }
      
      if (insertIndex > -1) {
        // Insertar la configuración después del último import
        lines.splice(insertIndex, 0, '', '// Configuración para export estático', 'export const dynamic = \'force-static\';', 'export const revalidate = false;');
        newContent = lines.join('\n');
        
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✓ Corregido ${filePath}`);
      } else {
        console.log(`⚠️ No se pudo encontrar imports en ${filePath}`);
      }
    } else {
      // Agregar configuración nueva
      const lines = content.split('\n');
      let insertIndex = -1;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('} from ')) {
          insertIndex = i + 1;
        }
      }
      
      if (insertIndex > -1) {
        lines.splice(insertIndex, 0, '', '// Configuración para export estático', 'export const dynamic = \'force-static\';', 'export const revalidate = false;');
        const newContent = lines.join('\n');
        
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✓ Agregada configuración a ${filePath}`);
      } else {
        console.log(`⚠️ No se pudo procesar ${filePath}`);
      }
    }
    
  } catch (error) {
    console.error(`✗ Error procesando ${filePath}:`, error.message);
  }
});

console.log('\n¡Configuración estática corregida en todas las rutas API!');