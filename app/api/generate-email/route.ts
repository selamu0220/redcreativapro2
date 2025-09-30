import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { OpenRouterClient } from '../../lib/openrouter-client';


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

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log('🚀 [DEBUG] Iniciando POST /api/generate-email');
  
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
    
    const { recipient, subject, purpose, context, emailType } = parsedBody;
    console.log('📋 [DEBUG] Datos recibidos:', { recipient, subject, purpose, context, emailType });

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
    const userEmail = request.headers.get('x-user-email');
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
    
    // Detectar la hora actual y determinar el saludo apropiado
    const now = new Date();
    const currentHour = now.getHours();
    let appropriateGreeting = '';
    let timeContext = '';
    
    if (currentHour >= 6 && currentHour < 12) {
      appropriateGreeting = 'Buenos días';
      timeContext = 'mañana';
    } else if (currentHour >= 12 && currentHour < 20) {
      appropriateGreeting = 'Buenas tardes';
      timeContext = 'tarde';
    } else {
      appropriateGreeting = 'Buenas noches';
      timeContext = 'noche';
    }
    
    console.log(`🕐 [DEBUG] Hora actual: ${currentHour}:${now.getMinutes()}, Saludo: ${appropriateGreeting}`);

    // Construir el prompt para generar el email
    const prompt = `Genera un email profesional con las siguientes características:

Destinatario: ${recipient}
Asunto: ${subject}
Propósito: ${purpose}
${context ? `Contexto adicional: ${context}` : ''}${businessInfo}${personalizationInfo}

CONTEXTO TEMPORAL:
- Hora actual: ${currentHour}:${now.getMinutes().toString().padStart(2, '0')} (${timeContext})
- Saludo apropiado: ${appropriateGreeting}

Instrucciones:
1. Crea un email profesional y bien estructurado
2. Usa un tono ${businessContext?.brandTone || 'profesional'} apropiado para el propósito indicado
3. OBLIGATORIO: Usa el saludo "${appropriateGreeting}" al inicio del email (nunca "Buenos días" por la tarde o "Buenas tardes" por la mañana)
4. Incluye un saludo, cuerpo del mensaje y despedida
5. Mantén un estilo claro y conciso
6. Adapta el contenido al propósito específico y al contexto empresarial
7. No incluyas el asunto en el cuerpo del email
8. Responde únicamente con el contenido del email, sin explicaciones adicionales
9. NO uses placeholders genéricos como Señor/Señora:, o/a, (nombre), (apellido), Sr./Sra., Estimado/a o similares
10. Usa saludos específicos y directos sin fórmulas genéricas con barras o paréntesis
${businessContext ? `11. Incorpora naturalmente la propuesta de valor y los mensajes clave de la empresa` : ''}
${qualificationData ? `12. PERSONALIZACIÓN OBLIGATORIA: Usa la información de personalización del destinatario para adaptar el contenido, tono y enfoque del email. Menciona temas de su interés, adapta el estilo de comunicación a sus preferencias, y haz referencias relevantes a su sector o respuestas del cuestionario` : ''}
${emailType === 'value' ? `${qualificationData ? '13' : '12'}. Enfócate en aportar valor educativo, consejos útiles o insights relevantes` : ''}
${emailType === 'sales' ? `${qualificationData ? '13' : '12'}. Incluye una llamada a la acción clara y persuasiva para generar conversiones` : ''}

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