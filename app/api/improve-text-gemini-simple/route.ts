import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    console.log('🔍 [improve-text-gemini-simple] Received:', {
      contentLength: content?.length || 0,
      hasContent: !!content
    });

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Contenido es requerido' },
        { status: 400 }
      );
    }

    // Check minimum word count
    const wordCount = content.trim().split(/\s+/).length;
    if (wordCount < 5) {
      return NextResponse.json(
        { error: `Contenido muy corto (${wordCount} palabras, mínimo 5 requeridas)` },
        { status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('🔑 [improve-text-gemini-simple] API Key found:', !!apiKey);
    console.log('🔑 [improve-text-gemini-simple] API Key length:', apiKey?.length || 0);
    console.log('🔑 [improve-text-gemini-simple] API Key starts with:', apiKey?.substring(0, 10) || 'N/A');
    
    if (!apiKey) {
      console.error('❌ [improve-text-gemini-simple] No GEMINI_API_KEY found');
      return NextResponse.json(
        { error: 'API key no configurada' },
        { status: 500 }
      );
    }

    console.log('🔧 [improve-text-gemini-simple] Using Gemini API');
    console.log('📝 [improve-text-gemini-simple] Original text:', content);

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Mejora este texto corrigiendo gramática, ortografía y fluidez. Mantén el idioma original y el tono. Solo devuelve el texto mejorado, sin explicaciones:

${content}`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ [improve-text-gemini-simple] Gemini API error:', errorData);
      return NextResponse.json(
        { error: 'Error en la API de Gemini' },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log('📡 [improve-text-gemini-simple] Gemini response:', data);

    const improvedContent = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!improvedContent) {
      console.error('❌ [improve-text-gemini-simple] No content in response');
      return NextResponse.json(
        { error: 'No se pudo generar contenido mejorado' },
        { status: 500 }
      );
    }

    // Verify the text actually changed
    const originalLower = content.trim().toLowerCase();
    const improvedLower = improvedContent.trim().toLowerCase();
    
    if (originalLower === improvedLower) {
      console.log('📝 [improve-text-gemini-simple] No improvements needed');
      return NextResponse.json(
        { error: 'El texto ya está bien escrito y no necesita mejoras.' },
        { status: 400 }
      );
    }

    console.log('✅ [improve-text-gemini-simple] Success');
    console.log('📝 [improve-text-gemini-simple] Improved text:', improvedContent);

    return NextResponse.json({
      improvedContent: improvedContent
    });

  } catch (error) {
    console.error('❌ [improve-text-gemini-simple] Unhandled error:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}