import { NextRequest, NextResponse } from 'next/server';
import { OpenRouterClient } from '../../lib/openrouter-client';

// Language configuration for content improvement
interface LanguageConfig {
  code: string;
  name: string;
  instructions: string;
  rules: string[];
}

const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  es: {
    code: 'es',
    name: 'Español',
    instructions: 'IMPORTANTE: DEVUELVE ÚNICAMENTE EL TEXTO MEJORADO EN ESPAÑOL, SIN EXPLICACIONES, SIN COMENTARIOS, SIN ANÁLISIS, SIN INTRODUCCIONES.',
    rules: [
      'NO agregues frases como "Texto mejorado:", "Aquí tienes:", "Con gusto te ofrezco:", etc.',
      'NO incluyas explicaciones sobre las mejoras realizadas',
      'SIEMPRE debes hacer mejoras al texto, nunca respondas "Ninguna mejora necesaria" o similar',
      'Incluso si el texto está bien, mejora al menos la fluidez, claridad o estructura',
      'NO uses placeholders genéricos como Señor/Señora:, o/a, (nombre), (apellido), Sr./Sra., Estimado/a o similares',
      'Mantén el texto en español con gramática y ortografía correctas'
    ]
  },
  en: {
    code: 'en',
    name: 'English',
    instructions: 'IMPORTANT: RETURN ONLY THE IMPROVED TEXT IN ENGLISH, WITHOUT EXPLANATIONS, WITHOUT COMMENTS, WITHOUT ANALYSIS, WITHOUT INTRODUCTIONS.',
    rules: [
      'DO NOT add phrases like "Improved text:", "Here you have:", "I gladly offer you:", etc.',
      'DO NOT include explanations about the improvements made',
      'ALWAYS make improvements to the text, never respond "No improvement needed" or similar',
      'Even if the text is good, improve at least the fluency, clarity or structure',
      'DO NOT use generic placeholders like Mr./Mrs., or similar',
      'Keep the text in English with correct grammar and spelling'
    ]
  },
  fr: {
    code: 'fr',
    name: 'Français',
    instructions: 'IMPORTANT: RETOURNEZ SEULEMENT LE TEXTE AMÉLIORÉ EN FRANÇAIS, SANS EXPLICATIONS, SANS COMMENTAIRES, SANS ANALYSE, SANS INTRODUCTIONS.',
    rules: [
      'N\'ajoutez PAS de phrases comme "Texte amélioré:", "Voici:", "Je vous offre volontiers:", etc.',
      'N\'incluez PAS d\'explications sur les améliorations apportées',
      'Améliorez TOUJOURS le texte, ne répondez jamais "Aucune amélioration nécessaire" ou similaire',
      'Même si le texte est bon, améliorez au moins la fluidité, la clarté ou la structure',
      'N\'utilisez PAS de placeholders génériques comme M./Mme ou similaires',
      'Gardez le texte en français avec une grammaire et une orthographe correctes'
    ]
  },
  de: {
    code: 'de',
    name: 'Deutsch',
    instructions: 'WICHTIG: GEBEN SIE NUR DEN VERBESSERTEN TEXT AUF DEUTSCH ZURÜCK, OHNE ERKLÄRUNGEN, OHNE KOMMENTARE, OHNE ANALYSE, OHNE EINLEITUNGEN.',
    rules: [
      'Fügen Sie KEINE Phrasen wie "Verbesserter Text:", "Hier haben Sie:", "Gerne biete ich Ihnen:", etc. hinzu',
      'Fügen Sie KEINE Erklärungen über die vorgenommenen Verbesserungen hinzu',
      'Verbessern Sie den Text IMMER, antworten Sie nie "Keine Verbesserung nötig" oder ähnliches',
      'Auch wenn der Text gut ist, verbessern Sie mindestens die Flüssigkeit, Klarheit oder Struktur',
      'Verwenden Sie KEINE generischen Platzhalter wie Herr/Frau oder ähnliches',
      'Behalten Sie den Text auf Deutsch mit korrekter Grammatik und Rechtschreibung bei'
    ]
  },
  zh: {
    code: 'zh',
    name: '中文',
    instructions: '重要：只返回改进的中文文本，不要解释，不要评论，不要分析，不要介绍。',
    rules: [
      '不要添加"改进文本："、"这里是："、"我很乐意为您提供："等短语',
      '不要包含对所做改进的解释',
      '始终改进文本，永远不要回答"无需改进"或类似内容',
      '即使文本很好，也要至少改进流畅性、清晰度或结构',
      '不要使用通用占位符',
      '保持文本为中文，语法和拼写正确'
    ]
  }
};

