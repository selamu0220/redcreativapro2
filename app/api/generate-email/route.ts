import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { OpenRouterClient } from '../../lib/openrouter-client';
import {
  getRegionalBusinessExamples,
  getCulturalAdaptationRules,
  getRegionalGreeting,
  getRegionalBusinessContext,
  type CountryCode
} from '../../data/localizedTemplates';

// Language configuration for AI content generation
interface LanguageConfig {
  code: string;
  name: string;
  greetings: {
    morning: string;
    afternoon: string;
    evening: string;
  };
  promptInstructions: string;
  timeContexts: {
    morning: string;
    afternoon: string;
    evening: string;
  };
}

const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  es: {
    code: 'es',
    name: 'Español',
    greetings: {
      morning: 'Buenos días',
      afternoon: 'Buenas tardes',
      evening: 'Buenas noches'
    },
    promptInstructions: `Genera un email profesional en ESPAÑOL con las siguientes características:`,
    timeContexts: {
      morning: 'mañana',
      afternoon: 'tarde',
      evening: 'noche'
    }
  },
  en: {
    code: 'en',
    name: 'English',
    greetings: {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening'
    },
    promptInstructions: `Generate a professional email in ENGLISH with the following characteristics:`,
    timeContexts: {
      morning: 'morning',
      afternoon: 'afternoon',
      evening: 'evening'
    }
  },
  fr: {
    code: 'fr',
    name: 'Français',
    greetings: {
      morning: 'Bonjour',
      afternoon: 'Bonjour',
      evening: 'Bonsoir'
    },
    promptInstructions: `Générez un email professionnel en FRANÇAIS avec les caractéristiques suivantes:`,
    timeContexts: {
      morning: 'matin',
      afternoon: 'après-midi',
      evening: 'soir'
    }
  },
  de: {
    code: 'de',
    name: 'Deutsch',
    greetings: {
      morning: 'Guten Morgen',
      afternoon: 'Guten Tag',
      evening: 'Guten Abend'
    },
    promptInstructions: `Erstellen Sie eine professionelle E-Mail auf DEUTSCH mit den folgenden Eigenschaften:`,
    timeContexts: {
      morning: 'Morgen',
      afternoon: 'Nachmittag',
      evening: 'Abend'
    }
  },
  zh: {
    code: 'zh',
    name: '中文',
    greetings: {
      morning: '早上好',
      afternoon: '下午好',
      evening: '晚上好'
    },
    promptInstructions: `生成一封专业的中文电子邮件，具有以下特征：`,
    timeContexts: {
      morning: '上午',
      afternoon: '下午',
      evening: '晚上'
    }
  },
  pt: {
    code: 'pt',
    name: 'Português',
    greetings: {
      morning: 'Bom dia',
      afternoon: 'Boa tarde',
      evening: 'Boa noite'
    },
    promptInstructions: `Gere um email profissional em PORTUGUÊS com as seguintes características:`,
    timeContexts: {
      morning: 'manhã',
      afternoon: 'tarde',
      evening: 'noite'
    }
  }
};


interface BusinessContext {
  businessName: string;
  businessType: string;
  services: string;
  targetAudience: string;
  valueProposition: string;
  salesTactics: string;
  contentStrategy: {
    valueToSalesRatio: string;
    valueEmailTypes: string[];
    salesEmailTypes: string[];
  };
  brandTone: string;
  keyMessages: string[];
}

interface UserBusinessContext {
  [userEmail: string]: BusinessContext;
}

interface QualificationData {
  responses: { [questionId: string]: string | string[] };
  interests?: string[];
  communicationStyle?: string;
  preferredTopics?: string[];
  languageStyle?: string;
  demographicInfo?: { [key: string]: string };
  qualificationScore?: number;
  segment?: string;
  completedAt?: string;
}

interface ContactData {
  email: string;
  name?: string;
  qualificationData?: QualificationData;
  [key: string]: any;
}

// KV storage helper functions
const kvGet = async (key: string) => {
  try {
    return await kv.get(key);
  } catch (error) {
    console.error(`Error getting ${key} from KV:`, error);
    return null;
  }
};

const kvSet = async (key: string, value: any) => {
  try {
    await kv.set(key, value);
  } catch (error) {
    console.error(`Error setting ${key} in KV:`, error);
  }
};

