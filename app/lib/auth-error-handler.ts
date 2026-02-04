// Utilidad para manejo centralizado de errores de autenticación
export interface AuthError {
  code: string;
  message: string;
  userMessage: string;
  shouldRetry: boolean;
  retryDelay?: number;
}

export const handleAuthError = (error: any): AuthError => {
  const errorMessage = error?.message || error?.toString() || 'Unknown error';
  
  // Errores de red
  if (errorMessage.includes('Failed to fetch')) {
    return {
      code: 'NETWORK_ERROR',
      message: errorMessage,
      userMessage: 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.',
      shouldRetry: true,
      retryDelay: 3000
    };
  }
  
  if (errorMessage.includes('Network request failed')) {
    return {
      code: 'NETWORK_REQUEST_FAILED',
      message: errorMessage,
      userMessage: 'Error de red. Por favor, intenta nuevamente en unos momentos.',
      shouldRetry: true,
      retryDelay: 5000
    };
  }
  
  if (errorMessage.includes('timeout') || errorMessage.includes('AbortError')) {
    return {
      code: 'TIMEOUT_ERROR',
      message: errorMessage,
      userMessage: 'La solicitud tardó demasiado. Verifica tu conexión e intenta nuevamente.',
      shouldRetry: true,
      retryDelay: 2000
    };
  }
  
  // Errores de autenticación específicos
  if (errorMessage.includes('Invalid login credentials')) {
    return {
      code: 'INVALID_CREDENTIALS',
      message: errorMessage,
      userMessage: 'Credenciales incorrectas. Verifica tu email y contraseña.',
      shouldRetry: false
    };
  }
  
  if (errorMessage.includes('Email not confirmed')) {
    return {
      code: 'EMAIL_NOT_CONFIRMED',
      message: errorMessage,
      userMessage: 'Por favor confirma tu email antes de iniciar sesión.',
      shouldRetry: false
    };
  }
  
  if (errorMessage.includes('refresh_token_not_found')) {
    return {
      code: 'REFRESH_TOKEN_NOT_FOUND',
      message: errorMessage,
      userMessage: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
      shouldRetry: false
    };
  }
  
  if (errorMessage.includes('invalid_grant')) {
    return {
      code: 'INVALID_GRANT',
      message: errorMessage,
      userMessage: 'Token de sesión inválido. Por favor, inicia sesión nuevamente.',
      shouldRetry: false
    };
  }
  
  // Errores de servidor
  if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
    return {
      code: 'SERVER_ERROR',
      message: errorMessage,
      userMessage: 'Error del servidor. Por favor, intenta nuevamente más tarde.',
      shouldRetry: true,
      retryDelay: 10000
    };
  }
  
  if (errorMessage.includes('503') || errorMessage.includes('Service Unavailable')) {
    return {
      code: 'SERVICE_UNAVAILABLE',
      message: errorMessage,
      userMessage: 'Servicio temporalmente no disponible. Intenta nuevamente en unos minutos.',
      shouldRetry: true,
      retryDelay: 30000
    };
  }
  
  // Error genérico
  return {
    code: 'UNKNOWN_ERROR',
    message: errorMessage,
    userMessage: `Error de autenticación: ${errorMessage}`,
    shouldRetry: false
  };
};

// Hook para manejo de reintentos automáticos
export const useAuthRetry = () => {
  const retry = async (
    operation: () => Promise<any>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<any> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        const authError = handleAuthError(error);
        
        console.error(`Auth operation failed (attempt ${attempt}):`, authError);
        
        // Si no debe reintentar o es el último intento, lanzar el error
        if (!authError.shouldRetry || attempt === maxRetries) {
          throw authError;
        }
        
        // Esperar antes del siguiente intento
        const delay = authError.retryDelay || baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };
  
  return { retry };
};

// Función para detectar si el error es recuperable
export const isRecoverableError = (error: any): boolean => {
  const authError = handleAuthError(error);
  return authError.shouldRetry;
};

// Función para obtener el mensaje de usuario apropiado
export const getUserErrorMessage = (error: any): string => {
  const authError = handleAuthError(error);
  return authError.userMessage;
};
