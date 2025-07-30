import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { recipient, subject, purpose, context } = await request.json();

    if (!recipient || !subject || !purpose) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    // Obtener configuración de API desde headers o usar valores por defecto
    const apiKey = request.headers.get('x-api-key') || process.env.GEMINI_API_KEY;
    const model = request.headers.get('x-model') || 'gemini-1.5-flash';
    const temperature = parseFloat(request.headers.get('x-temperature') || '0.7');
    const maxTokens = parseInt(request.headers.get('x-max-tokens') || '1000');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key no configurada' },
        { status: 400 }
      );
    }

    // Construir el prompt para generar el email
    const prompt = `Genera un email profesional con las siguientes características:

Destinatario: ${recipient}
Asunto: ${subject}
Propósito: ${purpose}
${context ? `Contexto adicional: ${context}` : ''}

Instrucciones:
1. Crea un email profesional y bien estructurado
2. Usa un tono apropiado para el propósito indicado
3. Incluye un saludo, cuerpo del mensaje y despedida
4. Mantén un estilo claro y conciso
5. Adapta el contenido al propósito específico
6. No incluyas el asunto en el cuerpo del email
7. Responde únicamente con el contenido del email, sin explicaciones adicionales
8. NO uses placeholders genéricos como Señor/Señora:, o/a, (nombre), (apellido), Sr./Sra., Estimado/a o similares
9. Usa saludos específicos y directos sin fórmulas genéricas con barras o paréntesis

Email:`;

    // Llamar a la API de Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
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
    const email = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Error al generar el email';

    return NextResponse.json({ 
      email: email.trim()
    });
  } catch (error) {
    console.error('Error en generate-email:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}