// Leer contexto empresarial del usuario
const getUserBusinessContext = async (userEmail: string): Promise<BusinessContext | null> => {
  try {
    const contexts = await kvGet('business-context') as UserBusinessContext | null;
    return contexts?.[userEmail] || null;
  } catch (error) {
    console.error('Error reading business context:', error);
    return null;
  }
};

// Leer datos de cualificación del contacto
const getContactQualificationData = async (contactEmail: string): Promise<QualificationData | null> => {
  try {
    // Buscar en contacts (datos legacy)
    const contacts = await kvGet('contacts') as ContactData[] | null;
    if (contacts) {
      const contact = contacts.find(c => c.email === contactEmail);
      if (contact?.qualificationData) {
        return contact.qualificationData;
      }
    }

    // Buscar en collected-emails
    const collectedEmails = await kvGet('collected-emails') as any[] | null;
    if (collectedEmails) {
      const emailWithCustomFields = collectedEmails.find((email: any) => email.email === contactEmail && email.customFields);

      if (emailWithCustomFields?.customFields) {
        return {
          responses: emailWithCustomFields.customFields,
          completedAt: emailWithCustomFields.collectedAt
        };
      }
    }

    // Buscar en archivos específicos de usuario usando patrones de KV
    const userEmailKeys = ['collected-emails-user1', 'collected-emails-user2']; // Expandir según necesidad

    for (const key of userEmailKeys) {
      const emails = await kvGet(key) as any[] | null;
      if (emails) {
        const emailWithCustomFields = emails.find((email: any) => email.email === contactEmail && email.customFields);

        if (emailWithCustomFields?.customFields) {
          return {
            responses: emailWithCustomFields.customFields,
            completedAt: emailWithCustomFields.collectedAt
          };
        }
      }
    }

    return null;
  } catch (error: any) {
    console.error('Error getting contact qualification data:', error);
    return null;
  }
};

