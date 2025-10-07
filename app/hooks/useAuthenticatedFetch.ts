import { useAuth } from './useAuth'
import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getApiUrl } from '../lib/config/api.config'

// Función auxiliar para crear errores detallados (estable, fuera del hook)
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
  let finalErrorMessage = errorMessage || `Error ${response.status}: ${response.statusText}`
  
  // Si hay detalles del error y el mensaje es genérico, usar los detalles
  if (errorDetails && (errorMessage === `Error ${response.status}: ${response.statusText}` || !errorMessage)) {
    if (typeof errorDetails === 'object') {
      if (errorDetails.error) finalErrorMessage = errorDetails.error
      else if (errorDetails.message) finalErrorMessage = errorDetails.message
      else if (errorDetails.details) finalErrorMessage = errorDetails.details
    } else if (typeof errorDetails === 'string') {
      finalErrorMessage = errorDetails
    }
  }
  
  const error = new Error(finalErrorMessage)
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

export function useAuthenticatedFetch() {
  const { user, isInitializing, isAuthenticated } = useAuth()

  const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}, retryCount = 0): Promise<Response> => {
    try {
      // Usar URL configurada para evitar problemas de CORS
      const apiUrl = getApiUrl(url)
      
      // Reducir logging para mejorar rendimiento
      if (retryCount === 0) {
        console.log('🔐 [AUTH] Petición autenticada:', apiUrl);
      }
      
      // Check if authentication is still initializing
      if (isInitializing) {
        throw new Error('Autenticación en proceso, por favor espera')
      }
      
      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        throw new Error('Usuario no autenticado')
      }
      
      // Verificar si Supabase está disponible
      if (!supabase) {
        throw new Error('Supabase not configured')
      }

      // Verificar autenticación con Supabase
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        throw new Error('No hay sesión activa en Supabase')
      }
      
      // Obtener token de Supabase
      const token = session.access_token
      
      if (!token) {
        throw new Error('No se pudo obtener el token de autenticación')
      }

      // Preparar headers con autenticación y email del usuario
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-user-email': user.email || '',
        'x-user-uid': user.id || '',
        ...(options.headers as Record<string, string> || {})
      }

      // Realizar la petición con el token
      const response = await fetch(apiUrl, {
        ...options,
        headers
      })

      // Manejar errores de autenticación
      if (response.status === 401) {
        console.warn(`🔐 [AUTH] Error 401 en intento ${retryCount + 1}/2 para ${url}`);
        
        // Si es el primer intento, reintentar refrescando la sesión
        if (retryCount < 2) {
          console.log('🔄 [AUTH] Intentando refrescar sesión de Supabase...');
          
          try {
            if (!supabase) {
              throw new Error('Supabase not configured');
            }
            
            // Intentar refrescar la sesión de Supabase
            const { data, error } = await supabase.auth.refreshSession();
            
            if (error) {
              console.error('❌ [AUTH] Error al refrescar sesión:', error.message);
              // Si el refresh falla, verificar si el usuario sigue autenticado
              if (!isAuthenticated || !user) {
                throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
              }
              throw new Error('No se pudo refrescar la sesión de autenticación');
            }
            
            if (data.session) {
              console.log('✅ [AUTH] Sesión refrescada exitosamente');
              return authenticatedFetch(url, options, retryCount + 1);
            } else {
              console.warn('⚠️ [AUTH] No se obtuvo sesión después del refresh');
              throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            }
          } catch (refreshError) {
            console.error('❌ [AUTH] Error durante el refresh:', refreshError);
            // Si es un error que ya lanzamos, re-lanzarlo
            if (refreshError instanceof Error && 
                (refreshError.message.includes('Sesión expirada') || 
                 refreshError.message.includes('No se pudo refrescar'))) {
              throw refreshError;
            }
            // Para otros errores, continuar con el flujo normal
          }
        }
        
        // Después de 2 intentos fallidos, verificar el estado de autenticación
        console.error('❌ [AUTH] Falló después de 2 intentos de autenticación');
        
        // Verificar si el usuario sigue autenticado en el contexto
        if (!isAuthenticated || !user) {
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        
        // Verificar el estado actual de la sesión de Supabase
        try {
          if (!supabase) {
            throw new Error('Supabase not configured');
          }
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          }
        } catch {
          throw new Error('Error al verificar el estado de la sesión. Por favor, inicia sesión nuevamente.');
        }
        
        // Si llegamos aquí, hay un problema con el token pero el usuario parece estar autenticado
        throw new Error('Token de autenticación inválido. Por favor, recarga la página o inicia sesión nuevamente.');
      }
      
      if (response.status === 403) {
        throw new Error('No tienes permisos para realizar esta acción')
      }
      
      return response
    } catch (error) {
      // Verificar si es un error de red
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Diagnóstico detallado del entorno y la URL solicitada
        try {
          const method = (options && options.method) ? options.method : 'GET'
          // Usar siempre rutas relativas para evitar problemas de CORS y hosts
          const finalUrl = url.startsWith('/') ? url : `/${url}`
          const currentOrigin = typeof window !== 'undefined' ? window.location.origin : ''
          const currentProtocol = typeof window !== 'undefined' ? window.location.protocol : 'http:'
          const reqProtocol = new URL(finalUrl).protocol
          const reqOrigin = new URL(finalUrl).origin
          const isMixedContent = currentProtocol === 'https:' && reqProtocol === 'http:'
          const isCrossOrigin = currentOrigin && reqOrigin !== currentOrigin
          const isOffline = typeof navigator !== 'undefined' ? !navigator.onLine : false

          console.error('🌐 [AUTH] Error de red: Failed to fetch - posible problema de conectividad');
          console.error('[Diagnóstico] Detalles de la petición:', {
            urlOriginal: url,
            urlFinal: finalUrl,
            method,
            headers: options?.headers,
            currentOrigin,
            reqOrigin,
            currentProtocol,
            reqProtocol,
            isMixedContent,
            isCrossOrigin,
            isOffline
          })

          if (isOffline) {
            console.error('📴 Parece que no hay conexión a internet (navigator.onLine = false).')
          }
          if (isMixedContent) {
            console.error('⚠️ Contenido mixto detectado: la página está en HTTPS pero intentas llamar un endpoint HTTP. Usa HTTPS o URLs relativas ("/api/...") para evitar bloqueo del navegador.')
          }
          if (isCrossOrigin) {
            console.error('🛑 Petición cross-origin detectada. Si el backend no permite CORS para este origen, el navegador bloqueará la solicitud. Verifica CORS o usa rutas relativas del mismo dominio.')
          }
        } catch (diagErr) {
          console.warn('No se pudo obtener diagnóstico extendido del error:', diagErr)
        }

        // Reintento para errores de red (máximo 1 reintento)
        if (retryCount === 0) {
          // Esperar un poco antes de reintentar
          await new Promise(resolve => setTimeout(resolve, 1000))
          return authenticatedFetch(url, options, retryCount + 1)
        }

        // Lanzar error más descriptivo después de reintentar
        const method = (options && options.method) ? options.method : 'GET'
        const finalUrl = url.startsWith('/') ? url : `/${url}`
        throw new Error(`Error de red al llamar ${finalUrl} (${method}). Posibles causas: conexión caída, endpoint incorrecto/ausente, CORS o contenido mixto. Revisa la consola para más detalles.`)
      }
      
      throw error
    }
  }, [user, isInitializing, isAuthenticated])

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
    const bodyData = data !== undefined ? JSON.stringify(data) : JSON.stringify({});
    
    // Logs de depuración para POST
    console.log('🔍 [DEBUG] useAuthenticatedFetch.post - Enviando petición:');
    console.log('- URL:', url);
    console.log('- Data original:', data);
    console.log('- Body JSON (longitud):', bodyData.length);
    console.log('- Body JSON (preview):', bodyData.substring(0, 200));
    console.log('- Headers:', customHeaders);
    
    const response = await authenticatedFetch(url, {
      method: 'POST',
      body: bodyData,
      headers: customHeaders
    })
    
    console.log('📡 [DEBUG] useAuthenticatedFetch.post - Respuesta recibida:');
    console.log('- Status:', response.status);
    console.log('- StatusText:', response.statusText);
    console.log('- Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      throw await createDetailedError(response)
    }
    
    const responseData = await response.json();
    console.log('✅ [DEBUG] useAuthenticatedFetch.post - Datos de respuesta:', responseData);
    
    return responseData;
  }, [authenticatedFetch])

  const put = useCallback(async (url: string, data: any, customHeaders: Record<string, string> = {}) => {
    const bodyData = data !== undefined ? JSON.stringify(data) : JSON.stringify({});
    
    // Logs de depuración para PUT
    console.log('🔍 [DEBUG] useAuthenticatedFetch.put - Enviando petición:');
    console.log('- URL:', url);
    console.log('- Data original:', data);
    console.log('- Body JSON (longitud):', bodyData.length);
    console.log('- Body JSON (preview):', bodyData.substring(0, 200));
    console.log('- Headers:', customHeaders);
    
    const response = await authenticatedFetch(url, {
      method: 'PUT',
      body: bodyData,
      headers: customHeaders
    })
    
    console.log('📡 [DEBUG] useAuthenticatedFetch.put - Respuesta recibida:');
    console.log('- Status:', response.status);
    console.log('- StatusText:', response.statusText);
    console.log('- Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      throw await createDetailedError(response)
    }
    
    const responseData = await response.json();
    console.log('✅ [DEBUG] useAuthenticatedFetch.put - Datos de respuesta:', responseData);
    
    return responseData;
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
    isAuthenticated,
    isInitializing,
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