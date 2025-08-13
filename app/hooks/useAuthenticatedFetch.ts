import { useAuth } from './useAuth'
import { getAuth } from 'firebase/auth'
import { useCallback } from 'react'

export function useAuthenticatedFetch() {
  const { user } = useAuth()

  const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    try {
      // Obtener el token de Firebase
      const auth = getAuth()
      const token = await auth.currentUser?.getIdToken()
      
      if (!token) {
        throw new Error('No se pudo obtener el token de autenticación')
      }

      // Preparar headers con autenticación
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-user-email': user.email || '',
        ...options.headers
      }

      // Realizar la petición con el token
      const response = await fetch(url, {
        ...options,
        headers
      })

      // Manejar errores de autenticación
      if (response.status === 401) {
        throw new Error('Token de autenticación inválido o expirado')
      }

      if (response.status === 403) {
        throw new Error('No tienes permisos para acceder a este recurso')
      }

      return response
    } catch (error) {
      console.error('Error en petición autenticada:', error)
      throw error
    }
  }, [user])

  // Métodos de conveniencia
  const get = useCallback(async (url: string, customHeaders: Record<string, string> = {}) => {
    const response = await authenticatedFetch(url, { 
      method: 'GET',
      headers: customHeaders 
    })
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }
    return response.json()
  }, [authenticatedFetch])

  const post = useCallback(async (url: string, data: any, customHeaders: Record<string, string> = {}) => {
    const response = await authenticatedFetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: customHeaders
    })
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }
    return response.json()
  }, [authenticatedFetch])

  const put = useCallback(async (url: string, data: any, customHeaders: Record<string, string> = {}) => {
    const response = await authenticatedFetch(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: customHeaders
    })
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
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
      throw new Error(`Error ${response.status}: ${response.statusText}`)
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

// Hook para peticiones GET autenticadas
export function useAuthenticatedGet() {
  const { authenticatedFetch } = useAuthenticatedFetch()

  const get = async (url: string, customHeaders: Record<string, string> = {}) => {
    const response = await authenticatedFetch(url, { 
      method: 'GET',
      headers: customHeaders 
    })
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
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
      body: JSON.stringify(data),
      headers: customHeaders
    })
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
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
      body: JSON.stringify(data),
      headers: customHeaders
    })
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
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
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }
    return response.json()
  }

  return { delete: del }
}