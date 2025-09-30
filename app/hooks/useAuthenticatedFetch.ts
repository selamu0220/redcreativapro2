import { useAuth } from './useAuth'
import { useCallback } from 'react'

export function useAuthenticatedFetch() {
  const { user } = useAuth()

  const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}, retryCount = 0): Promise<Response> => {
    try {
      // Reducir logging para mejorar rendimiento
      if (retryCount === 0) {
        console.log('🔐 [AUTH] Petición autenticada:', url);
      }
      
      if (!user) {
        throw new Error('Usuario no autenticado')
      }
      
      // Dynamically import Firebase Auth only in browser environment
      if (typeof window === 'undefined') {
        throw new Error('Firebase Auth no disponible en el servidor')
      }
      
      const { getAuth } = await import('firebase/auth')
      const auth = getAuth()
      
      if (!auth.currentUser) {
        throw new Error('No hay usuario autenticado en Firebase')
      }
      
      // Obtener token de Firebase (forzar renovación si es un reintento)
      const forceRefresh = retryCount > 0
      const token = await auth.currentUser.getIdToken(forceRefresh)
      
      if (!token) {
        throw new Error('No se pudo obtener el token de autenticación')
      }

      // Preparar headers con autenticación
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {})
      }
      
      // Email configuration is handled through custom headers passed from the calling component
      // No need to add email config here as it's already managed by the API endpoints

      // Realizar la petición con el token
      const response = await fetch(url, {
        ...options,
        headers
      })

      // Manejar errores de autenticación
      if (response.status === 401) {
        // Si es el primer intento, reintentar con token renovado
        if (retryCount < 2) {
          return authenticatedFetch(url, options, retryCount + 1)
        }
        throw new Error('Token de autenticación inválido o expirado')
      }
      
      if (response.status === 403) {
        throw new Error('No tienes permisos para realizar esta acción')
      }
      
      return response
    } catch (error) {
      // Verificar si es un error de red
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('🌐 [AUTH] Error de red: Failed to fetch - posible problema de conectividad');
        console.error('Error de conexión: No se pudo conectar al servidor. Verifica tu conexión a internet.');
        
        // Reintento para errores de red (máximo 1 reintento)
        if (retryCount === 0) {
          // Esperar un poco antes de reintentar
          await new Promise(resolve => setTimeout(resolve, 1000))
          return authenticatedFetch(url, options, retryCount + 1)
        }
      }
      
      throw error
    }
  }, [user])

  // Función auxiliar para crear errores detallados
  const createDetailedError = async (response: Response) => {
    let errorMessage = `Error ${response.status}: ${response.statusText}`
    let errorDetails = null
    
    try {
      // Intentar obtener detalles del error del cuerpo de la respuesta
      const responseText = await response.text()
      if (responseText) {
        try {
          errorDetails = JSON.parse(responseText)
          if (errorDetails.error) {
            errorMessage = errorDetails.error
          }
        } catch {
          // Si no es JSON válido, usar el texto como mensaje
          errorMessage = responseText
        }
      }
    } catch {
      // Si no se puede leer el cuerpo, usar el mensaje por defecto
    }
    
    // Crear error con información adicional para 429
    const error = new Error(errorMessage)
    if (response.status === 429) {
      // Agregar información específica para errores de rate limiting
      error.name = 'RateLimitError'
      const retryAfter = response.headers.get('Retry-After')
      if (retryAfter) {
        (error as any).retryAfter = parseInt(retryAfter) * 1000 // Convertir a ms
      }
    }
    
    // Agregar código de estado al error
    ;(error as any).status = response.status
    ;(error as any).statusText = response.statusText
    ;(error as any).details = errorDetails
    
    return error
  }

  // Métodos de conveniencia
  const get = useCallback(async (url: string, customHeaders: Record<string, string> = {}) => {
    const response = await authenticatedFetch(url, { 
      method: 'GET',
      headers: customHeaders 
    })
    if (!response.ok) {
      throw await createDetailedError(response)
    }
    return response.json()
  }, [authenticatedFetch])

  const post = useCallback(async (url: string, data: any, customHeaders: Record<string, string> = {}) => {
    const response = await authenticatedFetch(url, {
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : JSON.stringify({}),
      headers: customHeaders
    })
    if (!response.ok) {
      throw await createDetailedError(response)
    }
    return response.json()
  }, [authenticatedFetch])

  const put = useCallback(async (url: string, data: any, customHeaders: Record<string, string> = {}) => {
    const response = await authenticatedFetch(url, {
      method: 'PUT',
      body: data !== undefined ? JSON.stringify(data) : JSON.stringify({}),
      headers: customHeaders
    })
    if (!response.ok) {
      throw await createDetailedError(response)
    }
    return response.json()
  }, [authenticatedFetch])

  const del = useCallback(async (url: string, data?: any, customHeaders: Record<string, string> = {}) => {
    const options: RequestInit = { 
      method: 'DELETE',
      headers: customHeaders 
    }
    if (data) {
      options.body = JSON.stringify(data)
    }
    const response = await authenticatedFetch(url, options)
    if (!response.ok) {
      throw await createDetailedError(response)
    }
    return response.json()
  }, [authenticatedFetch])

  return { 
    authenticatedFetch, 
    isAuthenticated: !!user,
    get,
    post,
    put,
    del
  }
}

