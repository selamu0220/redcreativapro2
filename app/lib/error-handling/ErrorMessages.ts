/**
 * Comprehensive Error Message Mapping System
 * 
 * This module provides a centralized mapping of error codes to user-friendly messages
 * for the AI Writer system. It includes specific mappings for HTTP status codes,
 * network errors, authentication errors, rate limiting, and AI service errors.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */

export interface ErrorMessage {
  code: string;
  title: string;
  message: string;
  userMessage: string;
  actionable?: boolean;
  retryable?: boolean;
  upgradeRequired?: boolean;
  contactSupport?: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorContext {
  operation?: string;
  component?: string;
  userId?: string;
  timestamp?: number;
  metadata?: Record<string, any>;
}

/**
 * Comprehensive error message mappings
 */
export const ERROR_MESSAGES: Record<string, ErrorMessage> = {
  // Content Validation Errors
  EMPTY_CONTENT: {
    code: 'EMPTY_CONTENT',
    title: 'Contenido vacío',
    message: 'No se puede procesar contenido vacío',
    userMessage: 'Por favor, escribe algo de texto antes de usar la mejora con IA.',
    actionable: true,
    retryable: false,
    severity: 'low'
  },

  CONTENT_TOO_SHORT: {
    code: 'CONTENT_TOO_SHORT',
    title: 'Contenido muy corto',
    message: 'El contenido debe tener al menos 10 palabras',
    userMessage: 'Escribe al menos 10 palabras para poder mejorar el texto.',
    actionable: true,
    retryable: false,
    severity: 'low'
  },

  CONTENT_TOO_LONG: {
    code: 'CONTENT_TOO_LONG',
    title: 'Contenido muy largo',
    message: 'El contenido excede el límite máximo permitido',
    userMessage: 'El texto es muy largo. Intenta dividirlo en partes más pequeñas.',
    actionable: true,
    retryable: false,
    severity: 'medium'
  },

  INVALID_CONTENT_FORMAT: {
    code: 'INVALID_CONTENT_FORMAT',
    title: 'Formato inválido',
    message: 'El formato del contenido no es válido',
    userMessage: 'El formato del texto no es válido. Verifica que no contenga caracteres especiales problemáticos.',
    actionable: true,
    retryable: false,
    severity: 'medium'
  },

  // Authentication & Authorization Errors
  AUTHENTICATION_REQUIRED: {
    code: 'AUTHENTICATION_REQUIRED',
    title: 'Autenticación requerida',
    message: 'User authentication is required',
    userMessage: 'Debes iniciar sesión para usar esta función.',
    actionable: true,
    retryable: false,
    severity: 'high'
  },

  AUTHENTICATION_EXPIRED: {
    code: 'AUTHENTICATION_EXPIRED',
    title: 'Sesión expirada',
    message: 'Authentication token has expired',
    userMessage: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
    actionable: true,
    retryable: false,
    severity: 'high'
  },

  INSUFFICIENT_PERMISSIONS: {
    code: 'INSUFFICIENT_PERMISSIONS',
    title: 'Permisos insuficientes',
    message: 'User lacks required permissions',
    userMessage: 'No tienes permisos para realizar esta acción.',
    actionable: false,
    retryable: false,
    contactSupport: true,
    severity: 'high'
  },

  // Rate Limiting & Usage Errors
  RATE_LIMIT_EXCEEDED: {
    code: 'RATE_LIMIT_EXCEEDED',
    title: 'Límite de velocidad excedido',
    message: 'Too many requests in a short period',
    userMessage: 'Has realizado demasiadas solicitudes. Espera un momento antes de intentar nuevamente.',
    actionable: true,
    retryable: true,
    severity: 'medium'
  },

  DAILY_LIMIT_REACHED: {
    code: 'DAILY_LIMIT_REACHED',
    title: 'Límite diario alcanzado',
    message: 'Daily usage limit has been reached',
    userMessage: 'Has alcanzado tu límite diario de mejoras. Actualiza tu plan para continuar.',
    actionable: true,
    retryable: false,
    upgradeRequired: true,
    severity: 'medium'
  },

  MONTHLY_LIMIT_REACHED: {
    code: 'MONTHLY_LIMIT_REACHED',
    title: 'Límite mensual alcanzado',
    message: 'Monthly usage limit has been reached',
    userMessage: 'Has alcanzado tu límite mensual. Actualiza tu plan o espera al próximo mes.',
    actionable: true,
    retryable: false,
    upgradeRequired: true,
    severity: 'medium'
  },

  QUOTA_EXCEEDED: {
    code: 'QUOTA_EXCEEDED',
    title: 'Cuota excedida',
    message: 'Usage quota has been exceeded',
    userMessage: 'Has excedido tu cuota de uso. Considera actualizar tu plan.',
    actionable: true,
    retryable: false,
    upgradeRequired: true,
    severity: 'medium'
  },

  // Network & Connection Errors
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    title: 'Error de conexión',
    message: 'Network connection failed',
    userMessage: 'Error de conexión. Verifica tu internet e intenta nuevamente.',
    actionable: true,
    retryable: true,
    severity: 'medium'
  },

