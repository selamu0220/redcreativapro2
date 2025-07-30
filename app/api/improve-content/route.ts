import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { content, prompt, model: requestModel } = await request.json();

    if (!content || !prompt) {
      return NextResponse.json(
        { error: 'Contenido y prompt son requeridos' },
        { status: 400 }
      );
    }

    // Obtener configuración de API desde headers o usar valores por defecto
    const apiKey = request.headers.get('x-api-key') || process.env.GEMINI_API_KEY;
    const model = request.headers.get('x-ai-model') || requestModel || 'gemini-1.5-flash';
    const temperature = parseFloat(request.headers.get('x-temperature') || '0.7');
    const maxTokens = parseInt(request.headers.get('x-max-tokens') || '2000');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key no configurada' },
        { status: 500 }
      );
    }

    // Construir el prompt completo
    const fullPrompt = `${prompt}\n\nIMPORTANTE: SIEMPRE debes hacer mejoras al texto, nunca respondas "Ninguna mejora necesaria" o similar. Incluso si el texto está bien, mejora al menos la fluidez, claridad o estructura. NO uses placeholders genéricos como Señor/Señora:, o/a, (nombre), (apellido), Sr./Sra., Estimado/a o similares.\n\nTexto a mejorar:\n${content}\n\nTexto mejorado:`;

    // Preparar el payload para Gemini
    const payload = {
      contents: [{
        parts: [{
          text: fullPrompt
        }]
      }],
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: maxTokens,
        topP: 0.8,
        topK: 40
      }
    };

    // Llamar a la API de Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {
        console.warn('No se pudo parsear respuesta de error');
      }
      
      console.error('Gemini API Error:', errorData);
      
      // Detectar diferentes tipos de errores
      let errorMessage = 'Error al comunicarse con Gemini API';
      let isOverloaded = false;
      
      if (response.status === 429) {
        errorMessage = 'El modelo está sobrecargado. Intenta de nuevo en unos momentos.';
        isOverloaded = true;
      } else if (response.status === 503) {
        errorMessage = 'El servicio está temporalmente no disponible. Intenta con otro modelo.';
        isOverloaded = true;
      } else if (errorData.error?.message) {
        if (errorData.error.message.includes('overloaded') || 
            errorData.error.message.includes('quota') ||
            errorData.error.message.includes('rate limit')) {
          errorMessage = 'El modelo está sobrecargado. Intenta de nuevo en unos momentos.';
          isOverloaded = true;
        } else {
          errorMessage = errorData.error.message;
        }
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          isOverloaded,
          suggestedRetryDelay: isOverloaded ? 5000 : 0
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('🔍 Respuesta de Gemini API:', JSON.stringify(data, null, 2));
    
    // Extraer la respuesta del modelo
    const improvedContent = data.candidates?.[0]?.content?.parts?.[0]?.text || content;
    console.log('📝 Contenido original:', content.substring(0, 100) + '...');
    console.log('✨ Contenido mejorado:', improvedContent.substring(0, 100) + '...');
    console.log('🔄 ¿Es diferente?', content !== improvedContent);

    return NextResponse.json({
      improvedContent: improvedContent.trim()
    });

  } catch (error) {
    console.error('Error in improve-content API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}