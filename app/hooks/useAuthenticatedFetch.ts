import { useAuth } from './useAuth'
import { useCallback } from 'react'

export function useAuthenticatedFetch() {
  const { user } = useAuth()

  const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}, retryCount = 0): Promise<Response> => {
    try {
      console.log('🔐 [AUTH DEBUG] Iniciando petición autenticada...');
      console.log('👤 [AUTH DEBUG] Usuario actual:', user?.email || 'No disponible');
      console.log('🔄 [AUTH DEBUG] Intento número:', retryCount + 1);
      
      if (!user) {
        console.error('❌ [AUTH DEBUG] No hay usuario autenticado en useAuth');
        throw new Error('Usuario no autenticado')
      }
      
      // Dynamically import Firebase Auth only in browser environment
      if (typeof window === 'undefined') {
        console.error('❌ [AUTH DEBUG] Intentando usar Firebase Auth en el servidor');
        throw new Error('Firebase Auth no disponible en el servidor')
      }
      
      console.log('🔥 [AUTH DEBUG] Importando Firebase Auth...');
      const { getAuth } = await import('firebase/auth')
      const auth = getAuth()
      
      console.log('🔥 [AUTH DEBUG] Firebase Auth obtenido:', !!auth);
      console.log('🔥 [AUTH DEBUG] Usuario actual en Firebase:', !!auth.currentUser);
      
      if (!auth.currentUser) {
        console.error('❌ [AUTH DEBUG] No hay usuario actual en Firebase Auth');
        console.error('❌ [AUTH DEBUG] Estado de auth:', { auth: !!auth, currentUser: !!auth?.currentUser });
        throw new Error('No hay usuario autenticado en Firebase')
      }
      
      console.log('✅ [AUTH DEBUG] Usuario Firebase encontrado:', auth.currentUser.email);
      console.log('🔥 [AUTH DEBUG] UID del usuario:', auth.currentUser.uid);
      
      // Obtener token de Firebase (forzar renovación si es un reintento)
      const forceRefresh = retryCount > 0
      console.log(`🔥 [AUTH DEBUG] Obteniendo token de Firebase (forceRefresh: ${forceRefresh})...`);
      
      const token = await auth.currentUser.getIdToken(forceRefresh)
      
      console.log('🔥 [AUTH DEBUG] Token obtenido:', !!token);
      console.log('🔥 [AUTH DEBUG] Longitud del token:', token?.length || 0);
      
      if (!token) {
        console.error('❌ [AUTH DEBUG] Token de Firebase es null o undefined');
        throw new Error('No se pudo obtener el token de autenticación')
      }
      
      console.log(`✅ [AUTH DEBUG] Token de Firebase obtenido exitosamente${forceRefresh ? ' (renovado)' : ''}`);

      // Preparar headers con autenticación
      console.log('🔧 [AUTH DEBUG] Construyendo headers de autenticación...');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-user-email': user.email || '',
        ...options.headers as Record<string, string>
      }
      
      console.log('🔧 [AUTH DEBUG] Headers base construidos:', {
        hasContentType: !!headers['Content-Type'],
        hasAuthorization: !!headers['Authorization'],
        hasUserEmail: !!headers['x-user-email'],
        userEmail: headers['x-user-email'],
        authorizationPrefix: headers['Authorization']?.substring(0, 20) + '...'
      });

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
        hasResendKey: !!resendApiKey,
        hasResendSender: !!resendFromEmail
      };
      
      console.log('📋 Resumen de headers enviados:', headerSummary);
      console.log('🚀 === HEADERS PREPARADOS ===');

      // Realizar la petición con el token
      console.log('🌐 [AUTH DEBUG] Realizando petición fetch...');
      console.log('🔗 [AUTH DEBUG] URL:', url);
      console.log('⚙️ [AUTH DEBUG] Opciones de fetch:', { method: options.method || 'GET' });
      console.log('🚀 [AUTH DEBUG] Headers finales a enviar:', Object.fromEntries(
        Object.entries(headers).map(([k, v]) => [
          k, 
          k.toLowerCase().includes('authorization') ? `${v.substring(0, 20)}...` : v
        ])
      ));
      
      const response = await fetch(url, {
        ...options,
        headers
      })
      
      console.log('📡 [AUTH DEBUG] Respuesta recibida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      // Manejar errores de autenticación con más detalle
      if (response.status === 401) {
        console.error('❌ [AUTH DEBUG] Error 401: Token inválido o expirado');
        console.error('🔍 [AUTH DEBUG] URL de la petición:', url);
        console.error('🔍 [AUTH DEBUG] Headers enviados:', Object.fromEntries(Object.entries(headers).map(([k, v]) => [k, k.toLowerCase().includes('authorization') ? `${v.substring(0, 20)}...` : v])));
        
        // Intentar leer el cuerpo de la respuesta para más detalles
        try {
          const errorBody = await response.clone().text();
          console.error('📄 [AUTH DEBUG] Cuerpo del error 401:', errorBody);
        } catch (e) {
          console.error('❌ [AUTH DEBUG] No se pudo leer el cuerpo del error:', e);
        }
        
        // Reintento automático con token renovado (máximo 1 reintento)
        if (retryCount === 0) {
          console.log('🔄 [AUTH DEBUG] Reintentando con token renovado...');
          return authenticatedFetch(url, options, retryCount + 1);
        }
        
        throw new Error('Token de autenticación inválido o expirado')
      }

      if (response.status === 403) {
        console.error('❌ [AUTH DEBUG] Error 403: Sin permisos');
        throw new Error('No tienes permisos para acceder a este recurso')
      }

      console.log('✅ [AUTH DEBUG] Petición completada exitosamente');
      return response
    } catch (error) {
      console.error('❌ [AUTH DEBUG] Error en petición autenticada:', {
        message: error instanceof Error ? error.message : 'Error desconocido',
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack?.substring(0, 200) + '...' : 'No stack',
        retryCount,
        url
      });
      
      // Identificar el tipo de error específico con detección mejorada
      const isNetworkError = (
        (error instanceof TypeError && error.message.includes('Failed to fetch')) ||
        (error instanceof Error && error.message?.includes('fetch')) ||
        (error instanceof Error && error.message?.includes('NetworkError')) ||
        !navigator.onLine
      );
      
      if (isNetworkError) {
        const connectionMessage = !navigator.onLine 
          ? 'Sin conexión a internet. Verifica tu conexión de red.'
          : 'No se pudo conectar al servidor. Verifica que el servidor esté ejecutándose en http://localhost:3000';
          
        console.error(`🌐 [AUTH DEBUG] Error de red: ${connectionMessage}`);
        
        // Reintento automático para errores de red (máximo 2 reintentos)
        if (retryCount < 2) {
          console.log(`🔄 [AUTH DEBUG] Reintentando petición por error de red (intento ${retryCount + 1}/2)...`);
          
          // Delay progresivo: 1s, 2s
          const delay = 1000 * (retryCount + 1);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Verificar si estamos de vuelta en línea antes de reintentar
          if (!navigator.onLine) {
            throw new Error('Sin conexión a internet. Verifica tu conexión de red.');
          }
          
          return authenticatedFetch(url, options, retryCount + 1);
        }
        
        throw new Error(connectionMessage)
      }
      
      if (error instanceof Error && error.message.includes('Firebase')) {
        console.error('🔥 [AUTH DEBUG] Error específico de Firebase:', error.message);
        throw new Error(`Error de autenticación Firebase: ${error.message}`)
      }
      
      // Si es un error de autenticación y no hemos reintentado, intentar una vez más
      if (error instanceof Error && 
          (error.message.includes('auth') || error.message.includes('token')) && 
          retryCount === 0) {
        console.log('🔄 [AUTH DEBUG] Reintentando con token renovado...');
        return authenticatedFetch(url, options, retryCount + 1);
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