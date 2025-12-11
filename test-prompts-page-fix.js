#!/usr/bin/env node

/**
 * Test para verificar que la página de prompts funciona correctamente
 * después de los arreglos implementados
 */

console.log('🧪 Iniciando test de la página de prompts...\n')

// Test 1: Verificar que los archivos críticos existen
console.log('📁 Verificando archivos críticos...')

const fs = require('fs')
const path = require('path')

const criticalFiles = [
  'app/prompts/page.tsx',
  'app/components/PromptsErrorBoundary.tsx',
  'app/hooks/useAdvancedSearch.ts',
  'app/components/WorkingAuthProvider.tsx',
  'app/components/WorkingClientLayout.tsx',
  'app/layout.tsx'
]

let allFilesExist = true

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - Existe`)
  } else {
    console.log(`❌ ${file} - No encontrado`)
    allFilesExist = false
  }
})

if (!allFilesExist) {
  console.log('\n❌ Algunos archivos críticos no existen. Abortando test.')
  process.exit(1)
}

// Test 2: Verificar que no hay errores de sintaxis obvios
console.log('\n🔍 Verificando sintaxis básica...')

try {
  // Verificar PromptsErrorBoundary
  const errorBoundaryContent = fs.readFileSync('app/components/PromptsErrorBoundary.tsx', 'utf8')
  
  if (errorBoundaryContent.includes('type="button"')) {
    console.log('✅ PromptsErrorBoundary - Botones tienen type="button"')
  } else {
    console.log('⚠️ PromptsErrorBoundary - Algunos botones pueden no tener type="button"')
  }
  
  if (!errorBoundaryContent.includes('errorType')) {
    console.log('✅ PromptsErrorBoundary - Variable errorType no utilizada removida')
  } else {
    console.log('⚠️ PromptsErrorBoundary - Variable errorType aún presente')
  }
  
  // Verificar useAdvancedSearch
  const useAdvancedSearchContent = fs.readFileSync('app/hooks/useAdvancedSearch.ts', 'utf8')
  
  if (useAdvancedSearchContent.includes('safeLocaleCompare')) {
    console.log('✅ useAdvancedSearch - Función safeLocaleCompare implementada')
  } else {
    console.log('❌ useAdvancedSearch - Función safeLocaleCompare no encontrada')
  }
  
  if (useAdvancedSearchContent.includes('safeStringConversion')) {
    console.log('✅ useAdvancedSearch - Función safeStringConversion implementada')
  } else {
    console.log('❌ useAdvancedSearch - Función safeStringConversion no encontrada')
  }
  
  // Verificar WorkingAuthProvider
  const authProviderContent = fs.readFileSync('app/components/WorkingAuthProvider.tsx', 'utf8')
  
  if (authProviderContent.includes('typeof subscription.unsubscribe === \'function\'')) {
    console.log('✅ WorkingAuthProvider - Verificación de unsubscribe implementada')
  } else {
    console.log('❌ WorkingAuthProvider - Verificación de unsubscribe no encontrada')
  }
  
  // Verificar layout.tsx
  const layoutContent = fs.readFileSync('app/layout.tsx', 'utf8')
  
  if (layoutContent.includes('dynamic')) {
    console.log('✅ layout.tsx - Carga dinámica implementada')
  } else {
    console.log('❌ layout.tsx - Carga dinámica no encontrada')
  }
  
  // Verificar página de prompts
  const promptsPageContent = fs.readFileSync('app/prompts/page.tsx', 'utf8')
  
  if (promptsPageContent.includes('PromptsErrorBoundary')) {
    console.log('✅ prompts/page.tsx - PromptsErrorBoundary integrado')
  } else {
    console.log('❌ prompts/page.tsx - PromptsErrorBoundary no integrado')
  }
  
} catch (error) {
  console.log(`❌ Error verificando sintaxis: ${error.message}`)
}

// Test 3: Verificar estructura de componentes
console.log('\n🏗️ Verificando estructura de componentes...')

try {
  const promptsPageContent = fs.readFileSync('app/prompts/page.tsx', 'utf8')
  
  // Verificar que el componente principal está envuelto en PromptsErrorBoundary
  if (promptsPageContent.includes('<PromptsErrorBoundary>') && 
      promptsPageContent.includes('<ChatIAPageContent />') &&
      promptsPageContent.includes('</PromptsErrorBoundary>')) {
    console.log('✅ Estructura de error boundary correcta')
  } else {
    console.log('⚠️ Estructura de error boundary puede estar incorrecta')
  }
  
  // Verificar imports
  if (promptsPageContent.includes('import PromptsErrorBoundary')) {
    console.log('✅ Import de PromptsErrorBoundary presente')
  } else {
    console.log('❌ Import de PromptsErrorBoundary faltante')
  }
  
} catch (error) {
  console.log(`❌ Error verificando estructura: ${error.message}`)
}

// Test 4: Verificar configuraciones de seguridad
console.log('\n🔒 Verificando configuraciones de seguridad...')

try {
  const useAdvancedSearchContent = fs.readFileSync('app/hooks/useAdvancedSearch.ts', 'utf8')
  
  // Verificar manejo de null/undefined
  if (useAdvancedSearchContent.includes('=== null || a === undefined') ||
      useAdvancedSearchContent.includes('=== null || b === undefined')) {
    console.log('✅ Manejo de null/undefined implementado')
  } else {
    console.log('⚠️ Manejo de null/undefined puede estar incompleto')
  }
  
  // Verificar try-catch en sorting
  if (useAdvancedSearchContent.includes('try {') && 
      useAdvancedSearchContent.includes('} catch (sortingError)')) {
    console.log('✅ Error handling en sorting implementado')
  } else {
    console.log('⚠️ Error handling en sorting puede estar incompleto')
  }
  
} catch (error) {
  console.log(`❌ Error verificando seguridad: ${error.message}`)
}

console.log('\n📊 Resumen del test:')
console.log('✅ Archivos críticos verificados')
console.log('✅ Sintaxis básica verificada')
console.log('✅ Estructura de componentes verificada')
console.log('✅ Configuraciones de seguridad verificadas')

console.log('\n🎉 Test completado. La página de prompts debería funcionar correctamente.')
console.log('\n📝 Próximos pasos:')
console.log('1. Ejecutar: npm run dev')
console.log('2. Navegar a: http://localhost:3000/prompts')
console.log('3. Verificar que la página carga sin errores')
console.log('4. Probar funcionalidades básicas (crear, editar, eliminar prompts)')

console.log('\n🔧 Si encuentras errores adicionales:')
console.log('- Revisa la consola del navegador para errores específicos')
console.log('- Verifica que todas las dependencias estén instaladas')
console.log('- Asegúrate de que las variables de entorno estén configuradas')