// Función auxiliar para crear errores detallados (reutilizable)
const createDetailedErrorStandalone = async (response: Response) => {
  let errorMessage = `Error ${response.status}: ${response.statusText}`
  let errorDetails = null
  
  try {
    // Intentar obtener detalles del error del cuerpo de la respuesta
    const responseText = await response.text()
    if (responseText) {
      try {
        errorDetails = JSON.parse(responseText)
        if (errorDetails.error) {
          errorMessage = errorDetails.error
        }
      } catch {
        // Si no es JSON válido, usar el texto como mensaje
        errorMessage = responseText
      }
    }
  } catch {
    // Si no se puede leer el cuerpo, usar el mensaje por defecto
  }
  
  // Crear error con información adicional para 429
  const error = new Error(errorMessage)
  if (response.status === 429) {
    // Agregar información específica para errores de rate limiting
    error.name = 'RateLimitError'
    const retryAfter = response.headers.get('Retry-After')
    if (retryAfter) {
      (error as any).retryAfter = parseInt(retryAfter) * 1000 // Convertir a ms
    }
  }
  
  // Agregar código de estado al error
  ;(error as any).status = response.status
  ;(error as any).statusText = response.statusText
  ;(error as any).details = errorDetails
  
  return error
}

// Hook para peticiones GET autenticadas
export function useAuthenticatedGet() {
  const { authenticatedFetch } = useAuthenticatedFetch()

  const get = async (url: string, customHeaders: Record<string, string> = {}) => {
    const response = await authenticatedFetch(url, { 
      method: 'GET',
      headers: customHeaders 
    })
    if (!response.ok) {
      throw await createDetailedErrorStandalone(response)
    }
    return response.json()
  }

  return { get }
}

// Hook para peticiones POST autenticadas
export function useAuthenticatedPost() {
  const { authenticatedFetch } = useAuthenticatedFetch()

  const post = async (url: string, data: any, customHeaders: Record<string, string> = {}) => {
    const response = await authenticatedFetch(url, {
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : JSON.stringify({}),
      headers: customHeaders
    })
    if (!response.ok) {
      throw await createDetailedErrorStandalone(response)
    }
    return response.json()
  }

  return { post }
}

// Hook para peticiones PUT autenticadas
export function useAuthenticatedPut() {
  const { authenticatedFetch } = useAuthenticatedFetch()

  const put = async (url: string, data: any, customHeaders: Record<string, string> = {}) => {
    const response = await authenticatedFetch(url, {
      method: 'PUT',
      body: data !== undefined ? JSON.stringify(data) : JSON.stringify({}),
      headers: customHeaders
    })
    if (!response.ok) {
      throw await createDetailedErrorStandalone(response)
    }
    return response.json()
  }

  return { put }
}

// Hook para peticiones DELETE autenticadas
export function useAuthenticatedDelete() {
  const { authenticatedFetch } = useAuthenticatedFetch()

  const del = async (url: string, data?: any, customHeaders: Record<string, string> = {}) => {
    const options: RequestInit = { 
      method: 'DELETE',
      headers: customHeaders 
    }
    if (data) {
      options.body = JSON.stringify(data)
    }
    const response = await authenticatedFetch(url, options)
    if (!response.ok) {
      throw await createDetailedErrorStandalone(response)
    }
    return response.json()
  }

  return { delete: del }
}