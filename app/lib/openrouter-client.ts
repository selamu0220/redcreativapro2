export interface OpenRouterClientConfig {
  apiKey: string;
  model: string;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
}

export interface OpenRouterResponse {
  success: boolean;
  content?: string;
  error?: OpenRouterError;
  metadata: {
    model: string;
    tokensUsed?: number;
    responseTime: number;
    attempt: number;
  };
}

export interface OpenRouterError {
  type: 'AUTHENTICATION' | 'QUOTA_EXCEEDED' | 'NETWORK' | 'INVALID_REQUEST' | 'SERVER_ERROR' | 'TIMEOUT' | 'UNKNOWN';
  message: string;
  statusCode?: number;
  retryable: boolean;
  originalError?: any;
}

export interface OpenRouterRequest {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export class OpenRouterClient {
  private config: OpenRouterClientConfig;

  constructor(config: Partial<OpenRouterClientConfig> = {}) {
    console.log('🔧 [DEBUG] OpenRouterClient constructor - config.apiKey:', config.apiKey);
    console.log('🔧 [DEBUG] OpenRouterClient constructor - process.env.OPEN_ROUTER_API_KEY:', process.env.OPEN_ROUTER_API_KEY);
    
    // Lógica de fallback: usar API del usuario si está configurada, sino usar la del sistema
    const userApiKey = config.apiKey;
    const systemApiKey = process.env.OPEN_ROUTER_API_KEY;
    
    let finalApiKey = '';
    let usingSystemKey = false;
    
    // Si el usuario proporcionó una API key válida, usarla
    if (userApiKey && !this.isPlaceholderApiKey(userApiKey)) {
      finalApiKey = userApiKey;
      console.log('🔑 [OpenRouter] Usando API key del usuario');
    }
    // Si no, usar la API key del sistema como fallback
    else if (systemApiKey && !this.isPlaceholderApiKey(systemApiKey)) {
      finalApiKey = systemApiKey;
      usingSystemKey = true;
      console.log('🔑 [OpenRouter] Usando API key del sistema (fallback)');
    }
    
    this.config = {
      apiKey: finalApiKey,
      model: config.model || 'openai/gpt-4o-mini',
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      timeout: config.timeout || 30000
    };
    
    // Agregar metadata sobre qué API key se está usando
    (this.config as any).usingSystemKey = usingSystemKey;
    
    console.log('🔧 [DEBUG] OpenRouterClient constructor - final apiKey:', this.config.apiKey ? 'Configurada' : 'No configurada');
    console.log('🔧 [DEBUG] OpenRouterClient constructor - usingSystemKey:', usingSystemKey);
    console.log('🔧 [DEBUG] OpenRouterClient constructor - isPlaceholderApiKey:', this.isPlaceholderApiKey(this.config.apiKey));
  }

  async generateContent(request: OpenRouterRequest): Promise<OpenRouterResponse> {
    console.log('🚀 [OpenRouterClient] Iniciando generación de contenido...');
    console.log('📝 [OpenRouterClient] Prompt:', request.prompt.substring(0, 100) + '...');
    console.log('⚙️ [OpenRouterClient] Configuración:', {
      model: this.config.model,
      temperature: request.temperature || 0.7,
      maxTokens: request.maxTokens || 8000
    });
    
    const startTime = Date.now();
    let lastError: OpenRouterError | null = null;

    // Validar API key
    console.log('🔧 [DEBUG] generateContent - Validating API key:', this.config.apiKey);
    console.log('🔧 [DEBUG] generateContent - API key exists:', !!this.config.apiKey);
    console.log('🔧 [DEBUG] generateContent - isPlaceholderApiKey:', this.isPlaceholderApiKey(this.config.apiKey));
    
    if (!this.config.apiKey || this.isPlaceholderApiKey(this.config.apiKey)) {
      console.error('❌ [OpenRouterClient] API key no válida o es un placeholder');
      return {
        success: false,
        error: {
          type: 'AUTHENTICATION',
          message: 'API key de OpenRouter no configurada o inválida. Ve a Ajustes para configurar tu API key personal.',
          retryable: false
        },
        metadata: {
          model: this.config.model,
          responseTime: Date.now() - startTime,
          attempt: 0
        }
      };
    }

    // Validar request
    if (!request.prompt?.trim()) {
      return {
        success: false,
        error: {
          type: 'INVALID_REQUEST',
          message: 'El prompt no puede estar vacío',
          retryable: false
        },
        metadata: {
          model: this.config.model,
          responseTime: Date.now() - startTime,
          attempt: 0
        }
      };
    }

    // Intentar la llamada con reintentos
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        console.log(`🚀 OpenRouter API attempt ${attempt}/${this.config.maxRetries} - Model: ${this.config.model}`);
        
        const response = await this.makeApiCall(request, attempt);
        
        if (response.success) {
          console.log('✅ [OpenRouterClient] Contenido generado exitosamente');
          console.log('📊 [OpenRouterClient] Metadata:', response.metadata);
          return response;
        }

        console.warn(`⚠️ [OpenRouterClient] Intento ${attempt} falló:`, response.error?.message);
        
        lastError = response.error!;
        
        // Si el error no es reintentable, salir inmediatamente
        if (!lastError.retryable) {
          console.error(`❌ [OpenRouterClient] Falló después de ${attempt} intentos`);
          break;
        }

        // Esperar antes del siguiente intento (exponential backoff)
        if (attempt < this.config.maxRetries) {
          const delay = this.calculateRetryDelay(attempt, lastError.type);
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await this.sleep(delay);
        }

      } catch (error) {
        console.error(`🔥 Unexpected error on attempt ${attempt}:`, error);
        lastError = {
          type: 'UNKNOWN',
          message: error instanceof Error ? error.message : 'Error desconocido',
          retryable: attempt < this.config.maxRetries,
          originalError: error
        };
      }
    }

