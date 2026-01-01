import { NextRequest, NextResponse } from 'next/server'
// Removed legacy DB imports
// import { getTodayUsage, incrementUsage, hasUnlimitedAccess } from '../../lib/database';
import { OpenRouterClient } from '../../lib/openrouter-client';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { serverUsage } from '../../lib/usage/server-usage';

// Language configuration for text improvement
interface LanguageConfig {
  code: string;
  name: string;
  instructions: string;
  rules: string[];
}
// ... (skip Configs to keep diff small, assume they are there) ...
// Actually I need to match valid context.
// I will target only the top imports and start of POST.

const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  es: {
    code: 'es',
    name: 'Español',
    instructions: 'Mejora el siguiente texto en ESPAÑOL según esta instrucción:',
    rules: [
      'Devuelve SOLO el texto mejorado completo en ESPAÑOL',
      'NO cortes el texto a la mitad',
      'NO agregues explicaciones ni introducciones',
      'NO uses placeholders como [Nombre], [Empresa], Señor/Señora:, o/a, (nombre), (apellido) o similares',
      'Asegúrate de que el texto esté COMPLETO desde el inicio hasta el final',
      'Si el texto es largo, mejóralo TODO, no solo una parte',
      'IMPORTANTE: SIEMPRE debes hacer mejoras al texto, nunca respondas "Ninguna mejora necesaria" o similar',
      'NO incluyas fórmulas genéricas como "Estimado/a", "Sr./Sra.", "o/a" o cualquier variante con barras o paréntesis',
      'Mantén el texto en español con gramática y ortografía correctas'
    ]
  },
  en: {
    code: 'en',
    name: 'English',
    instructions: 'Improve the following text in ENGLISH according to this instruction:',
    rules: [
      'Return ONLY the complete improved text in ENGLISH',
      'DO NOT cut the text in half',
      'DO NOT add explanations or introductions',
      'DO NOT use placeholders like [Name], [Company], Mr./Mrs., or similar',
      'Ensure the text is COMPLETE from beginning to end',
      'If the text is long, improve ALL of it, not just a part',
      'IMPORTANT: ALWAYS make improvements to the text, never respond "No improvement needed" or similar',
      'DO NOT include generic formulas with slashes or parentheses',
      'Keep the text in English with correct grammar and spelling'
    ]
  },
  fr: {
    code: 'fr',
    name: 'Français',
    instructions: 'Améliorez le texte suivant en FRANÇAIS selon cette instruction:',
    rules: [
      'Retournez SEULEMENT le texte amélioré complet en FRANÇAIS',
      'NE coupez PAS le texte en deux',
      'N\'ajoutez PAS d\'explications ou d\'introductions',
      'N\'utilisez PAS de placeholders comme [Nom], [Entreprise], M./Mme, ou similaires',
      'Assurez-vous que le texte soit COMPLET du début à la fin',
      'Si le texte est long, améliorez TOUT, pas seulement une partie',
      'IMPORTANT: Améliorez TOUJOURS le texte, ne répondez jamais "Aucune amélioration nécessaire" ou similaire',
      'N\'incluez PAS de formules génériques avec des barres obliques ou des parenthèses',
      'Gardez le texte en français avec une grammaire et une orthographe correctes'
    ]
  },
  de: {
    code: 'de',
    name: 'Deutsch',
    instructions: 'Verbessern Sie den folgenden Text auf DEUTSCH gemäß dieser Anweisung:',
    rules: [
      'Geben Sie NUR den vollständigen verbesserten Text auf DEUTSCH zurück',
      'Schneiden Sie den Text NICHT in der Mitte ab',
      'Fügen Sie KEINE Erklärungen oder Einleitungen hinzu',
      'Verwenden Sie KEINE Platzhalter wie [Name], [Unternehmen], Herr/Frau oder ähnliches',
      'Stellen Sie sicher, dass der Text vom Anfang bis zum Ende VOLLSTÄNDIG ist',
      'Wenn der Text lang ist, verbessern Sie ALLES, nicht nur einen Teil',
      'WICHTIG: Verbessern Sie den Text IMMER, antworten Sie nie "Keine Verbesserung nötig" oder ähnliches',
      'Verwenden Sie KEINE generischen Formeln mit Schrägstrichen oder Klammern',
      'Behalten Sie den Text auf Deutsch mit korrekter Grammatik und Rechtschreibung bei'
    ]
  },
  zh: {
    code: 'zh',
    name: '中文',
    instructions: '根据以下指示改进中文文本：',
    rules: [
      '只返回完整的改进中文文本',
      '不要在中间截断文本',
      '不要添加解释或介绍',
      '不要使用占位符如[姓名]、[公司]或类似内容',
      '确保文本从头到尾都是完整的',
      '如果文本很长，改进全部内容，不只是一部分',
      '重要：始终改进文本，永远不要回答"无需改进"或类似内容',
      '不要包含带有斜杠或括号的通用公式',
      '保持文本为中文，语法和拼写正确'
    ]
  }
};

