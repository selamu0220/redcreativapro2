import { useAuth } from './useAuth'
import { useCallback } from 'react'

export function useAuthenticatedFetch() {
  const { user } = useAuth()

  const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    console.log('🔐 [AUTH DEBUG] Iniciando petición autenticada a:', url);
    
    if (!user) {
      console.error('❌ [AUTH DEBUG] Usuario no autenticado');
      throw new Error('Usuario no autenticado')
    }

    console.log('👤 [AUTH DEBUG] Usuario autenticado:', { email: user.email, uid: user.uid });

    try {
      // Obtener el token de Firebase
      console.log('🔑 [AUTH DEBUG] Obteniendo token de Firebase...');
      
      // Dynamically import Firebase Auth only in browser environment
      if (typeof window === 'undefined') {
        throw new Error('Firebase Auth no disponible en el servidor')
      }
      
      const { getAuth } = await import('firebase/auth')
      const auth = getAuth()
      
      if (!auth.currentUser) {
        console.error('❌ [AUTH DEBUG] No hay usuario actual en Firebase Auth');
        throw new Error('No hay usuario autenticado en Firebase')
      }
      
      console.log('✅ [AUTH DEBUG] Usuario Firebase encontrado:', auth.currentUser.email);
      
      const token = await auth.currentUser.getIdToken()
      
      if (!token) {
        console.error('❌ [AUTH DEBUG] Token de Firebase es null o undefined');
        throw new Error('No se pudo obtener el token de autenticación')
      }
      
      console.log('✅ [AUTH DEBUG] Token de Firebase obtenido exitosamente');

      // Preparar headers con autenticación
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-user-email': user.email || '',
        ...options.headers as Record<string, string>
      }

      // Sistema robusto de headers de configuración de email
      console.log('📧 === PREPARANDO HEADERS DE EMAIL ===');
      
      const emailProvider = localStorage.getItem('selectedEmailProvider')
      const selectedProvider = localStorage.getItem('selectedProvider') || emailProvider // Fallback
      
      console.log('🔧 Proveedor detectado:', { emailProvider, selectedProvider });
      
      if (emailProvider) headers['x-email-provider'] = emailProvider
      if (selectedProvider) headers['x-selected-provider'] = selectedProvider
      
      // Headers específicos por proveedor con validación
      const gmailUser = localStorage.getItem('gmail_user')
      const gmailPassword = localStorage.getItem('gmail_app_password')
      const web3formsKey = localStorage.getItem('web3forms_key')
      const senderEmail = localStorage.getItem('sender_email')
      const resendApiKey = localStorage.getItem('resend_api_key')
      const resendFromEmail = localStorage.getItem('resend_from_email')
      
      // Gmail headers
      if (gmailUser) {
        headers['x-gmail-user'] = gmailUser
        console.log('✅ Gmail user header agregado');
      }
      if (gmailPassword) {
        headers['x-gmail-password'] = gmailPassword
        console.log('✅ Gmail password header agregado');
      }
      
      // Web3Forms headers
      if (web3formsKey) {
        headers['x-web3forms-key'] = web3formsKey
        console.log('✅ Web3Forms key header agregado');
      }
      if (senderEmail) {
        headers['x-web3forms-sender'] = senderEmail
        console.log('✅ Web3Forms sender header agregado');
      }
      
      // Resend headers
      if (resendApiKey) {
        headers['x-resend-key'] = resendApiKey
        console.log('✅ Resend API key header agregado');
      }
      if (resendFromEmail) {
        headers['x-resend-sender'] = resendFromEmail
        console.log('✅ Resend sender header agregado');
      }
      
      // Log de resumen de headers
      const headerSummary = {
        hasEmailProvider: !!emailProvider,
        hasSelectedProvider: !!selectedProvider,
        hasGmailUser: !!gmailUser,
        hasGmailPassword: !!gmailPassword,
        hasWeb3formsKey: !!web3formsKey,
        hasWeb3formsSender: !!senderEmail,
        hasResendKey: !!resendApiKey,
        hasResendSender: !!resendFromEmail
      };
      
      console.log('📋 Resumen de headers enviados:', headerSummary);
      console.log('🚀 === HEADERS PREPARADOS ===');

      // Realizar la petición con el token
      console.log('🌐 [AUTH DEBUG] Realizando petición fetch...');
      const response = await fetch(url, {
        ...options,
        headers
      })
      
      console.log('📡 [AUTH DEBUG] Respuesta recibida:', { status: response.status, statusText: response.statusText });

      // Manejar errores de autenticación
      if (response.status === 401) {
        console.error('❌ [AUTH DEBUG] Error 401: Token inválido o expirado');
        throw new Error('Token de autenticación inválido o expirado')
      }

      if (response.status === 403) {
        console.error('❌ [AUTH DEBUG] Error 403: Sin permisos');
        throw new Error('No tienes permisos para acceder a este recurso')
      }

      console.log('✅ [AUTH DEBUG] Petición completada exitosamente');
      return response
    } catch (error) {
      console.error('❌ [AUTH DEBUG] Error en petición autenticada:', error);
      
      // Identificar el tipo de error específico
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('🌐 [AUTH DEBUG] Error de red: Failed to fetch - posible problema de conectividad');
        throw new Error('Error de conexión: No se pudo conectar al servidor. Verifica tu conexión a internet.')
      }
      
      if (error instanceof Error && error.message.includes('Firebase')) {
        console.error('🔥 [AUTH DEBUG] Error específico de Firebase:', error.message);
        throw new Error(`Error de autenticación Firebase: ${error.message}`)
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