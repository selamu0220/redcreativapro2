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

    const { message, userApiKey, history, documentContent } = await request.json();

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
    const maxTokens = parseInt(request.headers.get('x-max-tokens') || '4000'); // Increased for full doc rewrites

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
    const fullPrompt = `Eres un "Editor IA" avanzado integrado en un procesador de texto.
Tu objetivo es ayudar al usuario a escribir, editar y mejorar su documento.

CAPACIDADES:
1. Tienes acceso de LECTURA al documento actual del usuario.
2. Tienes capacidad de ESCRITURA/EDICIÓN.

PROTOCOLO DE EDICIÓN (IMPORTANTE):
Si el usuario te pide cambiar, reescribir, traducir, resumir o añadir texto al documento:
1. Genera la NUEVA versión completa del documento (o la sección relevante si es muy largo, pero prefiere el texto completo).
2. Envuelve el contenido del documento dentro de etiquetas :::UPDATE_DOCUMENT:::
   Ejemplo:
   :::UPDATE_DOCUMENT:::
   El nuevo contenido del documento...
   :::UPDATE_DOCUMENT:::

NO preguntes "dime dónde pegarlo". HAZLO.
Si el usuario solo hace una pregunta, responde normalmente sin las etiquetas.

IMPORTANTE: NO uses placeholders genéricos como Señor/Señora:, o/a, (nombre), (apellido), Sr./Sra., Estimado/a, niño/niña o similares. Sé específico y natural.

${documentContent ? `--- DOCUMENTO ACTUAL ---\n${documentContent}\n--- FIN DOCUMENTO ---\n` : ''}
${conversationContext ? '--- HISTORIAL ---\n' + conversationContext + '\n' : ''}

Usuario: ${message}

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