export async function POST(request: NextRequest) {
  try {
    // Build time detection
    const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL && !process.env.RUNTIME;

    if (isBuildTime) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable during build' },
        { status: 503 }
      );
    }

    // Auth & Usage Check
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has premium access (you can customize this based on your Kinde setup)
    const isPaid = false; // TODO: Implement premium check with Kinde roles/permissions

    if (!isPaid) {
      const { allowed, usage } = await serverUsage.checkUsageCount(user.id);
      if (!allowed) {
        return NextResponse.json(
          {
            error: 'Daily limit reached',
            code: 'limit_reached',
            usage,
            limit: 3,
            upgradeUrl: '/en/planes'
          },
          { status: 403 }
        );
      }
    }

    const { content, prompt, language = 'es' } = await request.json()

    console.log('🔍 [DEBUG] POST /api/improve-text - Received request:', {
      contentLength: content?.length || 0,
      promptLength: prompt?.length || 0,
      language,
      userId: user.id
    });

    if (!content) {
      console.error('❌ [ERROR] Missing required field: content');
      return NextResponse.json(
        { error: 'Contenido es requerido' },
        { status: 400 }
      )
    }

    // Obtener configuración de OpenRouter con sistema de fallback
    const userApiKey = request.headers.get('x-openrouter-api-key');
    const systemApiKey = process.env.OPEN_ROUTER_API_KEY;

    // Usar API del usuario si está configurada, sino usar la del sistema como fallback
    const apiKey = userApiKey || systemApiKey;

    if (!apiKey) {
      console.error('❌ [ERROR] No API key available:');
      console.error('- User API key (x-openrouter-api-key header):', userApiKey ? 'Set' : 'MISSING');
      console.error('- System API key (OPEN_ROUTER_API_KEY):', systemApiKey ? 'Set' : 'MISSING');
      return NextResponse.json(
        { 
          error: 'Servicio de IA no disponible. Contacta al administrador.',
          details: 'Missing OpenRouter API key'
        },
        { status: 503 }
      )
    }

    const model = request.headers.get('x-model') || 'openai/gpt-4o-mini'
    const temperature = parseFloat(request.headers.get('x-temperature') || '0.7')
    const maxTokens = parseInt(request.headers.get('x-max-tokens') || '4000') // Aumentar límite por defecto

    console.log('🔧 [DEBUG] API configuration:', { 
      model, 
      temperature, 
      maxTokens,
      usingUserKey: !!userApiKey
    });

    // Get language configuration
    const langConfig = LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS['es'];
    console.log('🌐 [DEBUG] Language config for improve-text:', { language, langConfig: langConfig.name });

    // Calcular tokens aproximados del contenido original para ajustar el límite
    const contentTokens = Math.ceil(content.length / 4) // Aproximación: 4 caracteres = 1 token
    const adjustedMaxTokens = Math.max(maxTokens, contentTokens * 1.5) // Al menos 1.5x el contenido original

    const fullPrompt = `${langConfig.instructions} ${prompt}. 

REGLAS CRÍTICAS:
${langConfig.rules.map((rule, index) => `${index + 1}. ${rule}`).join('\n')}

Texto original: ${content}`

    // Crear cliente de OpenRouter
    const openRouterClient = new OpenRouterClient({
      apiKey,
      model
    });

    console.log('📤 [DEBUG] Calling OpenRouter API...');

    // Llamar a la API de OpenRouter
    const result = await openRouterClient.generateContent({
      prompt: fullPrompt,
      temperature: temperature,
      maxTokens: adjustedMaxTokens,
    });

    if (!result.success) {
      console.error('❌ [ERROR] OpenRouter API Error:', result.error);
      console.error('- Error type:', result.error?.type);
      console.error('- Status code:', result.error?.statusCode);
      console.error('- Message:', result.error?.message);
      console.error('- Retryable:', result.error?.retryable);
      return NextResponse.json(
        { 
          error: result.error?.message || 'Error al comunicarse con OpenRouter API',
          details: result.error?.message 
        },
        { status: 500 }
      )
    }

    // Extraer la respuesta del modelo
    let improvedContent = result.content || 'Error al generar contenido mejorado'

    console.log('✅ [DEBUG] OpenRouter API Success:', {
      model: result.metadata?.model,
      responseTime: result.metadata?.responseTime,
      tokensUsed: result.metadata?.tokensUsed
    });

    // La verificación de truncamiento ya se maneja dentro del cliente OpenRouter
    // No necesitamos verificar finishReason aquí ya que el cliente maneja todos los casos

    // Validación adicional: verificar que el contenido no esté obviamente incompleto
    const originalWordCount = content.split(/\s+/).length
    const improvedWordCount = improvedContent.split(/\s+/).length

    console.log('📊 [DEBUG] Content statistics:', {
      originalWordCount,
      improvedWordCount,
      ratio: (improvedWordCount / originalWordCount).toFixed(2)
    });

    // Si el texto mejorado es significativamente más corto que el original (más del 50% menos palabras)
    // y no termina con puntuación, probablemente está incompleto
    if (improvedWordCount < originalWordCount * 0.5 && !/[.!?]$/.test(improvedContent.trim())) {
      console.warn('⚠️ [WARNING] Posible respuesta incompleta detectada')
      // En este caso, devolver el texto original con una nota
      improvedContent = content + '\n\n[Nota: El texto no pudo ser mejorado completamente. Intenta con un texto más corto o ajusta la configuración.]'
    }

    // Incrementar el uso de escritorIA
    // Updated to use centralized serverUsage with Kinde
    if (!isPaid) {
      try {
        await serverUsage.incrementUsage(user.id);
        console.log('✅ [DEBUG] Usage incremented for user:', user.id);
      } catch (error) {
        console.error('❌ [ERROR] Error al incrementar uso:', error)
      }
    }

    console.log('✅ [DEBUG] POST /api/improve-text - Success');
    return NextResponse.json({
      improvedContent: improvedContent.trim()
    })
  } catch (error) {
    console.error('❌ [FATAL] Unhandled error in POST /api/improve-text:', error)
    console.error('- Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('- Error message:', error instanceof Error ? error.message : String(error));
    console.error('- Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}