  TIMEOUT_ERROR: {
    code: 'TIMEOUT_ERROR',
    title: 'Tiempo de espera agotado',
    message: 'Request timed out',
    userMessage: 'La solicitud tardó demasiado. Intenta con un texto más corto.',
    actionable: true,
    retryable: true,
    severity: 'medium'
  },

  CONNECTION_REFUSED: {
    code: 'CONNECTION_REFUSED',
    title: 'Conexión rechazada',
    message: 'Connection was refused by server',
    userMessage: 'No se pudo conectar al servicio. Intenta nuevamente en unos minutos.',
    actionable: true,
    retryable: true,
    severity: 'high'
  },

  DNS_ERROR: {
    code: 'DNS_ERROR',
    title: 'Error de DNS',
    message: 'DNS resolution failed',
    userMessage: 'Error de conectividad. Verifica tu conexión a internet.',
    actionable: true,
    retryable: true,
    severity: 'medium'
  },

  // HTTP Status Code Errors
  BAD_REQUEST: {
    code: 'BAD_REQUEST',
    title: 'Solicitud inválida',
    message: 'Bad request (400)',
    userMessage: 'La solicitud no es válida. Verifica el contenido e intenta nuevamente.',
    actionable: true,
    retryable: false,
    severity: 'medium'
  },

  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    title: 'No autorizado',
    message: 'Unauthorized access (401)',
    userMessage: 'No estás autorizado. Inicia sesión e intenta nuevamente.',
    actionable: true,
    retryable: false,
    severity: 'high'
  },

  FORBIDDEN: {
    code: 'FORBIDDEN',
    title: 'Acceso prohibido',
    message: 'Access forbidden (403)',
    userMessage: 'Acceso denegado. Verifica tus permisos o actualiza tu plan.',
    actionable: true,
    retryable: false,
    upgradeRequired: true,
    severity: 'high'
  },

  NOT_FOUND: {
    code: 'NOT_FOUND',
    title: 'No encontrado',
    message: 'Resource not found (404)',
    userMessage: 'El servicio no está disponible temporalmente.',
    actionable: true,
    retryable: true,
    contactSupport: true,
    severity: 'high'
  },

  METHOD_NOT_ALLOWED: {
    code: 'METHOD_NOT_ALLOWED',
    title: 'Método no permitido',
    message: 'Method not allowed (405)',
    userMessage: 'Error interno del sistema. Contacta al soporte técnico.',
    actionable: false,
    retryable: false,
    contactSupport: true,
    severity: 'high'
  },

  CONFLICT: {
    code: 'CONFLICT',
    title: 'Conflicto',
    message: 'Request conflict (409)',
    userMessage: 'Hay un conflicto con tu solicitud. Intenta nuevamente.',
    actionable: true,
    retryable: true,
    severity: 'medium'
  },

  PAYLOAD_TOO_LARGE: {
    code: 'PAYLOAD_TOO_LARGE',
    title: 'Contenido muy grande',
    message: 'Payload too large (413)',
    userMessage: 'El texto es demasiado largo. Divide el contenido en partes más pequeñas.',
    actionable: true,
    retryable: false,
    severity: 'medium'
  },

  TOO_MANY_REQUESTS: {
    code: 'TOO_MANY_REQUESTS',
    title: 'Demasiadas solicitudes',
    message: 'Too many requests (429)',
    userMessage: 'Has realizado demasiadas solicitudes. Espera un momento antes de continuar.',
    actionable: true,
    retryable: true,
    severity: 'medium'
  },

  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    title: 'Error interno del servidor',
    message: 'Internal server error (500)',
    userMessage: 'Error interno del servidor. Intenta nuevamente en unos minutos.',
    actionable: true,
    retryable: true,
    contactSupport: true,
    severity: 'high'
  },

  BAD_GATEWAY: {
    code: 'BAD_GATEWAY',
    title: 'Gateway inválido',
    message: 'Bad gateway (502)',
    userMessage: 'Error de conectividad del servidor. Intenta nuevamente.',
    actionable: true,
    retryable: true,
    severity: 'high'
  },

  SERVICE_UNAVAILABLE: {
    code: 'SERVICE_UNAVAILABLE',
    title: 'Servicio no disponible',
    message: 'Service unavailable (503)',
    userMessage: 'El servicio no está disponible temporalmente. Intenta más tarde.',
    actionable: true,
    retryable: true,
    severity: 'high'
  },

  GATEWAY_TIMEOUT: {
    code: 'GATEWAY_TIMEOUT',
    title: 'Tiempo de espera del gateway',
    message: 'Gateway timeout (504)',
    userMessage: 'El servidor tardó demasiado en responder. Intenta con un texto más corto.',
    actionable: true,
    retryable: true,
    severity: 'high'
  },

  // AI Service Specific Errors
  AI_SERVICE_UNAVAILABLE: {
    code: 'AI_SERVICE_UNAVAILABLE',
    title: 'Servicio de IA no disponible',
    message: 'AI service is currently unavailable',
    userMessage: 'El servicio de IA no está disponible. Intenta nuevamente en unos minutos.',
    actionable: true,
    retryable: true,
    severity: 'high'
  },

  AI_MODEL_OVERLOADED: {
    code: 'AI_MODEL_OVERLOADED',
    title: 'Modelo de IA sobrecargado',
    message: 'AI model is currently overloaded',
    userMessage: 'El modelo de IA está sobrecargado. Intenta nuevamente en unos segundos.',
    actionable: true,
    retryable: true,
    severity: 'medium'
  },

  AI_CONTENT_FILTERED: {
    code: 'AI_CONTENT_FILTERED',
    title: 'Contenido filtrado',
    message: 'Content was filtered by AI safety systems',
    userMessage: 'El contenido no pudo ser procesado por políticas de seguridad. Modifica el texto e intenta nuevamente.',
    actionable: true,
    retryable: false,
    severity: 'medium'
  },

  AI_INVALID_RESPONSE: {
    code: 'AI_INVALID_RESPONSE',
    title: 'Respuesta inválida de IA',
    message: 'AI service returned invalid response',
    userMessage: 'El servicio de IA devolvió una respuesta inválida. Intenta nuevamente.',
    actionable: true,
    retryable: true,
    severity: 'medium'
  },

  AI_TOKEN_LIMIT_EXCEEDED: {
    code: 'AI_TOKEN_LIMIT_EXCEEDED',
    title: 'Límite de tokens excedido',
    message: 'AI model token limit exceeded',
    userMessage: 'El texto es muy largo para el modelo de IA. Divide el contenido en partes más pequeñas.',
    actionable: true,
    retryable: false,
    severity: 'medium'
  },

  AI_CONTEXT_LENGTH_EXCEEDED: {
    code: 'AI_CONTEXT_LENGTH_EXCEEDED',
    title: 'Longitud de contexto excedida',
    message: 'AI model context length exceeded',
    userMessage: 'El texto excede la capacidad del modelo. Usa un texto más corto.',
    actionable: true,
    retryable: false,
    severity: 'medium'
  },

  // API Key & Configuration Errors
  INVALID_API_KEY: {
    code: 'INVALID_API_KEY',
    title: 'Clave API inválida',
    message: 'Invalid API key provided',
    userMessage: 'La clave API no es válida. Verifica tu configuración.',
    actionable: true,
    retryable: false,
    severity: 'high'
  },

  API_KEY_EXPIRED: {
    code: 'API_KEY_EXPIRED',
    title: 'Clave API expirada',
    message: 'API key has expired',
    userMessage: 'Tu clave API ha expirado. Actualiza tu configuración.',
    actionable: true,
    retryable: false,
    severity: 'high'
  },

  API_KEY_QUOTA_EXCEEDED: {
    code: 'API_KEY_QUOTA_EXCEEDED',
    title: 'Cuota de API excedida',
    message: 'API key quota has been exceeded',
    userMessage: 'Has excedido la cuota de tu clave API. Verifica tu plan o espera al próximo período.',
    actionable: true,
    retryable: false,
    upgradeRequired: true,
    severity: 'medium'
  },

  MISSING_API_KEY: {
    code: 'MISSING_API_KEY',
    title: 'Clave API faltante',
    message: 'No API key provided',
    userMessage: 'No se ha configurado una clave API. Configura tu clave en ajustes.',
    actionable: true,
    retryable: false,
    severity: 'high'
  },

  // Configuration Errors
  INVALID_MODEL_CONFIG: {
    code: 'INVALID_MODEL_CONFIG',
    title: 'Configuración de modelo inválida',
    message: 'Invalid AI model configuration',
    userMessage: 'La configuración del modelo de IA no es válida. Verifica tus ajustes.',
    actionable: true,
    retryable: false,
    severity: 'medium'
  },

  UNSUPPORTED_MODEL: {
    code: 'UNSUPPORTED_MODEL',
    title: 'Modelo no soportado',
    message: 'AI model is not supported',
    userMessage: 'El modelo de IA seleccionado no está soportado. Elige otro modelo.',
    actionable: true,
    retryable: false,
    severity: 'medium'
  },

  INVALID_TEMPERATURE: {
    code: 'INVALID_TEMPERATURE',
    title: 'Temperatura inválida',
    message: 'Invalid temperature parameter',
    userMessage: 'El parámetro de temperatura no es válido. Usa un valor entre 0 y 1.',
    actionable: true,
    retryable: false,
    severity: 'low'
  },

  // Generic Fallback Errors
  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    title: 'Error desconocido',
    message: 'An unknown error occurred',
    userMessage: 'Ocurrió un error inesperado. Intenta nuevamente o contacta al soporte.',
    actionable: true,
    retryable: true,
    contactSupport: true,
    severity: 'medium'
  },

  PROCESSING_ERROR: {
    code: 'PROCESSING_ERROR',
    title: 'Error de procesamiento',
    message: 'Error occurred during processing',
    userMessage: 'Error al procesar tu solicitud. Intenta nuevamente.',
    actionable: true,
    retryable: true,
    severity: 'medium'
  },

  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    title: 'Error de validación',
    message: 'Input validation failed',
    userMessage: 'Los datos proporcionados no son válidos. Verifica e intenta nuevamente.',
    actionable: true,
    retryable: false,
    severity: 'medium'
  }
};