    // Si llegamos aquí, todos los intentos fallaron
    return {
      success: false,
      error: lastError || {
        type: 'UNKNOWN',
        message: 'Todos los intentos fallaron',
        retryable: false
      },
      metadata: {
        model: this.config.model,
        responseTime: Date.now() - startTime,
        attempt: this.config.maxRetries
      }
    };
  }

  private async makeApiCall(request: OpenRouterRequest, attempt: number): Promise<OpenRouterResponse> {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      console.log(`🌐 [OpenRouterClient] Realizando llamada a la API (intento ${attempt})...`);
      
      // Construir el payload para OpenRouter
      const payload = {
        model: this.config.model,
        messages: [{
          role: 'user',
          content: request.prompt
        }],
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 8000,
        top_p: request.topP || 0.8
      };

      console.log('📤 [OpenRouterClient] Payload:', JSON.stringify(payload, null, 2));

      const url = 'https://openrouter.ai/api/v1/chat/completions';
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'HTTP-Referer': 'https://redcreativapro.com',
          'X-Title': 'Red Creativa Pro'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      console.log(`📥 [OpenRouterClient] Respuesta recibida - Status: ${response.status}`);
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        const error = await this.handleApiError(response, responseTime, attempt);
        return {
          success: false,
          error,
          metadata: {
            model: this.config.model,
            responseTime,
            attempt
          }
        };
      }

      const data = await response.json();
      console.log('📋 [OpenRouterClient] Datos de respuesta:', JSON.stringify(data, null, 2));
      
      // Debug logging para entender la estructura de respuesta
      console.log('🔍 [DEBUG] OpenRouter API Response Structure:', JSON.stringify(data, null, 2));
      console.log('🔍 [DEBUG] Choices:', data.choices);
      console.log('🔍 [DEBUG] First choice:', data.choices?.[0]);
      console.log('🔍 [DEBUG] Message:', data.choices?.[0]?.message);
      console.log('🔍 [DEBUG] Content:', data.choices?.[0]?.message?.content);
      
      // Verificar si hay choices
      if (!data.choices || data.choices.length === 0) {
        console.log('❌ [DEBUG] No choices found in response');
        return {
          success: false,
          error: {
            type: 'INVALID_REQUEST',
            message: 'La API no devolvió opciones de respuesta. Intenta reformular tu solicitud.',
            retryable: true
          },
          metadata: {
            model: this.config.model,
            responseTime,
            attempt
          }
        };
      }

      const choice = data.choices[0];
      const finishReason = choice.finish_reason;
      
      // Manejar diferentes razones de finalización
      if (finishReason === 'length') {
        console.log('⚠️ [DEBUG] Response was truncated due to length limit');
        return {
          success: false,
          error: {
            type: 'INVALID_REQUEST',
            message: 'La respuesta fue truncada por límite de tokens. Intenta con un prompt más corto o específico.',
            retryable: true
          },
          metadata: {
            model: this.config.model,
            responseTime,
            attempt
          }
        };
      }
      
      if (finishReason === 'content_filter') {
        console.log('⚠️ [DEBUG] Response blocked by content filters');
        return {
          success: false,
          error: {
            type: 'INVALID_REQUEST',
            message: 'El contenido fue bloqueado por filtros de seguridad. Intenta reformular tu solicitud.',
            retryable: true
          },
          metadata: {
            model: this.config.model,
            responseTime,
            attempt
          }
        };
      }
      
      // Intentar extraer contenido de diferentes ubicaciones posibles
      let content = '';
      
      // Estructura estándar OpenRouter: choices[0].message.content
      if (choice.message?.content) {
        content = choice.message.content;
        console.log('✅ [DEBUG] Content found in standard OpenRouter location');
      }
      // Estructura alternativa: choices[0].text (directo)
      else if (choice.text) {
        content = choice.text;
        console.log('✅ [DEBUG] Content found in choices[0].text');
      }
      // Buscar en otras ubicaciones posibles
      else if (data.text) {
        content = data.text;
        console.log('✅ [DEBUG] Content found in data.text');
      }
      else if (data.content) {
        content = data.content;
        console.log('✅ [DEBUG] Content found in data.content');
      }
      
      console.log('🔍 [DEBUG] Extracted content:', content);
      console.log('🔍 [DEBUG] Content length:', content.length);
      
      if (!content.trim()) {
        console.log('❌ [DEBUG] No content found in any expected location');
        console.log('🔍 [DEBUG] Full response for debugging:', data);
        return {
          success: false,
          error: {
            type: 'INVALID_REQUEST',
            message: 'La API devolvió una respuesta vacía. Intenta reformular tu solicitud.',
            retryable: true
          },
          metadata: {
            model: this.config.model,
            responseTime,
            attempt
          }
        };
      }

      return {
        success: true,
        content: content.trim(),
        metadata: {
          model: this.config.model,
          tokensUsed: data.usage?.total_tokens,
          responseTime,
          attempt
        }
      };

    } catch (error) {
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: {
            type: 'TIMEOUT',
            message: `La solicitud tardó más de ${this.config.timeout}ms en responder`,
            retryable: true,
            originalError: error
          },
          metadata: {
            model: this.config.model,
            responseTime,
            attempt
          }
        };
      }

      return {
        success: false,
        error: {
          type: 'NETWORK',
          message: error instanceof Error ? error.message : 'Error de red desconocido',
          retryable: true,
          originalError: error
        },
        metadata: {
          model: this.config.model,
          responseTime,
          attempt
        }
      };
    }
  }

  private async handleApiError(response: Response, responseTime: number, attempt: number): Promise<OpenRouterError> {
    let errorData: any = {};
    
    try {
      errorData = await response.json();
    } catch (e) {
      console.warn('Could not parse error response as JSON');
    }

    const status = response.status;
    const errorMessage = errorData.error?.message || response.statusText || 'Error desconocido';

    console.error(`❌ OpenRouter API Error (${status}):`, errorData);

    // Clasificar el error
    switch (status) {
      case 400:
        // Verificar si es un error de cuota agotada
        if (errorMessage.toLowerCase().includes('quota exceeded') || 
            errorMessage.toLowerCase().includes('insufficient credits') ||
            errorData.error?.type === 'insufficient_quota') {
          return {
            type: 'QUOTA_EXCEEDED',
            message: 'Has agotado tu cuota de OpenRouter. Necesitas agregar créditos a tu cuenta o esperar a que se renueve tu cuota.',
            statusCode: status,
            retryable: true,
            originalError: errorData
          };
        }
        
        return {
          type: 'INVALID_REQUEST',
          message: `Solicitud inválida: ${errorMessage}`,
          statusCode: status,
          retryable: false,
          originalError: errorData
        };

      case 401:
      case 403:
        return {
          type: 'AUTHENTICATION',
          message: this.getAuthErrorMessage(errorMessage),
          statusCode: status,
          retryable: false,
          originalError: errorData
        };

      case 429:
        return {
          type: 'QUOTA_EXCEEDED',
          message: 'Límite de uso excedido. Intenta de nuevo en unos momentos.',
          statusCode: status,
          retryable: true,
          originalError: errorData
        };

      case 500:
      case 502:
      case 503:
      case 504:
        return {
          type: 'SERVER_ERROR',
          message: `Error del servidor de OpenRouter (${status}). Intenta de nuevo en unos momentos.`,
          statusCode: status,
          retryable: true,
          originalError: errorData
        };

      default:
        return {
          type: 'UNKNOWN',
          message: `Error HTTP ${status}: ${errorMessage}`,
          statusCode: status,
          retryable: status >= 500,
          originalError: errorData
        };
    }
  }

  private getAuthErrorMessage(originalMessage: string): string {
    if (originalMessage.toLowerCase().includes('api key not valid') || originalMessage.toLowerCase().includes('invalid api key')) {
      return 'API key inválida. Por favor:\n1. Ve a https://openrouter.ai/keys\n2. Crea una nueva API key\n3. Ve a Ajustes y configura tu API key personal';
    }
    
    if (originalMessage.toLowerCase().includes('api key not found') || originalMessage.toLowerCase().includes('unauthorized')) {
      return 'API key no encontrada. Ve a Ajustes y configura tu API key personal de OpenRouter';
    }

    return `Error de autenticación: ${originalMessage}`;
  }

  private calculateRetryDelay(attempt: number, errorType: OpenRouterError['type']): number {
    const baseDelay = this.config.retryDelay;
    
    switch (errorType) {
      case 'QUOTA_EXCEEDED':
        // Para errores de cuota, esperar más tiempo
        return Math.min(baseDelay * Math.pow(2, attempt) + Math.random() * 1000, 60000);
      
      case 'SERVER_ERROR':
        // Para errores del servidor, backoff exponencial moderado
        return Math.min(baseDelay * Math.pow(1.5, attempt) + Math.random() * 500, 30000);
      
      case 'NETWORK':
      case 'TIMEOUT':
        // Para errores de red, backoff más rápido
        return Math.min(baseDelay * attempt + Math.random() * 200, 10000);
      
      default:
        return baseDelay;
    }
  }

  private isPlaceholderApiKey(apiKey: string): boolean {
    const placeholders = [
      'your_gemini_api_key_here',
      'tu-gemini-api-key',
      'TU_API_KEY_REAL_AQUI',
      'your-api-key-here',
      'replace-with-your-key'
    ];
    
    return placeholders.includes(apiKey) || apiKey.length < 10;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Método para obtener un mensaje de error amigable para el usuario
  public getUserFriendlyErrorMessage(error: OpenRouterError): string {
    const usingSystemKey = (this.config as any).usingSystemKey;
    
    switch (error.type) {
      case 'AUTHENTICATION':
        if (usingSystemKey) {
          return 'Servicio de IA temporalmente no disponible. Puedes configurar tu propia API key de OpenRouter en Ajustes para tener acceso ilimitado.';
        }
        return 'Problema con tu API key de OpenRouter. Verifica tu configuración en Ajustes o deja el campo vacío para usar el servicio gratuito.';
      
      case 'QUOTA_EXCEEDED':
        if (usingSystemKey) {
          return 'El servicio gratuito de IA ha alcanzado su límite temporal. Para acceso ilimitado:\n\n1. Ve a https://openrouter.ai/keys\n2. Crea tu cuenta gratuita\n3. Configura tu API key en Ajustes\n\nO intenta de nuevo más tarde.';
        }
        return 'Has agotado tu cuota de OpenRouter. Para continuar:\n\n1. Ve a https://openrouter.ai/keys\n2. Agrega créditos a tu cuenta\n3. Verifica tu API key en Ajustes';
      
      case 'NETWORK':
        return 'Problema de conexión. Verifica tu internet e intenta de nuevo.';
      
      case 'TIMEOUT':
        return 'La solicitud tardó demasiado. Intenta de nuevo.';
      
      case 'SERVER_ERROR':
        return 'Los servicios de IA están temporalmente no disponibles. Intenta de nuevo en unos momentos.';
      
      case 'INVALID_REQUEST':
        return 'Hay un problema con tu solicitud. Intenta reformular tu texto.';
      
      default:
        console.log('🔍 [DEBUG] getUserFriendlyErrorMessage - Using default message for unknown error type:', error.type)
        return `Error temporal (${error.type}). Por favor, intenta de nuevo. Detalles: ${error.message}`;
    }
  }
}
