import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { content, language = 'es' } = await request.json();

    console.log('🔍 [improve-text-simple] Received request:', {
      contentLength: content?.length || 0,
      language,
      hasContent: !!content
    });

    if (!content || !content.trim()) {
      console.error('❌ [improve-text-simple] Missing content');
      return NextResponse.json(
        { error: 'Contenido es requerido' },
        { status: 400 }
      );
    }

    // Usar la API key del sistema directamente
    const apiKey = process.env.OPEN_ROUTER_API_KEY;
    
    if (!apiKey) {
      console.error('❌ [improve-text-simple] Missing API key');
      return NextResponse.json(
        { error: 'API key de OpenRouter no configurada en el servidor. Contacta al administrador.' },
        { status: 503 }
      );
    }

    console.log('🔧 [improve-text-simple] Using system API key');

    // Prompt simple y directo para mejoramiento
    const prompt = `Mejora el siguiente texto en español. IMPORTANTE: Solo devuelve el texto si realmente lo has mejorado. Si el texto ya está perfecto, devuelve exactamente: "NO_IMPROVEMENT_NEEDED"

Texto original:
${content}

REGLAS:
1. Si hay errores gramaticales u ortográficos, corrígelos
2. Si la fluidez puede mejorarse, hazlo
3. Si el tono puede ser más profesional, mejóralo
4. Si el texto ya está perfecto, devuelve: NO_IMPROVEMENT_NEEDED
5. NO agregues explicaciones, solo el texto mejorado o "NO_IMPROVEMENT_NEEDED"

Texto mejorado:`;

    console.log('📤 [improve-text-simple] Calling OpenRouter API...');

    // Llamada directa a OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Escritor IA'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    console.log('📊 [improve-text-simple] OpenRouter response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ [improve-text-simple] OpenRouter API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      // Errores específicos según el código de estado
      let userMessage = 'Error al comunicarse con la API de IA';
      
      if (response.status === 401) {
        userMessage = 'API key inválida o expirada';
      } else if (response.status === 429) {
        userMessage = 'Límite de uso excedido. Intenta de nuevo en unos minutos';
      } else if (response.status === 500) {
        userMessage = 'Error interno del servidor de IA';
      } else if (response.status >= 400 && response.status < 500) {
        userMessage = `Error de solicitud: ${errorData.error?.message || response.statusText}`;
      }
      
      return NextResponse.json(
        { error: userMessage },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log('📝 [improve-text-simple] API response received:', {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length || 0,
      hasContent: !!data.choices?.[0]?.message?.content
    });

    const improvedContent = data.choices?.[0]?.message?.content?.trim();

    if (!improvedContent) {
      console.error('❌ [improve-text-simple] No content in response');
      return NextResponse.json(
        { error: 'La IA no pudo generar contenido mejorado. Intenta con un texto diferente.' },
        { status: 500 }
      );
    }

    // Check if AI said no improvement needed
    if (improvedContent === "NO_IMPROVEMENT_NEEDED") {
      console.log('📝 [improve-text-simple] AI determined no improvement needed');
      return NextResponse.json(
        { error: 'El texto ya está bien escrito y no necesita mejoras.' },
        { status: 400 }
      );
    }

    // Verify the text actually changed
    const originalText = content.trim().toLowerCase();
    const improvedText = improvedContent.trim().toLowerCase();
    
    if (originalText === improvedText) {
      console.warn('⚠️ [improve-text-simple] Text unchanged despite API response');
      return NextResponse.json(
        { error: 'El texto no fue mejorado. Intenta con un texto que tenga errores más evidentes.' },
        { status: 400 }
      );
    }

    console.log('✅ [improve-text-simple] Success:', {
      originalLength: content.length,
      improvedLength: improvedContent.length,
      isDifferent: content !== improvedContent,
      changePercentage: Math.round((Math.abs(improvedContent.length - content.length) / content.length) * 100)
    });

    return NextResponse.json({
      improvedContent: improvedContent
    });

  } catch (error) {
    console.error('❌ [improve-text-simple] Unhandled error:', error);
    
    let errorMessage = 'Error interno del servidor';
    
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        errorMessage = 'Error de conexión con la API de IA';
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