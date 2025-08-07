import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserCampaigns, 
  updateCampaign,
  getUserByEmail,
  getUserContacts,
  CampaignData 
} from '../../../lib/database';
import fs from 'fs';
import path from 'path';

// Configuración para export estático
export const dynamic = 'force-static';
export const revalidate = false;

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

const BUSINESS_CONTEXT_FILE = path.join(process.cwd(), 'data', 'business-context.json');

// Leer contexto empresarial del usuario
const getUserBusinessContext = (userEmail: string): BusinessContext | null => {
  try {
    if (!fs.existsSync(BUSINESS_CONTEXT_FILE)) {
      return null;
    }
    
    const data = fs.readFileSync(BUSINESS_CONTEXT_FILE, 'utf8');
    const contexts: UserBusinessContext = JSON.parse(data);
    return contexts[userEmail] || null;
  } catch (error) {
    console.error('Error reading business context:', error);
    return null;
  }
};

// Determinar tipo de email basado en estrategia 4:1
const determineEmailType = (campaign: CampaignData, userEmail: string): 'value' | 'sales' => {
  // Obtener historial de emails enviados para esta campaña
  const emailHistory = campaign.emailHistory || [];
  const recentEmails = emailHistory.slice(-4); // Últimos 4 emails
  
  // Contar emails de venta en los últimos 4
  const salesEmails = recentEmails.filter(email => email.type === 'sales').length;
  
  // Si ya hay un email de venta en los últimos 4, enviar email de valor
  if (salesEmails >= 1) {
    return 'value';
  }
  
  // Si no hay emails de venta recientes, determinar si es momento de venta
  // Estrategia: 4 de valor, 1 de venta
  const valueEmails = recentEmails.filter(email => email.type === 'value').length;
  
  if (valueEmails >= 4) {
    return 'sales';
  }
  
  return 'value';
};