export async function POST(request: NextRequest) {
  try {
    const { content, prompt, model: requestModel, temperature, maxTokens, language = 'es' } = await request.json();

    console.log('🔍 [DEBUG] POST /api/improve-content - Received request:', {
      contentLength: content?.length || 0,
      promptLength: prompt?.length || 0,
      language,
      model: requestModel
    });

    if (!content || !prompt) {
      console.error('❌ [ERROR] Missing required fields:', { content: !!content, prompt: !!prompt });
      return NextResponse.json(
        { error: 'Contenido y prompt son requeridos' },
        { status: 400 }
      );
    }

    // Obtener configuración de API con sistema de fallback
    const userApiKey = request.headers.get('x-api-key');
    const systemApiKey = process.env.OPEN_ROUTER_API_KEY;
    
    // Validar que haya al menos una API key disponible
    if (!userApiKey && !systemApiKey) {
      console.error('❌ [ERROR] No API key available:');
      console.error('- User API key (x-api-key header):', userApiKey ? 'Set' : 'MISSING');
      console.error('- System API key (OPEN_ROUTER_API_KEY):', systemApiKey ? 'Set' : 'MISSING');
      return NextResponse.json(
        { 
          error: 'API key not configured', 
          details: 'Missing OpenRouter API key in environment variables or request headers' 
        },
        { status: 503 }
      );
    }
    
    // Usar API del usuario si está configurada, sino usar la del sistema como fallback
    const apiKey = userApiKey || systemApiKey;
    const model = request.headers.get('x-ai-model') || requestModel || 'openai/gpt-3.5-turbo';
    const temp = parseFloat(request.headers.get('x-temperature') || temperature?.toString() || '0.7');
    const maxTok = parseInt(request.headers.get('x-max-tokens') || maxTokens?.toString() || '2000');

    console.log('🔧 [DEBUG] API configuration:', { 
      model, 
      temperature: temp, 
      maxTokens: maxTok,
      usingUserKey: !!userApiKey
    });

    // Crear cliente de OpenRouter
    const openRouterClient = new OpenRouterClient({
      apiKey,
      model,
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 30000
    });

    // Get language configuration
    const langConfig = LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS['es'];
    console.log('🌐 [DEBUG] Language config for improve-content:', { language, langConfig: langConfig.name });

    // Construir el prompt completo usando configuración de idioma
    const fullPrompt = `${prompt}\n\n${langConfig.instructions} ${langConfig.rules.join(' ')}\n\nTexto a mejorar:\n${content}\n\nTexto mejorado:`;

    console.log('📤 [DEBUG] Calling OpenRouter API...');

    // Llamar a la API de OpenRouter usando el cliente mejorado
    const result = await openRouterClient.generateContent({
      prompt: fullPrompt,
      temperature: temp,
      maxTokens: maxTok,
      topP: 0.8
    });

    if (!result.success) {
      console.error('❌ [ERROR] OpenRouter API Error:', result.error);
      console.error('- Error type:', result.error!.type);
      console.error('- Status code:', result.error!.statusCode);
      console.error('- Message:', result.error!.message);
      console.error('- Retryable:', result.error!.retryable);
      
      // Devolver error con mensaje amigable para el usuario
      const userMessage = openRouterClient.getUserFriendlyErrorMessage(result.error!);
      
      return NextResponse.json(
        { 
          success: false,
          error: userMessage,
          errorType: result.error!.type,
          retryable: result.error!.retryable,
          suggestedRetryDelay: result.error!.retryable ? 3000 : 0,
          details: result.error!.message // Para debugging
        },
        { status: result.error!.statusCode || 500 }
      );
    }

    console.log('✅ [DEBUG] OpenRouter API Success:', {
      model: result.metadata.model,
      responseTime: result.metadata.responseTime,
      attempt: result.metadata.attempt,
      tokensUsed: result.metadata.tokensUsed
    });

    console.log('📝 [DEBUG] Contenido original:', content.substring(0, 100) + '...');
    console.log('✨ [DEBUG] Contenido mejorado:', result.content!.substring(0, 100) + '...');
    console.log('🔄 [DEBUG] ¿Es diferente?', content !== result.content);

    return NextResponse.json({
      success: true,
      improvedContent: result.content,
      metadata: {
        model: result.metadata.model,
        responseTime: result.metadata.responseTime,
        tokensUsed: result.metadata.tokensUsed
      }
    });

  } catch (error) {
    console.error('❌ [FATAL] Unhandled error in POST /api/improve-content:', error);
    console.error('- Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('- Error message:', error instanceof Error ? error.message : String(error));
    console.error('- Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
