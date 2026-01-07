import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    console.log('🔍 [improve-text-ai-sdk] Received:', {
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
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    console.log('🔑 [improve-text-ai-sdk] API Key found:', !!apiKey);
    console.log('🔑 [improve-text-ai-sdk] API Key length:', apiKey?.length || 0);
    
    if (!apiKey) {
      console.error('❌ [improve-text-ai-sdk] No GOOGLE_GENERATIVE_AI_API_KEY found');
      return NextResponse.json(
        { error: 'API key no configurada' },
        { status: 500 }
      );
    }

    console.log('🔧 [improve-text-ai-sdk] Using AI SDK with Gemini');
    console.log('📝 [improve-text-ai-sdk] Original text:', content);

    // Use AI SDK to generate improved text (API key is automatically loaded from env)
    const { text: improvedContent } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: `Mejora este texto corrigiendo gramática, ortografía y fluidez. Mantén el idioma original y el tono. Solo devuelve el texto mejorado, sin explicaciones:

${content}`,
      temperature: 0.3,
      maxTokens: 1000,
    });

    if (!improvedContent || !improvedContent.trim()) {
      console.error('❌ [improve-text-ai-sdk] No content generated');
      return NextResponse.json(
        { error: 'No se pudo generar contenido mejorado' },
        { status: 500 }
      );
    }

    // Verify the text actually changed
    const originalLower = content.trim().toLowerCase();
    const improvedLower = improvedContent.trim().toLowerCase();
    
    if (originalLower === improvedLower) {
      console.log('📝 [improve-text-ai-sdk] No improvements needed');
      return NextResponse.json(
        { error: 'El texto ya está bien escrito y no necesita mejoras.' },
        { status: 400 }
      );
    }

    console.log('✅ [improve-text-ai-sdk] Success');
    console.log('📝 [improve-text-ai-sdk] Improved text:', improvedContent);

    return NextResponse.json({
      improvedContent: improvedContent.trim()
    });

  } catch (error) {
    console.error('❌ [improve-text-ai-sdk] Error:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}