// Script de diagnóstico para el problema de carga infinita de autenticación

console.log('🔍 Iniciando diagnóstico de autenticación...')

// 1. Verificar variables de entorno
console.log('📋 Variables de entorno:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurada' : '❌ No configurada')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No configurada')

// 2. Verificar localStorage
if (typeof window !== 'undefined') {
  console.log('🗄️ Estado de localStorage:')
  const keys = Object.keys(localStorage)
  const authKeys = keys.filter(key => key.includes('supabase') || key.includes('auth'))
  
  if (authKeys.length > 0) {
    console.log('Claves de autenticación encontradas:', authKeys)
    authKeys.forEach(key => {
      try {
        const value = localStorage.getItem(key)
        console.log(`${key}:`, value ? 'Tiene valor' : 'Vacío')
      } catch (error) {
        console.log(`${key}: Error al leer -`, error.message)
      }
    })
  } else {
    console.log('No se encontraron claves de autenticación en localStorage')
  }
}

// 3. Función para limpiar estado corrupto
function clearAuthState() {
  console.log('🧹 Limpiando estado de autenticación...')
  
  if (typeof window !== 'undefined') {
    // Limpiar localStorage
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
        localStorage.removeItem(key)
        console.log('Eliminado:', key)
      }
    })
    
    // Limpiar sessionStorage
    const sessionKeys = Object.keys(sessionStorage)
    sessionKeys.forEach(key => {
      if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
        sessionStorage.removeItem(key)
        console.log('Eliminado de session:', key)
      }
    })
    
    // Limpiar cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    console.log('✅ Estado de autenticación limpiado')
  }
}

// 4. Función para probar conexión a Supabase
async function testSupabaseConnection() {
  console.log('🌐 Probando conexión a Supabase...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variables de entorno de Supabase no configuradas')
    return false
  }
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })
    
    if (response.ok) {
      console.log('✅ Conexión a Supabase exitosa')
      return true
    } else {
      console.error('❌ Error de conexión a Supabase:', response.status, response.statusText)
      return false
    }
  } catch (error) {
    console.error('❌ Error al conectar con Supabase:', error.message)
    return false
  }
}

// 5. Ejecutar diagnóstico completo
async function runDiagnostic() {
  console.log('🚀 Ejecutando diagnóstico completo...')
  
  // Probar conexión
  const connectionOk = await testSupabaseConnection()
  
  if (!connectionOk) {
    console.log('💡 Sugerencia: Verificar configuración de Supabase en .env.local')
    return
  }
  
  // Si hay problemas, limpiar estado
  console.log('🔧 Limpiando estado para resolver problemas de carga...')
  clearAuthState()
  
  console.log('✅ Diagnóstico completado. Recarga la página.')
}

// Exportar funciones para uso manual
if (typeof window !== 'undefined') {
  window.clearAuthState = clearAuthState
  window.testSupabaseConnection = testSupabaseConnection
  window.runDiagnostic = runDiagnostic
  
  console.log('💡 Funciones disponibles en consola:')
  console.log('- clearAuthState(): Limpiar estado de autenticación')
  console.log('- testSupabaseConnection(): Probar conexión a Supabase')
  console.log('- runDiagnostic(): Ejecutar diagnóstico completo')
}

// Auto-ejecutar si se detectan problemas
runDiagnostic()