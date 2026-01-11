/**
 * AI Client Module - Secure API Calls via Backend Proxy
 * 
 * This module handles AI requests by routing them through the internal API
 * to ensure security (no exposed API keys) and consistency.
 * 
 * Features:
 * - Request Queueing & Rate Limiting
 * - Caching (via Cache-Control or in-memory)
 * - Error handling
 */

"use client";

import { globalRequestQueue } from './request-queue';

export interface AIClientConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'openrouter' | 'huggingface' | 'replicate';
  model: string;
  temperature: number;
  apiKey?: string; // Optional: user might provide their own key, otherwise use server's
}

export interface AIRequest {
  content: string;
  instruction?: string;
  language?: string;
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

// Simple in-memory cache for repeated requests
const responseCache = new Map<string, AIResponse>();

/**
 * Improve content using AI via internal API
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

  // Check cache
  const cacheKey = `${request.content}-${request.instruction}-${config.model}-${config.temperature}`;
  if (responseCache.has(cacheKey)) {
    console.log('[AI Client] Returning cached response');
    return responseCache.get(cacheKey)!;
  }

  // Define the execution logic
  const executeRequest = async (): Promise<AIResponse> => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'x-model': config.model,
        'x-temperature': config.temperature.toString(),
      };

      if (config.apiKey) {
        headers['x-openrouter-api-key'] = config.apiKey;
      }

      const response = await fetch('/api/improve-text-openrouter', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: request.content,
          model: config.model, // Explicitly pass model in body too
          language: request.language || 'es'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.code || 'API_ERROR',
            message: data.error || 'Unknown error',
            userMessage: data.error || 'Error al procesar la solicitud.'
          }
        };
      }

      // The API returns { improvedContent: "..." } based on route.ts
      const improvedContent = data.improvedContent || data.text || data.content || data.improvedText;

      if (!improvedContent) {
        // Fallback if the API returns just the string (unlikely for NextResponse.json)
        // or if the structure is different.
        console.warn('[AI Client] Unexpected response format:', data);
        return {
          success: false,
          error: {
            code: 'INVALID_RESPONSE',
            message: 'Invalid response format from API',
            userMessage: 'Respuesta inválida del servidor.'
          }
        };
      }

      const result: AIResponse = {
        success: true,
        improvedContent: improvedContent,
        usage: data.usage
      };

      // Cache successful response
      responseCache.set(cacheKey, result);

      // Limit cache size
      if (responseCache.size > 50) {
        const firstKey = responseCache.keys().next().value;
        if (firstKey) responseCache.delete(firstKey);
      }

      return result;

    } catch (error) {
      console.error('[AI Client] Network error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
          userMessage: 'Error de conexión. Por favor intenta de nuevo.'
        }
      };
    }
  };

  // Add to queue with high priority if manual (implied by calling this function usually), 
  // but we can expose priority param later. For now default 0.
  return globalRequestQueue.add(executeRequest);
}
