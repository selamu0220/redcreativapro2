import { NextRequest, NextResponse } from 'next/server';
import { OpenRouterClient } from '@/app/lib/openrouter-client';

export async function POST(request: NextRequest) {
  try {
    const { apiKey, model } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key es requerida' },
        { status: 400 }
      );
    }

    if (!model) {
      return NextResponse.json(
        { error: 'Modelo es requerido' },
        { status: 400 }
      );
    }

    // Crear cliente OpenRouter con la API key y modelo proporcionados
    const client = new OpenRouterClient({ apiKey, model });

    // Hacer una prueba simple
    const testPrompt = 'Responde solo con "OK" si puedes leer este mensaje.';
    
    const response = await client.generateContent({
      prompt: testPrompt,
      maxTokens: 10
    });

    if (response.success && response.content) {
      return NextResponse.json({
        success: true,
        message: 'Conexión exitosa con OpenRouter',
        model: model,
        response: response.content
      });
    } else {
      return NextResponse.json(
        { error: response.error?.message || 'Respuesta inválida del modelo' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error testing OpenRouter API:', error);
    
    // Manejar diferentes tipos de errores
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'API key inválida o sin permisos' },
        { status: 401 }
      );
    }
    
    if (error.message?.includes('429') || error.message?.includes('rate limit')) {
      return NextResponse.json(
        { error: 'Límite de velocidad excedido. Intenta más tarde.' },
        { status: 429 }
      );
    }
    
    if (error.message?.includes('model')) {
      return NextResponse.json(
        { error: 'Modelo no disponible o no soportado' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: `Error de conexión: ${error.message || 'Error desconocido'}` },
      { status: 500 }
    );
  }
}
