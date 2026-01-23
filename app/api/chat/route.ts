import { NextRequest, NextResponse } from 'next/server';
import { OpenRouterClient } from '../../lib/openrouter-client';


interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export async function POST(request: NextRequest) {
  try {
    // Build time detection - prevent Google API imports during build
    const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL && !process.env.RUNTIME;
    
    if (isBuildTime) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable during build' },
        { status: 503 }
      );
    }

    const { message, userApiKey, history } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Mensaje requerido' },
        { status: 400 }
      );
    }

    // Obtener configuración de OpenRouter
    const apiKey = process.env.OPEN_ROUTER_API_KEY || 
                   request.headers.get('x-openrouter-api-key');
    const model = request.headers.get('x-model') || 'openai/gpt-4o-mini';
    const temperature = parseFloat(request.headers.get('x-temperature') || '0.7');
    const maxTokens = parseInt(request.headers.get('x-max-tokens') || '2000');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key de OpenRouter no configurada' },
        { status: 400 }
      );
    }

    // Construir el contexto de la conversación
    let conversationContext = '';
    if (history && Array.isArray(history) && history.length > 0) {
      conversationContext = history
        .slice(-10) // Últimos 10 mensajes
        .map((msg: Message) => `${msg.isUser ? 'Usuario' : 'Asistente'}: ${msg.content}`)
        .join('\n');
    }

    // Construir el prompt completo
    const fullPrompt = `Eres un asistente de IA útil y amigable. Responde de manera clara, concisa y útil.

IMPORTANTE: NO uses placeholders genéricos como Señor/Señora:, o/a, (nombre), (apellido), Sr./Sra., Estimado/a, niño/niña o similares. NO incluyas fórmulas genéricas con barras o paréntesis. Sé específico y natural en tus respuestas.

${conversationContext ? 'Contexto de la conversación:\n' + conversationContext + '\n\n' : ''}Usuario: ${message}

Asistente:`;

    // Crear cliente de OpenRouter
    const openRouterClient = new OpenRouterClient({
      apiKey,
      model
    });

    // Llamar a la API de OpenRouter
    const result = await openRouterClient.generateContent({
      prompt: fullPrompt,
      temperature: temperature,
      maxTokens: maxTokens,
    });

    if (!result.success) {
      console.error('❌ OpenRouter API Error:', result.error);
      return NextResponse.json(
        { error: result.error?.message || 'Error al comunicarse con OpenRouter API' },
        { status: 500 }
      );
    }
    
    // Extraer la respuesta del modelo
    const aiResponse = result.content || 'Lo siento, no pude generar una respuesta.';

    return NextResponse.json({ 
      response: aiResponse.trim()
    });
  } catch (error) {
    console.error('Error en chat:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}