import { createClient } from '@/utils/supabase/server';
import { serverUsage } from '../../lib/usage/server-usage';

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log('🚀 [DEBUG] Iniciando POST /api/generate-email');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Timeout global para evitar que la función se cuelgue
  const timeoutPromise = new Promise<NextResponse>((resolve) => {
    setTimeout(() => {
      resolve(NextResponse.json({
        error: 'Timeout: La generación de email tardó más de 60 segundos',
        errorType: 'timeout_error',
        retryable: true,
        suggestedRetryDelay: 5000
      }, { status: 408 })); // 408 Request Timeout
    }, 60000); // 60 segundos timeout global
  });

  const mainPromise = async () => {
    try {
      // Authentication & Usage Check with Supabase
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || !user.id) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Check if user has premium access
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

      console.log('📥 [DEBUG] Parseando request body...');

      // Debug: Leer el body como texto primero
      const bodyText = await request.text();
      console.log('🔍 [DEBUG] Raw body text:', bodyText);
      console.log('🔍 [DEBUG] Body length:', bodyText.length);

      // Parsear el JSON
      let parsedBody;
      try {
        parsedBody = JSON.parse(bodyText);
      } catch (parseError) {
        console.error('❌ [DEBUG] JSON Parse Error:', parseError);
        console.error('❌ [DEBUG] Problematic JSON:', bodyText);
        throw parseError;
      }

      const { recipient, subject, purpose, context, emailType, language = 'es', country } = parsedBody;
      console.log('📋 [DEBUG] Datos recibidos:', { recipient, subject, purpose, context, emailType, language, country });

      if (!recipient || !subject || !purpose) {
        console.log('❌ [DEBUG] Faltan parámetros requeridos');
        return NextResponse.json(
          { error: 'Faltan parámetros requeridos' },
          { status: 400 }
        );
      }

      // Obtener configuración de API desde headers o usar valores por defecto
      console.log('🔑 [DEBUG] Obteniendo configuración de API...');
      console.log('🔑 [DEBUG] Headers:', Object.fromEntries(request.headers.entries()));
      console.log('🔑 [DEBUG] x-api-key header:', request.headers.get('x-api-key'));
      console.log('🔑 [DEBUG] process.env.OPEN_ROUTER_API_KEY:', process.env.OPEN_ROUTER_API_KEY);

      const apiKey = request.headers.get('x-api-key') || process.env.OPEN_ROUTER_API_KEY;
      const model = request.headers.get('x-model') || 'openai/gpt-3.5-turbo';
      const temperature = parseFloat(request.headers.get('x-temperature') || '0.7');
      const maxTokens = parseInt(request.headers.get('x-max-tokens') || '2000');
      console.log('⚙️ [DEBUG] Configuración API:', { model, temperature, maxTokens, hasApiKey: !!apiKey, apiKey: apiKey?.substring(0, 10) + '...' });

      if (!apiKey) {
        console.log('❌ [DEBUG] API key no configurada');
        return NextResponse.json(
          { error: 'API key no configurada' },
          { status: 400 }
        );
      }

      // Obtener contexto empresarial del usuario
      console.log('👤 [DEBUG] Obteniendo contexto empresarial...');
      const userEmail = user.email;
      console.log('📧 [DEBUG] User email:', userEmail);
      const businessContext = userEmail ? await getUserBusinessContext(userEmail) : null;
      console.log('🏢 [DEBUG] Business context obtenido:', !!businessContext);

      // Obtener datos de cualificación del contacto destinatario
      console.log('📊 [DEBUG] Obteniendo datos de cualificación para:', recipient);
      const qualificationData = await getContactQualificationData(recipient);
      console.log('📋 [DEBUG] Qualification data obtenido:', !!qualificationData);


      // Construir información del contexto empresarial
      let businessInfo = '';
      if (businessContext) {
        businessInfo = `

CONTEXTO EMPRESARIAL:
- Empresa: ${businessContext.businessName}
- Tipo de negocio: ${businessContext.businessType}
- Servicios/Productos: ${businessContext.services}
- Audiencia objetivo: ${businessContext.targetAudience}
- Propuesta de valor: ${businessContext.valueProposition}
- Tono de marca: ${businessContext.brandTone}
${businessContext.keyMessages.length > 0 ? `- Mensajes clave: ${businessContext.keyMessages.join(', ')}` : ''}`;

        // Agregar información específica según el tipo de email
        if (emailType === 'sales' && businessContext.salesTactics) {
          businessInfo += `
- Tácticas de venta: ${businessContext.salesTactics}`;
        }

        // Agregar estrategia de contenido
        if (businessContext.contentStrategy) {
          const strategy = businessContext.contentStrategy;
          if (emailType === 'value' && strategy.valueEmailTypes.length > 0) {
            businessInfo += `
- Tipos de contenido de valor: ${strategy.valueEmailTypes.join(', ')}`;
          } else if (emailType === 'sales' && strategy.salesEmailTypes.length > 0) {
            businessInfo += `
- Tipos de contenido de venta: ${strategy.salesEmailTypes.join(', ')}`;
          }
        }
      }

      // Construir información de personalización basada en datos de cualificación
      let personalizationInfo = '';
      if (qualificationData) {
        personalizationInfo = `

INFORMACIÓN DE PERSONALIZACIÓN DEL DESTINATARIO:`;

        if (qualificationData.interests && qualificationData.interests.length > 0) {
          personalizationInfo += `
- Intereses profesionales: ${qualificationData.interests.join(', ')}`;
        }

        if (qualificationData.communicationStyle) {
          personalizationInfo += `
- Estilo de comunicación preferido: ${qualificationData.communicationStyle}`;
        }

        if (qualificationData.preferredTopics && qualificationData.preferredTopics.length > 0) {
          personalizationInfo += `
- Temas de interés: ${qualificationData.preferredTopics.join(', ')}`;
        }

        if (qualificationData.demographicInfo?.sector) {
          personalizationInfo += `
- Sector de trabajo: ${qualificationData.demographicInfo.sector}`;
        }

        if (qualificationData.segment) {
          personalizationInfo += `
- Segmento de usuario: ${qualificationData.segment}`;
        }

        // Agregar respuestas específicas del cuestionario
        if (qualificationData.responses) {
          const responses = Object.entries(qualificationData.responses);
          if (responses.length > 0) {
            personalizationInfo += `
- Respuestas del cuestionario:`;
            responses.forEach(([questionId, answer]) => {
              if (Array.isArray(answer)) {
                personalizationInfo += `
  * ${questionId}: ${answer.join(', ')}`;
              } else {
                personalizationInfo += `
  * ${questionId}: ${answer}`;
              }
            });
          }
        }
      }

      // Get language configuration
      const langConfig = LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS['es'];
      console.log('🌐 [DEBUG] Language config:', { language, langConfig: langConfig.name });

      // Detectar la hora actual y determinar el saludo apropiado según el idioma
      const now = new Date();
      const currentHour = now.getHours();

      // Get regional adaptation context if country is provided
      let regionalContext = '';
      let regionalGreeting = '';
      let culturalAdaptation = '';

      if (country) {
        console.log('🌍 [DEBUG] Applying regional adaptation for country:', country);

        try {
          const businessExamples = getRegionalBusinessExamples(country as CountryCode);
          const culturalRules = getCulturalAdaptationRules(country as CountryCode);
          const contextInfo = getRegionalBusinessContext(country as CountryCode);

          regionalContext = `

CONTEXTO REGIONAL PARA ${country}:
${contextInfo}

ADAPTACIÓN CULTURAL:
- Nivel de formalidad: ${culturalRules.formalityLevel}
- Estilo de comunicación: ${culturalRules.communicationStyle}
- Cultura empresarial: ${culturalRules.businessCulture}
- Orientación temporal: ${culturalRules.timeOrientation}`;

          // Get regional greeting based on time of day
          const timeOfDay = currentHour >= 6 && currentHour < 12 ? 'morning' :
            currentHour >= 12 && currentHour < 20 ? 'afternoon' : 'evening';
          regionalGreeting = getRegionalGreeting(country as CountryCode, timeOfDay);

          // Add specific cultural adaptation instructions
          culturalAdaptation = `

INSTRUCCIONES DE ADAPTACIÓN REGIONAL:
- Usa expresiones y modismos apropiados para ${country}
- Adapta el nivel de formalidad según las normas culturales locales (${culturalRules.formalityLevel})
- Considera el estilo de comunicación ${culturalRules.communicationStyle}
- Incluye referencias comerciales relevantes para el mercado local
- Respeta las normas de cortesía y protocolo empresarial de ${country}`;

          if (businessExamples.companies.length > 0) {
            culturalAdaptation += `
- Puedes hacer referencias sutiles a empresas conocidas como: ${businessExamples.companies.slice(0, 3).join(', ')}`;
          }

          if (businessExamples.businessTypes.length > 0) {
            culturalAdaptation += `
- Considera sectores importantes del país: ${businessExamples.businessTypes.slice(0, 3).join(', ')}`;
          }

          console.log('✅ [DEBUG] Regional adaptation applied successfully');
        } catch (error) {
          console.warn('⚠️ [DEBUG] Error applying regional adaptation:', error);
          // Continue without regional adaptation if there's an error
        }
      }
      let appropriateGreeting = '';
      let timeContext = '';

      if (currentHour >= 6 && currentHour < 12) {
        appropriateGreeting = langConfig.greetings.morning;
        timeContext = langConfig.timeContexts.morning;
      } else if (currentHour >= 12 && currentHour < 20) {
        appropriateGreeting = langConfig.greetings.afternoon;
        timeContext = langConfig.timeContexts.afternoon;
      } else {
        appropriateGreeting = langConfig.greetings.evening;
        timeContext = langConfig.timeContexts.evening;
      }

      console.log(`🕐 [DEBUG] Hora actual: ${currentHour}:${now.getMinutes()}, Saludo: ${appropriateGreeting} (${language})`);

      // Use regional greeting if available, otherwise use language-based greeting
      const finalGreeting = regionalGreeting || appropriateGreeting;

      // Construir el prompt para generar el email usando configuración de idioma y adaptación regional
      const prompt = `${langConfig.promptInstructions}

Destinatario: ${recipient}
Asunto: ${subject}
Propósito: ${purpose}
${context ? `Contexto adicional: ${context}` : ''}${businessInfo}${personalizationInfo}${regionalContext}${culturalAdaptation}

CONTEXTO TEMPORAL:
- Hora actual: ${currentHour}:${now.getMinutes().toString().padStart(2, '0')} (${timeContext})
- Saludo apropiado: ${finalGreeting}

Instrucciones:
1. Crea un email profesional y bien estructurado EN ${langConfig.name.toUpperCase()}
2. Usa un tono ${businessContext?.brandTone || 'profesional'} apropiado para el propósito indicado
3. OBLIGATORIO: Usa el saludo "${finalGreeting}" al inicio del email
4. Incluye un saludo, cuerpo del mensaje y despedida
5. Mantén un estilo claro y conciso
6. Adapta el contenido al propósito específico y al contexto empresarial
7. No incluyas el asunto en el cuerpo del email
8. Responde únicamente con el contenido del email, sin explicaciones adicionales
9. NO uses placeholders genéricos o fórmulas genéricas con barras o paréntesis
10. Usa saludos específicos y directos apropiados para ${langConfig.name}
${businessContext ? `11. Incorpora naturalmente la propuesta de valor y los mensajes clave de la empresa` : ''}
${qualificationData ? `12. PERSONALIZACIÓN OBLIGATORIA: Usa la información de personalización del destinatario para adaptar el contenido, tono y enfoque del email. Menciona temas de su interés, adapta el estilo de comunicación a sus preferencias, y haz referencias relevantes a su sector o respuestas del cuestionario` : ''}
${country ? `${qualificationData ? '13' : '12'}. ADAPTACIÓN REGIONAL OBLIGATORIA: Aplica las instrucciones de adaptación regional proporcionadas. Usa expresiones, referencias y estilo apropiados para ${country}` : ''}
${emailType === 'value' ? `${country ? (qualificationData ? '14' : '13') : (qualificationData ? '13' : '12')}. Enfócate en aportar valor educativo, consejos útiles o insights relevantes` : ''}
${emailType === 'sales' ? `${country ? (qualificationData ? '14' : '13') : (qualificationData ? '13' : '12')}. Incluye una llamada a la acción clara y persuasiva para generar conversiones` : ''}

Email:`;

      // Crear cliente de OpenRouter
      console.log('🤖 [DEBUG] Creando cliente de OpenRouter...');
      const openRouterClient = new OpenRouterClient({
        apiKey,
        model,
        maxRetries: 2, // Reducir reintentos para evitar acumulación de memoria
        retryDelay: 1000,
        timeout: 30000 // 30 segundos - timeout más conservador
      });
      console.log('✅ [DEBUG] Cliente de OpenRouter creado exitosamente');

      // Llamar a la API de OpenRouter usando el cliente mejorado
      console.log('🚀 [DEBUG] Llamando a la API de OpenRouter...');
      console.log('📝 [DEBUG] Prompt length:', prompt.length);

      const result = await openRouterClient.generateContent({
        prompt,
        temperature,
        maxTokens: Math.min(maxTokens, 1500), // Limitar tokens para evitar respuestas muy largas
        topP: 0.9
      });
      console.log('📤 [DEBUG] Respuesta de OpenRouter recibida:', { success: result.success });

      if (!result.success) {
        console.error('❌ OpenRouter API Error:', result.error);
        console.log('🔍 [DEBUG] Error details - Type:', result.error!.type, 'StatusCode:', result.error!.statusCode, 'Retryable:', result.error!.retryable);
        console.log('🔍 [DEBUG] Original error message:', result.error!.message);

        // Devolver error con mensaje amigable para el usuario
        const userMessage = openRouterClient.getUserFriendlyErrorMessage(result.error!);
        console.log('🔍 [DEBUG] User-friendly message:', userMessage);

        return NextResponse.json(
          {
            error: userMessage,
            errorType: result.error!.type,
            retryable: result.error!.retryable,
            suggestedRetryDelay: result.error!.retryable ? 3000 : 0,
            details: result.error!.message // Para debugging
          },
          { status: result.error!.statusCode || 500 }
        );
      }

      console.log('✅ OpenRouter API Success:', {
        model: result.metadata.model,
        responseTime: result.metadata.responseTime,
        attempt: result.metadata.attempt,
        tokensUsed: result.metadata.tokensUsed
      });

      // Increment usage for free users if successful
      if (!isPaid) {
        await serverUsage.incrementUsage(user.id);
      }

      return NextResponse.json({
        email: result.content!.trim(),
        metadata: {
          model: result.metadata.model,
          responseTime: result.metadata.responseTime,
          tokensUsed: result.metadata.tokensUsed
        }
      });
    } catch (error) {
      console.error('❌ Error generating email:', error)

      return NextResponse.json({
        error: 'Error al generar el email',
        errorType: 'generation_error',
        retryable: true,
        suggestedRetryDelay: 5000,
        details: error instanceof Error ? error.message : 'Error desconocido'
      }, { status: 500 })
    }
  };

  // Ejecutar con timeout global
  return await Promise.race([mainPromise(), timeoutPromise]);
}