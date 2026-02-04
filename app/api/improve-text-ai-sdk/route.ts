import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { content, creativity = 0.3, customPrompt, model = 'gemini-2.5-flash' } = await request.json();

    console.log('🔍 [improve-text-ai-sdk] Received:', {
      contentLength: content?.length || 0,
      hasContent: !!content,
      creativity,
      hasCustomPrompt: !!customPrompt,
      model
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
    console.log('🎨 [improve-text-ai-sdk] Creativity level:', creativity);
    console.log('📋 [improve-text-ai-sdk] Custom prompt:', customPrompt ? 'Yes' : 'No');

    // Build the prompt based on custom instructions or default
    const basePrompt = customPrompt || "Mejora este texto corrigiendo gramática, ortografía y fluidez. Mantén el idioma original y el tono.";
    const fullPrompt = `${basePrompt} Solo devuelve el texto mejorado, sin explicaciones:

${content}`;

    const { createClient } = await import('@/utils/supabase/server');
    const { serverUsage } = await import('../../lib/usage/server-usage');

    // Auth Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Necesitas iniciar sesión para usar la IA' },
        { status: 401 }
      );
    }

    // Usage Limit Check
    // ADMIN BYPASS
    const isAdmin = user.email === 'selamu.garciabravo@gmail.com';
    let isPaid = isAdmin;

    if (!isPaid) {
      // Quick check for active subscription (fallback to free if check fails to fail-safe for user but strict for usage)
      try {
        const { getSubscription } = await import('../../lib/server/subscription-service');
        const sub = await getSubscription(user.id);
        if (sub && sub.status === 'active') {
          isPaid = true;
        }
      } catch (e) {
        console.error("Error checking subscription:", e);
      }
    }

    if (!isPaid) {
      const { allowed, usage } = await serverUsage.checkUsageCount(user.id);
      if (!allowed) {
        return NextResponse.json(
          {
            error: 'Has alcanzado tu límite diario de 3 mejoras gratuitas.',
            code: 'limit_reached',
            usage,
            limit: 3,
            upgradeUrl: '/planes'
          },
          { status: 403 }
        );
      }
    }

    // Use AI SDK to generate improved text (API key is automatically loaded from env)
    const { text: improvedContent } = await generateText({
      model: google(model),
      prompt: fullPrompt,
      temperature: creativity,
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

    // Increment usage if not paid
    if (!isPaid) {
      try {
        await serverUsage.incrementUsage(user.id);
      } catch (e) {
        console.error("Failed to increment usage:", e);
      }
    }

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
