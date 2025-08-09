import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { GeminiClient } from '../../lib/gemini-client';


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

const BUSINESS_CONTEXT_FILE = path.join(process.cwd(), 'data', 'business-context.json');
const CONTACTS_FILE = path.join(process.cwd(), 'data', 'contacts.json');

// Leer contexto empresarial del usuario
const getUserBusinessContext = async (userEmail: string): Promise<BusinessContext | null> => {
  try {
    const data = await fs.readFile(BUSINESS_CONTEXT_FILE, 'utf8');
    const contexts: UserBusinessContext = JSON.parse(data);
    return contexts[userEmail] || null;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return null;
    }
    console.error('Error reading business context:', error);
    return null;
  }
};

// Leer datos de cualificación del contacto
const getContactQualificationData = async (contactEmail: string): Promise<QualificationData | null> => {
  try {
    const data = await fs.readFile(CONTACTS_FILE, 'utf8');
    const contacts: ContactData[] = JSON.parse(data);
    const contact = contacts.find(c => c.email === contactEmail);
    return contact?.qualificationData || null;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return null;
    }
    console.error('Error reading contact qualification data:', error);
    return null;
  }
};

export async function POST(request: NextRequest) {
  try {
    const { recipient, subject, purpose, context, emailType } = await request.json();

    if (!recipient || !subject || !purpose) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    // Obtener configuración de API desde headers o usar valores por defecto
    const apiKey = request.headers.get('x-api-key') || process.env.GEMINI_API_KEY;
    const model = request.headers.get('x-model') || 'gemini-1.5-flash';
    const temperature = parseFloat(request.headers.get('x-temperature') || '0.7');
    const maxTokens = parseInt(request.headers.get('x-max-tokens') || '1000');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key no configurada' },
        { status: 400 }
      );
    }

    // Obtener contexto empresarial del usuario
    const userEmail = request.headers.get('x-user-email');
    const businessContext = userEmail ? await getUserBusinessContext(userEmail) : null;
    
    // Obtener datos de cualificación del contacto destinatario
    const qualificationData = await getContactQualificationData(recipient);
    
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
    
    // Construir el prompt para generar el email
    const prompt = `Genera un email profesional con las siguientes características:

Destinatario: ${recipient}
Asunto: ${subject}
Propósito: ${purpose}
${context ? `Contexto adicional: ${context}` : ''}${businessInfo}${personalizationInfo}

Instrucciones:
1. Crea un email profesional y bien estructurado
2. Usa un tono ${businessContext?.brandTone || 'profesional'} apropiado para el propósito indicado
3. Incluye un saludo, cuerpo del mensaje y despedida
4. Mantén un estilo claro y conciso
5. Adapta el contenido al propósito específico y al contexto empresarial
6. No incluyas el asunto en el cuerpo del email
7. Responde únicamente con el contenido del email, sin explicaciones adicionales
8. NO uses placeholders genéricos como Señor/Señora:, o/a, (nombre), (apellido), Sr./Sra., Estimado/a o similares
9. Usa saludos específicos y directos sin fórmulas genéricas con barras o paréntesis
${businessContext ? `10. Incorpora naturalmente la propuesta de valor y los mensajes clave de la empresa` : ''}
${qualificationData ? `11. PERSONALIZACIÓN OBLIGATORIA: Usa la información de personalización del destinatario para adaptar el contenido, tono y enfoque del email. Menciona temas de su interés, adapta el estilo de comunicación a sus preferencias, y haz referencias relevantes a su sector o respuestas del cuestionario` : ''}
${emailType === 'value' ? `${qualificationData ? '12' : '11'}. Enfócate en aportar valor educativo, consejos útiles o insights relevantes` : ''}
${emailType === 'sales' ? `${qualificationData ? '12' : '11'}. Incluye una llamada a la acción clara y persuasiva para generar conversiones` : ''}

Email:`;

    // Crear cliente de Gemini
    const geminiClient = new GeminiClient({
      apiKey,
      model,
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 30000
    });

    // Llamar a la API de Gemini usando el cliente mejorado
    const result = await geminiClient.generateContent({
      prompt,
      temperature,
      maxTokens,
      topP: 0.8,
      topK: 40
    });

    if (!result.success) {
      console.error('❌ Gemini API Error:', result.error);
      
      // Devolver error con mensaje amigable para el usuario
      const userMessage = geminiClient.getUserFriendlyErrorMessage(result.error!);
      
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

    console.log('✅ Gemini API Success:', {
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
    console.error('Error en generate-email:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}