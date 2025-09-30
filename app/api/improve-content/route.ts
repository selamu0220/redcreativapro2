import { NextRequest, NextResponse } from 'next/server';
import { OpenRouterClient } from '../../lib/openrouter-client';

export async function POST(request: NextRequest) {
  try {
    const { content, prompt, model: requestModel, temperature, maxTokens } = await request.json();

    if (!content || !prompt) {
      return NextResponse.json(
        { error: 'Contenido y prompt son requeridos' },
        { status: 400 }
      );
    }

    // Obtener configuración de API desde headers o usar valores por defecto
    const apiKey = request.headers.get('x-api-key') || process.env.OPEN_ROUTER_API_KEY;
    const model = request.headers.get('x-ai-model') || requestModel || 'openai/gpt-3.5-turbo';
    const temp = parseFloat(request.headers.get('x-temperature') || temperature?.toString() || '0.7');
    const maxTok = parseInt(request.headers.get('x-max-tokens') || maxTokens?.toString() || '2000');

    // Crear cliente de OpenRouter
    const openRouterClient = new OpenRouterClient({
      apiKey,
      model,
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 30000
    });

    // Construir el prompt completo
    const fullPrompt = `${prompt}\n\nIMPORTANTE: DEVUELVE ÚNICAMENTE EL TEXTO MEJORADO, SIN EXPLICACIONES, SIN COMENTARIOS, SIN ANÁLISIS, SIN INTRODUCCIONES. NO agregues frases como "Texto mejorado:", "Aquí tienes:", "Con gusto te ofrezco:", etc. NO incluyas explicaciones sobre las mejoras realizadas. SIEMPRE debes hacer mejoras al texto, nunca respondas "Ninguna mejora necesaria" o similar. Incluso si el texto está bien, mejora al menos la fluidez, claridad o estructura. NO uses placeholders genéricos como Señor/Señora:, o/a, (nombre), (apellido), Sr./Sra., Estimado/a o similares.\n\nTexto a mejorar:\n${content}\n\nTexto mejorado:`;

    // Llamar a la API de OpenRouter usando el cliente mejorado
    const result = await openRouterClient.generateContent({
      prompt: fullPrompt,
      temperature: temp,
      maxTokens: maxTok,
      topP: 0.8
    });

    if (!result.success) {
      console.error('❌ OpenRouter API Error:', result.error);
      
      // Devolver error con mensaje amigable para el usuario
      const userMessage = openRouterClient.getUserFriendlyErrorMessage(result.error!);
      
      return NextResponse.json(
        { 
          success: false,
          error: userMessage,
          errorType: result.error!.type,
          retryable: result.error!.retryable,
          suggestedRetryDelay: result.error!.retryable ? 3000 : 0,
          details: result.error!.message // Para debugging
        },
        { status: result.error!.statusCode || 500 }
      );
    }

    console.log('✅ OpenRouter API Success:', {
      model: result.metadata.model,
      responseTime: result.metadata.responseTime,
      attempt: result.metadata.attempt,
      tokensUsed: result.metadata.tokensUsed
    });

    console.log('📝 Contenido original:', content.substring(0, 100) + '...');
    console.log('✨ Contenido mejorado:', result.content!.substring(0, 100) + '...');
    console.log('🔄 ¿Es diferente?', content !== result.content);

    return NextResponse.json({
      success: true,
      improvedContent: result.content,
      metadata: {
        model: result.metadata.model,
        responseTime: result.metadata.responseTime,
        tokensUsed: result.metadata.tokensUsed
      }
    });

  } catch (error) {
    console.error('Error in improve-content API:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}