// Función para generar contenido de email con IA
async function generateEmailContent(
  campaign: CampaignData, 
  userEmail: string,
  previousMetrics?: any,
  apiKey?: string
): Promise<{ subject: string; content: string; emailType: 'value' | 'sales' }> {
  // Obtener contexto empresarial y determinar tipo de email fuera del try block
  const businessContext = getUserBusinessContext(userEmail);
  const emailType = determineEmailType(campaign, userEmail);
  
  try {
    const geminiApiKey = apiKey || process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error('API key de Gemini no disponible');
    }

    // Construir contexto basado en métricas previas
    let performanceContext = '';
    if (previousMetrics) {
      performanceContext = `
Métricas de emails anteriores:
- Tasa de apertura: ${previousMetrics.openRate}%
- Tasa de clics: ${previousMetrics.clickRate}%
- Tasa de desuscripción: ${previousMetrics.unsubscribeRate}%

Optimiza el contenido basándote en estas métricas.`;
    }

    // Construir información del contexto empresarial
    let businessInfo = '';
    if (businessContext) {
      businessInfo = `

=== CONTEXTO EMPRESARIAL ===
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

    // Extraer información adicional del contenido existente para contexto
    const existingContent = campaign.content || '';
    const contentContext = existingContent.length > 100 ? 
      `\nContenido base de referencia: ${existingContent.substring(0, 500)}...` : 
      `\nContenido base: ${existingContent}`;
    
    // Analizar el contenido para extraer el objetivo/propósito
    const contentAnalysis = existingContent.toLowerCase();
    let campaignPurpose = 'marketing general';
    if (contentAnalysis.includes('roi') || contentAnalysis.includes('retorno')) {
      campaignPurpose = 'optimización de ROI y conversiones';
    } else if (contentAnalysis.includes('venta') || contentAnalysis.includes('producto')) {
      campaignPurpose = 'generación de ventas';
    } else if (contentAnalysis.includes('consulta') || contentAnalysis.includes('servicio')) {
      campaignPurpose = 'generación de leads y consultas';
    } else if (contentAnalysis.includes('suscri') || contentAnalysis.includes('registro')) {
      campaignPurpose = 'captación de suscriptores';
    }

    // Determinar instrucciones específicas según el tipo de email
    const emailTypeInstructions = emailType === 'sales' 
      ? `
=== INSTRUCCIONES PARA EMAIL DE VENTA ===
Este es un email de VENTA (1 de cada 5 emails). Debe:
- Incluir una oferta clara o llamada a la acción de compra
- Presentar beneficios específicos del producto/servicio
- Crear urgencia o escasez si es apropiado
- Incluir testimonios o prueba social si es relevante
- Tener un CTA directo hacia la conversión`
      : `
=== INSTRUCCIONES PARA EMAIL DE VALOR ===
Este es un email de VALOR (4 de cada 5 emails). Debe:
- Proporcionar información útil, tips, o insights valiosos
- Educar a la audiencia sobre el tema relacionado con el negocio
- Construir confianza y autoridad en el sector
- NO incluir ofertas directas de venta
- Tener un CTA suave hacia contenido adicional o engagement`;

    const prompt = `
Genera un email marketing profesional con las siguientes especificaciones:

=== INFORMACIÓN DE LA CAMPAÑA ===
Nombre de campaña: ${campaign.name}
Descripción: ${campaign.description || 'No especificada'}
Tipo de negocio: ${campaign.businessType || 'No especificado'}
Objetivo principal: ${campaign.goal || 'No especificado'}
Asunto base: ${campaign.subject}
Propósito identificado: ${campaignPurpose}
Tono: ${campaign.aiSettings?.tone || 'professional'}
Tema/Industria: ${campaign.aiSettings?.contentTheme || 'marketing digital'}
Longitud: ${campaign.aiSettings?.contentLength || 'medium'}
${contentContext}
${performanceContext}
${businessInfo}

${emailTypeInstructions}

=== CONTEXTO ADICIONAL ===
Esta campaña busca: ${campaign.goal || campaignPurpose}
Tipo de negocio: ${campaign.businessType || 'Empresa general'}
Audiencia objetivo: ${campaign.aiSettings?.targetAudience || 'Clientes potenciales'}
Objetivo específico: ${campaign.goal || 'Generar leads cualificados y consultas de alta calidad'}

=== REQUISITOS ESPECÍFICOS ===
1. Crear un asunto atractivo que genere altas tasas de apertura (objetivo: >25%)
2. Contenido que motive a la acción y genere clics (objetivo: >3%)
3. Incluir llamadas a la acción apropiadas para el tipo de email (${emailType})
4. Personalización que aumente el engagement
5. Evitar palabras que activen filtros de spam
6. Optimizar para ROI de €30-40 por €1 invertido
7. Mantener coherencia con el propósito de la campaña: ${campaignPurpose}
8. Incluir elementos de urgencia o escasez cuando sea apropiado (especialmente en emails de venta)
9. Usar datos específicos y beneficios tangibles
10. Estructura clara: gancho inicial + problema + solución + beneficios + CTA
${businessContext ? '11. Incorporar la propuesta de valor y mensajes clave del negocio de manera natural' : ''}

=== FORMATO DE RESPUESTA ===
Devuelve SOLO un JSON con esta estructura exacta:
{
  "subject": "Asunto optimizado del email",
  "content": "Contenido completo del email en HTML"
}
`;

    const modelEndpoint = apiKey ? 'gemini-2.5-flash-lite' : 'gemini-1.5-flash-latest';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelEndpoint}:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Error en la API de Gemini');
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Extraer JSON del texto generado
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const emailData = JSON.parse(jsonMatch[0]);
      return {
        subject: emailData.subject || `${campaign.subject} - ${new Date().toLocaleDateString()}`,
        content: emailData.content || '<p>Contenido generado automáticamente</p>',
        emailType
      };
    }
    
    // Fallback si no se puede parsear el JSON
    return {
      subject: `${campaign.subject} - ${new Date().toLocaleDateString()}`,
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>¡Hola!</h2>
          <p>Este es un email generado automáticamente para la campaña: ${campaign.name}</p>
          <p>Tema: ${campaign.aiSettings?.contentTheme || 'Contenido general'}</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>¿Sabías que el email marketing puede generar €30-40 por cada €1 invertido?</strong></p>
            <p>Nuestras campañas automatizadas con IA están diseñadas para maximizar tu ROI.</p>
          </div>
          <a href="#" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Saber Más</a>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">Si no deseas recibir más emails, <a href="#">desuscríbete aquí</a>.</p>
        </div>
      `,
      emailType
    };
  } catch (error) {
    console.error('Error generando contenido:', error);
    
    // Contenido de fallback
    return {
      subject: `${campaign.subject} - ${new Date().toLocaleDateString()}`,
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>¡Hola!</h2>
          <p>Este es un email de la campaña: ${campaign.name}</p>
          <p>Gracias por ser parte de nuestra comunidad.</p>
          <a href="#" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Ver Más</a>
        </div>
      `,
      emailType
    };
  }
}

// Función para generar variantes de A/B testing
async function generateABTestVariants(
  baseSubject: string, 
  baseContent: string,
  apiKey?: string
): Promise<Array<{ subject: string; content: string }>> {
  try {
    const geminiApiKey = apiKey || process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return [{ subject: baseSubject, content: baseContent }];
    }

    const prompt = `
Genera 2 variantes adicionales para A/B testing basadas en:

Asunto original: ${baseSubject}
Contenido original: ${baseContent}

Crea variantes que:
1. Prueben diferentes enfoques de asunto (urgencia vs curiosidad)
2. Varíen el contenido manteniendo el mensaje principal
3. Optimicen para diferentes tipos de audiencia

Devuelve SOLO un JSON con esta estructura:
{
  "variants": [
    {
      "subject": "Variante 1 del asunto",
      "content": "Variante 1 del contenido en HTML"
    },
    {
      "subject": "Variante 2 del asunto",
      "content": "Variante 2 del contenido en HTML"
    }
  ]
}
`;

    const modelEndpoint = apiKey ? 'gemini-2.5-flash-lite' : 'gemini-1.5-flash-latest';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelEndpoint}:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Error en la API de Gemini');
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const variantsData = JSON.parse(jsonMatch[0]);
      return variantsData.variants || [{ subject: baseSubject, content: baseContent }];
    }
    
    return [{ subject: baseSubject, content: baseContent }];
  } catch (error) {
    console.error('Error generando variantes A/B:', error);
    return [{ subject: baseSubject, content: baseContent }];
  }
}

// Función para enviar emails usando Nodemailer
async function sendEmail(
  to: string[], 
  subject: string, 
  content: string,
  campaignId: string,
  userGmailCredentials: { gmailUser: string; gmailPassword: string }
): Promise<{ sent: number; opens: number; clicks: number; unsubscribes: number }> {
  const nodemailer = require('nodemailer');
  
  console.log(`Enviando email de campaña ${campaignId}:`);
  console.log(`- Destinatarios: ${to.length}`);
  console.log(`- Asunto: ${subject}`);
  
  // Configurar transporter de nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: userGmailCredentials.gmailUser,
      pass: userGmailCredentials.gmailPassword,
    },
  });

  let successCount = 0;
  let errorCount = 0;

  // Enviar emails a todos los destinatarios
  for (const email of to) {
    try {
      const mailOptions = {
        from: userGmailCredentials.gmailUser,
        to: email,
        subject: subject,
        text: content,
        html: content.replace(/\n/g, '<br>'),
      };

      await transporter.sendMail(mailOptions);
      successCount++;
      
      // Registrar en el historial de emails
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email-history`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': userGmailCredentials.gmailUser
          },
          body: JSON.stringify({
            campaignId: campaignId,
            campaignName: `Campaña Automatizada ${campaignId}`,
            subject: subject,
            recipientEmail: email,
            status: 'sent',
            emailType: 'automated',
            templateId: 'automated',
            templateName: 'Plantilla automatizada',
            tags: ['automatizada', 'cron']
          })
        });
      } catch (historyError) {
        console.error('Error registering email history:', historyError);
      }
    } catch (error) {
      console.error(`Error sending email to ${email}:`, error);
      errorCount++;
    }
  }
  
  // Simular métricas realistas (en producción esto vendría del proveedor de email)
  const opens = Math.floor(successCount * (0.20 + Math.random() * 0.15)); // 20-35% open rate
  const clicks = Math.floor(opens * (0.02 + Math.random() * 0.06)); // 2-8% click rate
  const unsubscribes = Math.floor(successCount * (0.001 + Math.random() * 0.004)); // 0.1-0.5% unsubscribe
  
  return { sent: successCount, opens, clicks, unsubscribes };
}

