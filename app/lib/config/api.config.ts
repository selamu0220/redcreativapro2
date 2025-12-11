/**
 * Configuración centralizada para URLs y endpoints de la API
 * Esto evita problemas de CORS y diferencias entre localhost y network access
 */

// Detectar si estamos en el navegador
const isBrowser = typeof window !== 'undefined'

// En desarrollo, usar siempre rutas relativas para evitar problemas de CORS
// En producción, se puede usar la URL configurada
export const getApiUrl = (endpoint: string): string => {
  // Siempre usar rutas relativas en desarrollo
  if (process.env.NODE_ENV === 'development') {
    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  }

  // En producción, preferir el origen actual del navegador para evitar puertos incorrectos
  const origin = isBrowser ? window.location.origin : ''
  const baseUrl = origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
}

// Configuración de CORS para desarrollo local
export const getAllowedOrigins = (): string[] => {
  const origins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ]
  
  // Agregar IP local si está disponible
  if (process.env.NEXT_PUBLIC_LOCAL_IP) {
    origins.push(`http://${process.env.NEXT_PUBLIC_LOCAL_IP}:3000`)
    origins.push(`http://${process.env.NEXT_PUBLIC_LOCAL_IP}:3001`)
  }
  
  return origins
}

// Helper para verificar si una URL es segura (mismo origen o localhost)
export const isSafeOrigin = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname
    
    // Permitir localhost y 127.0.0.1
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return true
    }
    
    // Permitir IPs privadas (192.168.x.x, 10.x.x.x, 172.16.x.x)
    if (hostname.match(/^192\.168\.\d+\.\d+$/) || 
        hostname.match(/^10\.\d+\.\d+\.\d+$/) || 
        hostname.match(/^172\.(1[6-9]|2[0-9]|3[01])\.\d+\.\d+$/)) {
      return true
    }
    
    return false
  } catch {
    return false
  }
}
