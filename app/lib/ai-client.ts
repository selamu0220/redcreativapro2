/**
 * AI Client Module - Direct API Calls to AI Providers
 * 
 * This module handles direct HTTP calls to AI providers (OpenAI, Anthropic, Google)
 * with simple error handling and timeout management.
 * 
 * Design principles:
 * - No complex abstractions
 * - Direct fetch calls
 * - 30-second timeout
 * - User-friendly error messages
 */

export interface AIClientConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'openrouter';
  model: string;
  temperature: number;
  apiKey: string;
}

export interface AIRequest {
  content: string;
  instruction?: string;
}

export interface AIResponse {
  success: boolean;
  improvedContent?: string;
  error?: {
    code: string;
    message: string;
    userMessage: string;
  };
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

/**
 * Improve content using AI
 * 
 * @param request - Content and optional instruction
 * @param config - AI provider configuration
 * @returns Promise with improved content or error
 */
export async function improveContent(
  request: AIRequest,
  config: AIClientConfig
): Promise<AIResponse> {
  // Validate input
  if (!request.content || !request.content.trim()) {
    return {
      success: false,
      error: {
        code: 'EMPTY_CONTENT',
        message: 'Content is empty',
        userMessage: 'Por favor, escribe algo de texto primero.'
      }
    };
  }

  if (!config.apiKey) {
    return {
      success: false,
      error: {
        code: 'MISSING_API_KEY',
        message: 'API key is missing',
        userMessage: 'Por favor, configura tu API key en la configuración.'
      }
    };
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds

  try {
    // Call appropriate provider
    switch (config.provider) {
      case 'openai':
        return await callOpenAI(request, config, controller.signal);
      case 'anthropic':
        return await callAnthropic(request, config, controller.signal);
      case 'google':
        return await callGoogle(request, config, controller.signal);
      case 'openrouter':
        return await callOpenRouter(request, config, controller.signal);
      default:
        return {
          success: false,
          error: {
            code: 'UNSUPPORTED_PROVIDER',
            message: `Provider ${config.provider} is not supported`,
            userMessage: 'Proveedor de IA no soportado.'
          }
        };
    }
  } catch (error) {
    // Handle timeout
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: {
          code: 'TIMEOUT',
          message: 'Request timed out after 30 seconds',
          userMessage: 'La solicitud tardó demasiado. Por favor, intenta de nuevo.'
        }
      };
    }

    // Handle other errors
    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        userMessage: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.'
      }
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Call OpenAI API
 */
async function callOpenAI(
  request: AIRequest,
  config: AIClientConfig,
  signal: AbortSignal
): Promise<AIResponse> {
  const instruction = request.instruction || 
    'Mejora el siguiente texto manteniendo su significado original. Devuelve ÚNICAMENTE el texto mejorado sin explicaciones adicionales.';

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: instruction
          },
          {
            role: 'user',
            content: request.content
          }
        ],
        temperature: config.temperature,
        max_tokens: 2000
      }),
      signal
    });

    // Handle HTTP errors
    if (!response.ok) {
      return handleHTTPError(response.status, await response.text());
    }

    // Parse response
    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return {
        success: false,
        error: {
          code: 'INVALID_RESPONSE',
          message: 'Invalid response from OpenAI',
          userMessage: 'Respuesta inválida del servicio de IA.'
        }
      };
    }

    return {
      success: true,
      improvedContent: data.choices[0].message.content.trim(),
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens
      } : undefined
    };
  } catch (error) {
    throw error; // Re-throw to be handled by main function
  }
}

/**
 * Call Anthropic API (Claude)
 * TODO: Implement in Task 12
 */
async function callAnthropic(
  request: AIRequest,
  config: AIClientConfig,
  signal: AbortSignal
): Promise<AIResponse> {
  return {
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Anthropic support not yet implemented',
      userMessage: 'Soporte para Anthropic Claude próximamente.'
    }
  };
}

/**
 * Call Google AI API (Gemini)
 * TODO: Implement in Task 12
 */
async function callGoogle(
  request: AIRequest,
  config: AIClientConfig,
  signal: AbortSignal
): Promise<AIResponse> {
  return {
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Google AI support not yet implemented',
      userMessage: 'Soporte para Google Gemini próximamente.'
    }
  };
}

/**
 * Call OpenRouter API
 */
async function callOpenRouter(
  request: AIRequest,
  config: AIClientConfig,
  signal: AbortSignal
): Promise<AIResponse> {
  // Use the same implementation as OpenAI but different URL
  const instruction = request.instruction || 
    'Mejora el siguiente texto manteniendo su significado original. Devuelve ÚNICAMENTE el texto mejorado sin explicaciones adicionales.';

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'HTTP-Referer': 'https://redcreativa.pro',
        'X-Title': 'Red Creativa Pro'
      },
      body: JSON.stringify({
        model: config.model || 'google/gemini-2.0-flash-exp:free',
        messages: [
          {
            role: 'system',
            content: instruction
          },
          {
            role: 'user',
            content: request.content
          }
        ],
        temperature: config.temperature,
        max_tokens: 2000
      }),
      signal
    });

    if (!response.ok) {
      return handleHTTPError(response.status, await response.text());
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return {
        success: false,
        error: {
          code: 'INVALID_RESPONSE',
          message: 'Invalid response from OpenRouter',
          userMessage: 'Respuesta inválida del servicio de IA.'
        }
      };
    }

    return {
      success: true,
      improvedContent: data.choices[0].message.content.trim(),
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens
      } : undefined
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Handle HTTP errors with user-friendly messages
 */
function handleHTTPError(status: number, responseText: string): AIResponse {
  switch (status) {
    case 401:
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid API key',
          userMessage: 'API key inválida. Por favor, verifica tu configuración.'
        }
      };
    
    case 429:
      return {
        success: false,
        error: {
          code: 'RATE_LIMIT',
          message: 'Rate limit exceeded',
          userMessage: 'Límite de solicitudes excedido. Por favor, espera un momento e intenta de nuevo.'
        }
      };
    
    case 500:
    case 502:
    case 503:
      return {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'AI service unavailable',
          userMessage: 'Servicio de IA temporalmente no disponible. Por favor, intenta más tarde.'
        }
      };
    
    default:
      return {
        success: false,
        error: {
          code: 'HTTP_ERROR',
          message: `HTTP ${status}: ${responseText}`,
          userMessage: `Error del servidor (${status}). Por favor, intenta de nuevo.`
        }
      };
  }
}
