import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai';
import { gateway, DEFAULT_MODEL } from '../../lib/ai/gateway';
import { createClient } from '@/utils/supabase/server';
import { serverUsage } from '../../lib/usage/server-usage';

export const maxDuration = 60;

// Language configuration for text improvement
interface LanguageConfig {
  code: string;
  name: string;
  instructions: string;
}

const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  es: {
    code: 'es',
    name: 'Español',
    instructions: `Actúa como un editor experto. Reescribe el texto para que sea claro, atractivo y 100% natural. 
    Evita el tono robótico o académico excesivo. Usa voz activa. 
    Si el texto es corto, mejóralo manteniendo su longitud aproximada.
    NO agregues introducción ni conclusión ("Aquí tienes el texto mejorado").
    Devuelve SOLO el texto mejorado.`
  },
  en: {
    code: 'en',
    name: 'English',
    instructions: `Act as an expert editor. Rewrite the text to be clear, engaging, and natural.
    Avoid robotic tone. Use active voice.
    Do NOT add introduction or conclusion.
    Return ONLY the improved text.`
  },
  fr: {
    code: 'fr',
    name: 'Français',
    instructions: `Agissez comme un éditeur expert. Réécrivez le texte pour qu'il soit clair, engageant et naturel.
    Ne PAS ajouter d'introduction ou de conclusion.
    Retournez UNIQUEMENT le texte amélioré.`
  },
  de: {
    code: 'de',
    name: 'Deutsch',
    instructions: `Handeln Sie als Expertenredakteur. Schreiben Sie den Text so um, dass er klar, ansprechend und natürlich ist.
    Fügen Sie KEINE Einleitung oder Schlussfolgerung hinzu.
    Geben Sie NUR den verbesserten Text zurück.`
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    instructions: `作为专家编辑。重写文本，使其清晰、引人入胜且自然。
    不要添加介绍或结论。
    仅返回改进的文本。`
  }
};

export async function POST(request: NextRequest) {
  try {
    // Auth Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Usage Limit Check
    // ADMIN BYPASS
    const isAdmin = user.email === 'selamu.garciabravo@gmail.com';
    let isPaid = isAdmin;

    if (!isPaid) {
      // Dynamic import to avoid circular dependency issues if any
      try {
        const { getSubscription } = await import('../../lib/server/subscription-service');
        const sub = await getSubscription(user.id);
        if (sub && sub.status === 'active') {
          isPaid = true;
        }
      } catch (e) {
        console.error("Error checking subscription in improve-text:", e);
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

    const { content, prompt, language = 'es' } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: 'Contenido es requerido' },
        { status: 400 }
      )
    }

    // Get language configuration
    const langConfig = LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS['es'];

    // Construct Prompt
    const finalPrompt = `
${langConfig.instructions}

Instrucción adicional del usuario: ${prompt || 'Mejora general'}

Texto original:
"${content}"
    `.trim();

    console.log(`📤 [AI] Calling Google Gemini (${DEFAULT_MODEL})... User: ${user.id}`);

    // Call API using our centralized Gateway
    const { text: improvedContent } = await generateText({
      model: gateway(DEFAULT_MODEL),
      prompt: finalPrompt,
      temperature: 0.7,
    });

    // Increment usage if not paid
    if (!isPaid) {
      await serverUsage.incrementUsage(user.id).catch(err => console.error('Limit update failed:', err));
    }

    return NextResponse.json({
      improvedContent: improvedContent.trim()
    })

  } catch (error: any) {
    console.error('❌ [FATAL] Error in improve-text:', error);

    // Handle specific Google/AI SDK errors
    const errorMessage = error.message || 'Error interno del servidor';

    return NextResponse.json(
      {
        error: 'Error al procesar el texto',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