/**
 * HTTP Status Code to Error Code Mapping
 */
export const HTTP_STATUS_TO_ERROR_CODE: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  405: 'METHOD_NOT_ALLOWED',
  409: 'CONFLICT',
  413: 'PAYLOAD_TOO_LARGE',
  429: 'TOO_MANY_REQUESTS',
  500: 'INTERNAL_SERVER_ERROR',
  502: 'BAD_GATEWAY',
  503: 'SERVICE_UNAVAILABLE',
  504: 'GATEWAY_TIMEOUT'
};

/**
 * Network Error Pattern to Error Code Mapping
 */
export const NETWORK_ERROR_PATTERNS: Array<{ pattern: RegExp; code: string }> = [
  { pattern: /network|fetch|connection/i, code: 'NETWORK_ERROR' },
  { pattern: /timeout|timed out/i, code: 'TIMEOUT_ERROR' },
  { pattern: /refused|ECONNREFUSED/i, code: 'CONNECTION_REFUSED' },
  { pattern: /dns|ENOTFOUND|getaddrinfo/i, code: 'DNS_ERROR' },
  { pattern: /abort|aborted/i, code: 'NETWORK_ERROR' },
  { pattern: /ssl|certificate|cert/i, code: 'NETWORK_ERROR' }
];

/**
 * AI Service Error Pattern to Error Code Mapping
 */
export const AI_ERROR_PATTERNS: Array<{ pattern: RegExp; code: string }> = [
  { pattern: /invalid.*api.*key|unauthorized.*key/i, code: 'INVALID_API_KEY' },
  { pattern: /api.*key.*expired/i, code: 'API_KEY_EXPIRED' },
  { pattern: /quota.*exceeded|rate.*limit/i, code: 'API_KEY_QUOTA_EXCEEDED' },
  { pattern: /model.*overloaded|capacity/i, code: 'AI_MODEL_OVERLOADED' },
  { pattern: /content.*filtered|safety/i, code: 'AI_CONTENT_FILTERED' },
  { pattern: /token.*limit|context.*length/i, code: 'AI_TOKEN_LIMIT_EXCEEDED' },
  { pattern: /model.*not.*found|unsupported.*model/i, code: 'UNSUPPORTED_MODEL' },
  { pattern: /service.*unavailable|temporarily.*unavailable/i, code: 'AI_SERVICE_UNAVAILABLE' }
];
