console.log('🧪 Test rápido de la página de prompts')

const fs = require('fs')

// Verificar layout.tsx
const layoutContent = fs.readFileSync('app/layout.tsx', 'utf8')
if (layoutContent.includes('<div className="min-h-screen bg-black text-white">')) {
  console.log('✅ Layout simplificado correctamente')
} else {
  console.log('❌ Layout no simplificado')
}

// Verificar prompts page
const promptsContent = fs.readFileSync('app/prompts/page.tsx', 'utf8')
if (promptsContent.includes('WorkingAuthProvider') && promptsContent.includes('ToastProvider')) {
  console.log('✅ Providers incluidos en página de prompts')
} else {
  console.log('❌ Providers faltantes en página de prompts')
}

console.log('✅ Test completado - La página debería funcionar ahora')