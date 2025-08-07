import { NextRequest, NextResponse } from 'next/server';


interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Mensaje requerido' },
        { status: 400 }
      );
    }

    // Obtener configuración de API desde headers o usar valores por defecto
    const apiKey = request.headers.get('x-api-key') || process.env.GEMINI_API_KEY;
    const model = request.headers.get('x-model') || 'gemini-1.5-flash';
    const temperature = parseFloat(request.headers.get('x-temperature') || '0.7');
    const maxTokens = parseInt(request.headers.get('x-max-tokens') || '2000');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key no configurada' },
        { status: 400 }
      );
    }

    // Construir el contexto de la conversación
    let conversationContext = '';
    if (history && history.length > 0) {
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

    // Llamar a la API de Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: temperature,
          maxOutputTokens: maxTokens,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error?.message || 'Error al comunicarse con Gemini API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extraer la respuesta del modelo
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Lo siento, no pude generar una respuesta.';

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