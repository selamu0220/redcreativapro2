export interface GeminiClientConfig {
  apiKey: string;
  model: string;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
}

export interface GeminiResponse {
  success: boolean;
  content?: string;
  error?: GeminiError;
  metadata: {
    model: string;
    tokensUsed?: number;
    responseTime: number;
    attempt: number;
  };
}

export interface GeminiError {
  type: 'AUTHENTICATION' | 'QUOTA_EXCEEDED' | 'NETWORK' | 'INVALID_REQUEST' | 'SERVER_ERROR' | 'TIMEOUT' | 'UNKNOWN';
  message: string;
  statusCode?: number;
  retryable: boolean;
  originalError?: any;
}

export interface GeminiRequest {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

export class GeminiClient {
  private config: GeminiClientConfig;

  constructor(config: Partial<GeminiClientConfig> = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.GEMINI_API_KEY || '',
      model: config.model || 'gemini-1.5-flash',
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      timeout: config.timeout || 30000,
    };
  }

  async generateContent(request: GeminiRequest): Promise<GeminiResponse> {
    const startTime = Date.now();
    let lastError: GeminiError | null = null;

    // Validar API key
    if (!this.config.apiKey || this.isPlaceholderApiKey(this.config.apiKey)) {
      return {
        success: false,
        error: {
          type: 'AUTHENTICATION',
          message: 'API key de Gemini no configurada. Por favor, obtén una API key válida de Google AI Studio (https://aistudio.google.com/app/apikey) y configúrala en tu archivo .env.local',
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
        console.log(`🚀 Gemini API attempt ${attempt}/${this.config.maxRetries} - Model: ${this.config.model}`);
        
        const response = await this.makeApiCall(request, attempt);
        
        if (response.success) {
          console.log(`✅ Gemini API success on attempt ${attempt}`);
          return response;
        }

        lastError = response.error!;
        
        // Si el error no es reintentable, salir inmediatamente
        if (!lastError.retryable) {
          console.log(`❌ Non-retryable error: ${lastError.type}`);
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

  private async makeApiCall(request: GeminiRequest, attempt: number): Promise<GeminiResponse> {
    const startTime = Date.now();
    
    const payload = {
      contents: [{
        parts: [{
          text: request.prompt
        }]
      }],
      generationConfig: {
        temperature: request.temperature || 0.7,
        maxOutputTokens: request.maxTokens || 2000,
        topP: request.topP || 0.8,
        topK: request.topK || 40
      }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        }
      );

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
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!content.trim()) {
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
          tokensUsed: data.usageMetadata?.totalTokenCount,
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

  private async handleApiError(response: Response, responseTime: number, attempt: number): Promise<GeminiError> {
    let errorData: any = {};
    
    try {
      errorData = await response.json();
    } catch (e) {
      console.warn('Could not parse error response as JSON');
    }

    const status = response.status;
    const errorMessage = errorData.error?.message || response.statusText || 'Error desconocido';

    console.error(`❌ Gemini API Error (${status}):`, errorData);

    // Clasificar el error
    switch (status) {
      case 400:
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
          message: `Error del servidor de Gemini (${status}). Intenta de nuevo en unos momentos.`,
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
    if (originalMessage.toLowerCase().includes('api key not valid')) {
      return 'API key inválida. Por favor:\n1. Ve a https://aistudio.google.com/app/apikey\n2. Crea una nueva API key\n3. Ve a Ajustes y configura tu API key personal';
    }
    
    if (originalMessage.toLowerCase().includes('api key not found')) {
      return 'API key no encontrada. Ve a Ajustes y configura tu API key personal de Gemini';
    }

    return `Error de autenticación: ${originalMessage}`;
  }

  private calculateRetryDelay(attempt: number, errorType: GeminiError['type']): number {
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
  public getUserFriendlyErrorMessage(error: GeminiError): string {
    switch (error.type) {
      case 'AUTHENTICATION':
        return 'Problema con la configuración de la API. Por favor, verifica tu API key de Gemini.';
      
      case 'QUOTA_EXCEEDED':
        return 'Has alcanzado el límite de uso de la API. Intenta de nuevo en unos minutos.';
      
      case 'NETWORK':
        return 'Problema de conexión. Verifica tu internet e intenta de nuevo.';
      
      case 'TIMEOUT':
        return 'La solicitud tardó demasiado. Intenta de nuevo.';
      
      case 'SERVER_ERROR':
        return 'Los servicios de IA están temporalmente no disponibles. Intenta de nuevo en unos momentos.';
      
      case 'INVALID_REQUEST':
        return 'Hay un problema con tu solicitud. Intenta reformular tu texto.';
      
      default:
        return 'Error temporal. Por favor, intenta de nuevo.';
    }
  }
}