// Función para calcular próxima fecha de envío
function calculateNextSendDate(frequency: string, customDays?: number): string {
  const now = new Date();
  let nextDate: Date;
  
  switch (frequency) {
    case 'daily':
      nextDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      break;
    case 'every3days':
      nextDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      break;
    case 'weekly':
      nextDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      break;
    case 'custom':
      const days = customDays || 7;
      nextDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      break;
    default:
      nextDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
  
  return nextDate.toISOString();
}

// POST - Procesar campañas automatizadas (llamado por cron job)
export async function POST(request: NextRequest) {
  try {
    console.log('🤖 Iniciando procesamiento de campañas automatizadas...');
    
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'default-secret';
    
    // Verificar autorización para cron jobs
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const now = new Date();
    const processedCampaigns = [];
    const errors = [];

    // Obtener email del usuario de la cabecera o usar usuarios de prueba
    const requestUserEmail = request.headers.get('x-user-email');
    const testUsers = requestUserEmail ? [requestUserEmail] : ['selamu.garcia@gmail.com'];
    
    for (const userEmail of testUsers) {
      try {
        // Obtener credenciales de Gmail del usuario
        const user = getUserByEmail(userEmail);
        if (!user || !user.gmailUser || !user.gmailPassword) {
          console.log(`⚠️ Usuario ${userEmail}: credenciales de Gmail no configuradas`);
          continue;
        }

        const userGmailCredentials = {
          gmailUser: user.gmailUser,
          gmailPassword: user.gmailPassword
        };

        const campaigns = getUserCampaigns(userEmail);
        const automatedCampaigns = campaigns.filter(campaign => 
          campaign.isAutomated && 
          campaign.automationSettings?.isActive &&
          (campaign.status === 'active' || campaign.status === 'automated')
        );

        console.log(`📧 Usuario ${userEmail}: ${automatedCampaigns.length} campañas activas`);

        for (const campaign of automatedCampaigns) {
          try {
            const settings = campaign.automationSettings!;
            
            // Verificar si es hora de enviar
            const nextSendDate = new Date(settings.nextSendDate || 0);
            if (nextSendDate > now) {
              console.log(`⏰ Campaña ${campaign.name}: próximo envío ${nextSendDate.toISOString()}`);
              continue;
            }

            // Verificar límites
            const sentCount = settings.sentCount || 0;
            const maxEmails = settings.maxEmailsPerCampaign || settings.maxEmails || 1000;
            if (sentCount >= maxEmails) {
              console.log(`🛑 Campaña ${campaign.name}: límite alcanzado (${sentCount}/${maxEmails})`);
              
              // Desactivar campaña
              const updatedCampaign: CampaignData = {
                ...campaign,
                status: 'completed',
                automationSettings: {
                  ...settings,
                  isActive: false
                },
                updatedAt: now.toISOString()
              };
              
              updateCampaign(userEmail, updatedCampaign);
              continue;
            }

            // Verificar fecha de finalización
            if (settings.endDate && new Date(settings.endDate) <= now) {
              console.log(`📅 Campaña ${campaign.name}: fecha de finalización alcanzada`);
              
              const updatedCampaign: CampaignData = {
                ...campaign,
                status: 'completed',
                automationSettings: {
                  ...settings,
                  isActive: false
                },
                updatedAt: now.toISOString()
              };
              
              updateCampaign(userEmail, updatedCampaign);
              continue;
            }

            console.log(`🚀 Procesando campaña: ${campaign.name}`);

            // Generar contenido con IA
            const emailContent = await generateEmailContent(campaign, userEmail, campaign.metrics);
            
            // Obtener contactos reales del usuario
            const userContacts = getUserContacts(userEmail);
            const contacts = userContacts
              .filter(contact => contact.isSubscribed)
              .map(contact => contact.email);

            let results;
            
            // Manejar A/B testing si está habilitado
            if (campaign.abTestSettings?.isEnabled) {
              console.log(`🧪 Generando variantes A/B para ${campaign.name}`);
              
              const variants = await generateABTestVariants(emailContent.subject, emailContent.content);
              const allVariants = [emailContent, ...variants];
              
              // Dividir contactos entre variantes
              const contactsPerVariant = Math.floor(contacts.length / allVariants.length);
              let totalResults = { sent: 0, opens: 0, clicks: 0, unsubscribes: 0 };
              
              for (let i = 0; i < allVariants.length; i++) {
                const variantContacts = contacts.slice(
                  i * contactsPerVariant, 
                  i === allVariants.length - 1 ? contacts.length : (i + 1) * contactsPerVariant
                );
                
                if (variantContacts.length > 0) {
                  const variantResults = await sendEmail(
                    variantContacts,
                    allVariants[i].subject,
                    allVariants[i].content,
                    campaign.id,
                    userGmailCredentials
                  );
                  
                  totalResults.sent += variantResults.sent;
                  totalResults.opens += variantResults.opens;
                  totalResults.clicks += variantResults.clicks;
                  totalResults.unsubscribes += variantResults.unsubscribes;
                }
              }
              
              results = totalResults;
            } else {
              // Envío normal sin A/B testing
              results = await sendEmail(contacts, emailContent.subject, emailContent.content, campaign.id, userGmailCredentials);
            }

            // Calcular métricas
            const newOpenRate = results.sent > 0 ? (results.opens / results.sent) * 100 : 0;
            const newClickRate = results.opens > 0 ? (results.clicks / results.opens) * 100 : 0;
            const newUnsubscribeRate = results.sent > 0 ? (results.unsubscribes / results.sent) * 100 : 0;
            
            // Calcular ROI estimado (€30-40 por €1 invertido)
            const costPerEmail = 0.01; // €0.01 por email
            const totalCost = results.sent * costPerEmail;
            const baseROI = 35; // €35 por €1
            const performanceMultiplier = Math.max(0.1, (newOpenRate / 25 + newClickRate / 3) / 2);
            const estimatedRevenue = totalCost * baseROI * performanceMultiplier;

            // Crear entrada del historial de emails
            const emailHistoryEntry = {
              id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: emailContent.emailType,
              subject: emailContent.subject,
              sentAt: now.toISOString(),
              openCount: results.opens,
              clickCount: results.clicks
            };

            // Actualizar campaña
            const updatedCampaign: CampaignData = {
              ...campaign,
              openCount: campaign.openCount + results.opens,
              clickCount: campaign.clickCount + results.clicks,
              unsubscribeCount: campaign.unsubscribeCount + results.unsubscribes,
              automationSettings: {
                ...settings,
                sentCount: (settings.sentCount || 0) + results.sent,
                nextSendDate: calculateNextSendDate(settings.frequency || 'weekly', settings.customDays),
                lastSentDate: now.toISOString()
              },
              metrics: {
                ...campaign.metrics,
                openRate: newOpenRate,
                clickRate: newClickRate,
                unsubscribeRate: newUnsubscribeRate,
                revenue: (campaign.metrics?.revenue || 0) + estimatedRevenue
              },
              emailHistory: [
                ...(campaign.emailHistory || []),
                emailHistoryEntry
              ],
              sentAt: now.toISOString(),
              updatedAt: now.toISOString()
            };

            const success = updateCampaign(userEmail, updatedCampaign);
            
            if (success) {
              processedCampaigns.push({
                campaignId: campaign.id,
                campaignName: campaign.name,
                userEmail,
                emailsSent: results.sent,
                opens: results.opens,
                clicks: results.clicks,
                estimatedRevenue: Math.round(estimatedRevenue * 100) / 100,
                nextSendDate: updatedCampaign.automationSettings?.nextSendDate
              });
              
              console.log(`✅ Campaña ${campaign.name} procesada: ${results.sent} emails enviados`);
            } else {
              errors.push(`Error actualizando campaña ${campaign.name}`);
            }

          } catch (campaignError) {
            console.error(`Error procesando campaña ${campaign.name}:`, campaignError);
            errors.push(`Error en campaña ${campaign.name}: ${campaignError instanceof Error ? campaignError.message : String(campaignError)}`);
          }
        }
      } catch (userError) {
        console.error(`Error procesando usuario ${userEmail}:`, userError);
        errors.push(`Error en usuario ${userEmail}: ${userError instanceof Error ? userError.message : String(userError)}`);
      }
    }

    console.log(`🎉 Procesamiento completado: ${processedCampaigns.length} campañas procesadas`);

    return NextResponse.json({
      success: true,
      processedAt: now.toISOString(),
      campaignsProcessed: processedCampaigns.length,
      totalEmailsSent: processedCampaigns.reduce((sum, c) => sum + c.emailsSent, 0),
      totalRevenue: processedCampaigns.reduce((sum, c) => sum + c.estimatedRevenue, 0),
      campaigns: processedCampaigns,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error en procesamiento de campañas:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

// GET - Estado del procesador de campañas
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    
    // Obtener estadísticas básicas
    const testUsers = ['selamu.garcia@gmail.com'];
    let totalCampaigns = 0;
    let activeCampaigns = 0;
    let pendingCampaigns = 0;
    
    for (const userEmail of testUsers) {
      const campaigns = getUserCampaigns(userEmail);
      const automated = campaigns.filter(c => c.isAutomated);
      
      totalCampaigns += automated.length;
      activeCampaigns += automated.filter(c => 
        c.automationSettings?.isActive && c.status === 'active'
      ).length;
      
      pendingCampaigns += automated.filter(c => {
        if (!c.automationSettings?.isActive || c.status !== 'active') return false;
        const nextSend = new Date(c.automationSettings.nextSendDate || 0);
        return nextSend <= now;
      }).length;
    }

    return NextResponse.json({
      status: 'operational',
      timestamp: now.toISOString(),
      statistics: {
        totalAutomatedCampaigns: totalCampaigns,
        activeCampaigns,
        pendingProcessing: pendingCampaigns,
        nextProcessingWindow: new Date(now.getTime() + 60 * 60 * 1000).toISOString() // próxima hora
      },
      configuration: {
        processingInterval: '1 hour',
        maxEmailsPerBatch: 1000,
        aiContentGeneration: true,
        abTestingEnabled: true
      }
    });

  } catch (error) {
    console.error('Error obteniendo estado del procesador:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}