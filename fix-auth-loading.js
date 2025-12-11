// Script para arreglar el problema de carga infinita de autenticación

console.log('🔧 Arreglando problema de carga infinita de autenticación...')

// 1. Limpiar completamente el estado de autenticación
function clearAllAuthState() {
  console.log('🧹 Limpiando estado de autenticación...')
  
  if (typeof window !== 'undefined') {
    // Limpiar localStorage
    const localKeys = Object.keys(localStorage)
    localKeys.forEach(key => {
      if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
        try {
          localStorage.removeItem(key)
          console.log('✅ Eliminado de localStorage:', key)
        } catch (error) {
          console.warn('⚠️ Error eliminando:', key, error)
        }
      }
    })
    
    // Limpiar sessionStorage
    const sessionKeys = Object.keys(sessionStorage)
    sessionKeys.forEach(key => {
      if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
        try {
          sessionStorage.removeItem(key)
          console.log('✅ Eliminado de sessionStorage:', key)
        } catch (error) {
          console.warn('⚠️ Error eliminando:', key, error)
        }
      }
    })
    
    // Limpiar todas las cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    console.log('✅ Estado de autenticación completamente limpiado')
  }
}

// 2. Verificar conectividad con Supabase
async function testSupabaseHealth() {
  console.log('🌐 Verificando conectividad con Supabase...')
  
  const supabaseUrl = 'https://kvhhppipogfvcwtphiak.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2aGhwcGlwb2dmdmN3dHBoaWFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMjY5MDAsImV4cCI6MjA2NTYwMjkwMH0.OBMgZxLR7NGST109ouHlorX8lKOLpsa_bZHnzWkZnoM'
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (response.ok) {
      console.log('✅ Supabase está funcionando correctamente')
      return true
    } else {
      console.warn('⚠️ Supabase responde pero con error:', response.status)
      return false
    }
  } catch (error) {
    console.error('❌ Error conectando con Supabase:', error.message)
    return false
  }
}

// 3. Función principal de reparación
async function fixAuthLoading() {
  console.log('🚀 Iniciando reparación de autenticación...')
  
  // Paso 1: Limpiar estado
  clearAllAuthState()
  
  // Paso 2: Verificar conectividad
  const isSupabaseHealthy = await testSupabaseHealth()
  
  if (!isSupabaseHealthy) {
    console.warn('⚠️ Supabase no está respondiendo correctamente')
    console.log('💡 La aplicación funcionará en modo offline')
  }
  
  // Paso 3: Forzar recarga para aplicar cambios
  console.log('🔄 Recargando página para aplicar cambios...')
  
  // Esperar un momento antes de recargar
  setTimeout(() => {
    window.location.reload()
  }, 1000)
}

// 4. Ejecutar automáticamente
fixAuthLoading()

// 5. Hacer funciones disponibles globalmente para uso manual
if (typeof window !== 'undefined') {
  window.clearAllAuthState = clearAllAuthState
  window.testSupabaseHealth = testSupabaseHealth
  window.fixAuthLoading = fixAuthLoading
  
  console.log('💡 Funciones disponibles en consola del navegador:')
  console.log('- clearAllAuthState(): Limpiar estado de autenticación')
  console.log('- testSupabaseHealth(): Verificar conectividad con Supabase')
  console.log('- fixAuthLoading(): Ejecutar reparación completa')
}