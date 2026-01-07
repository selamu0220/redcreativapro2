import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { content, language = 'es' } = await request.json();

    console.log('🔍 [improve-text-gemini] Received request:', {
      contentLength: content?.length || 0,
      language,
      hasContent: !!content
    });

    if (!content || !content.trim()) {
      console.error('❌ [improve-text-gemini] Missing content');
      return NextResponse.json(
        { error: 'Contenido es requerido' },
        { status: 400 }
      );
    }

    // Usar la API key de Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ [improve-text-gemini] Missing API key');
      return NextResponse.json(
        { error: 'API key de Gemini no configurada en el servidor. Contacta al administrador.' },
        { status: 503 }
      );
    }

    console.log('🔧 [improve-text-gemini] Using Gemini API key');

    // Prompt específico para Gemini
    const prompt = `Mejora el siguiente texto en español. IMPORTANTE: 

REGLAS ESTRICTAS:
1. Si el texto tiene errores gramaticales u ortográficos, corrígelos
2. Si la fluidez puede mejorarse, hazlo
3. Si el tono puede ser más profesional, mejóralo
4. Si el texto ya está perfecto, devuelve exactamente: "NO_IMPROVEMENT_NEEDED"
5. NO agregues explicaciones, solo el texto mejorado o "NO_IMPROVEMENT_NEEDED"
6. SIEMPRE devuelve algo, nunca una respuesta vacía

Texto original:
${content}

Texto mejorado:`;

    console.log('📤 [improve-text-gemini] Calling Gemini API...');

    // Llamada directa a Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
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
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4000,
        }
      })
    });

    console.log('📊 [improve-text-gemini] Gemini response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ [improve-text-gemini] Gemini API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      // Errores específicos según el código de estado
      let userMessage = 'Error al comunicarse con la API de Gemini';
      
      if (response.status === 401) {
        userMessage = 'API key de Gemini inválida o expirada';
      } else if (response.status === 429) {
        userMessage = 'Límite de uso de Gemini excedido. Intenta de nuevo en unos minutos';
      } else if (response.status === 500) {
        userMessage = 'Error interno del servidor de Gemini';
      } else if (response.status >= 400 && response.status < 500) {
        userMessage = `Error de solicitud Gemini: ${errorData.error?.message || response.statusText}`;
      }
      
      return NextResponse.json(
        { error: userMessage },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log('📝 [improve-text-gemini] API response received:', {
      hasCandidates: !!data.candidates,
      candidatesLength: data.candidates?.length || 0,
      hasContent: !!data.candidates?.[0]?.content?.parts?.[0]?.text
    });

    const improvedContent = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!improvedContent) {
      console.error('❌ [improve-text-gemini] No content in response');
      return NextResponse.json(
        { error: 'Gemini no pudo generar contenido mejorado. Intenta con un texto diferente.' },
        { status: 500 }
      );
    }

    // Check if AI said no improvement needed
    if (improvedContent === "NO_IMPROVEMENT_NEEDED") {
      console.log('📝 [improve-text-gemini] Gemini determined no improvement needed');
      return NextResponse.json(
        { error: 'El texto ya está bien escrito y no necesita mejoras.' },
        { status: 400 }
      );
    }

    // Verify the text actually changed
    const originalText = content.trim().toLowerCase();
    const improvedText = improvedContent.trim().toLowerCase();
    
    if (originalText === improvedText) {
      console.warn('⚠️ [improve-text-gemini] Text unchanged despite API response');
      return NextResponse.json(
        { error: 'El texto no fue mejorado. Intenta con un texto que tenga errores más evidentes.' },
        { status: 400 }
      );
    }

    console.log('✅ [improve-text-gemini] Success:', {
      originalLength: content.length,
      improvedLength: improvedContent.length,
      isDifferent: content !== improvedContent,
      changePercentage: Math.round((Math.abs(improvedContent.length - content.length) / content.length) * 100)
    });

    return NextResponse.json({
      improvedContent: improvedContent
    });

  } catch (error) {
    console.error('❌ [improve-text-gemini] Unhandled error:', error);
    
    let errorMessage = 'Error interno del servidor';
    
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        errorMessage = 'Error de conexión con la API de Gemini';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Tiempo de espera agotado. Intenta de nuevo';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}