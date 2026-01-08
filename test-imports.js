// Script para probar que los imports funcionan correctamente
const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando imports de componentes...\n');

// Verificar que los archivos existen
const files = [
  'app/components/SmartAIEditor.tsx',
  'app/components/DocumentManager.tsx',
  'app/test-document-manager/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - Existe`);
    
    // Leer contenido y verificar exports
    const content = fs.readFileSync(file, 'utf8');
    
    if (file.includes('SmartAIEditor.tsx')) {
      if (content.includes('export default function SmartAIEditor')) {
        console.log('  ✅ Export default function encontrado');
      } else if (content.includes('export default SmartAIEditor')) {
        console.log('  ✅ Export default variable encontrado');
      } else {
        console.log('  ❌ No se encontró export default');
      }
    }
    
    if (file.includes('DocumentManager.tsx')) {
      if (content.includes('export default function DocumentManager')) {
        console.log('  ✅ Export default function encontrado');
      } else if (content.includes('export default DocumentManager')) {
        console.log('  ✅ Export default variable encontrado');
      } else {
        console.log('  ❌ No se encontró export default');
      }
    }
    
    if (file.includes('page.tsx')) {
      if (content.includes('import SmartAIEditor')) {
        console.log('  ✅ Import de SmartAIEditor encontrado');
      } else {
        console.log('  ❌ Import de SmartAIEditor no encontrado');
      }
    }
    
  } else {
    console.log(`❌ ${file} - No existe`);
  }
});

console.log('\n🎯 Verificación de sintaxis básica:');

// Verificar sintaxis básica de TypeScript
try {
  const smartAIContent = fs.readFileSync('app/components/SmartAIEditor.tsx', 'utf8');
  
  // Verificar que no hay exports duplicados
  const exportMatches = smartAIContent.match(/export default/g);
  if (exportMatches && exportMatches.length === 1) {
    console.log('✅ Un solo export default encontrado');
  } else if (exportMatches && exportMatches.length > 1) {
    console.log(`❌ Múltiples exports default encontrados: ${exportMatches.length}`);
  } else {
    console.log('❌ No se encontró export default');
  }
  
  // Verificar que las llaves están balanceadas
  const openBraces = (smartAIContent.match(/{/g) || []).length;
  const closeBraces = (smartAIContent.match(/}/g) || []).length;
  
  if (openBraces === closeBraces) {
    console.log(`✅ Llaves balanceadas: ${openBraces} abiertas, ${closeBraces} cerradas`);
  } else {
    console.log(`❌ Llaves desbalanceadas: ${openBraces} abiertas, ${closeBraces} cerradas`);
  }
  
} catch (error) {
  console.log(`❌ Error leyendo SmartAIEditor.tsx: ${error.message}`);
}

console.log('\n✨ Verificación de imports completada!');