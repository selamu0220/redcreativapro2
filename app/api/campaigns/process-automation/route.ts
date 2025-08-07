import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserCampaigns, 
  updateCampaign,
  getUserContacts,
  CampaignData,
  getUserByEmail
} from '../../../lib/database';

import nodemailer from 'nodemailer';

// Función para enviar email (reutiliza la lógica existente)
async function sendEmailToContacts(campaign: CampaignData, contacts: any[], userGmailCredentials: any) {
  try {
    console.log(`Enviando campaña ${campaign.name} a ${contacts.length} contactos`);
    
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

    // Enviar emails a todos los contactos suscritos
    for (const contact of contacts) {
      try {
        // Crear enlace de unsubscribe
        const unsubscribeUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/unsubscribe?token=${contact.unsubscribeToken}`;
        
        // Agregar enlace de unsubscribe al contenido
        const emailContent = `${campaign.content}\n\n---\n\nSi no deseas recibir más emails, puedes darte de baja aquí: ${unsubscribeUrl}`;

        const mailOptions = {
          from: userGmailCredentials.gmailUser,
          to: contact.email,
          subject: campaign.subject,
          text: emailContent,
          html: emailContent.replace(/\n/g, '<br>'),
        };

        await transporter.sendMail(mailOptions);
        
        // Registrar en el historial
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email-history`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-email': userGmailCredentials.gmailUser
            },
            body: JSON.stringify({
              campaignId: campaign.id,
              campaignName: campaign.name,
              subject: campaign.subject,
              recipientEmail: contact.email,
              recipientName: contact.name,
              status: 'sent',
              emailType: 'automated',
              templateId: campaign.templateId || 'automated',
              templateName: campaign.templateName || 'Plantilla automatizada',
              tags: ['automatizada', ...(campaign.tags || [])]
            })
          });
        } catch (historyError) {
          console.error('Error registering email history:', historyError);
        }
        
        successCount++;
      } catch (error) {
        console.error(`Error sending email to ${contact.email}:`, error);
        errorCount++;
      }
    }
    
    // Simular métricas de apertura y clicks (en producción esto vendría del proveedor de email)
    const openRate = Math.random() * 0.4 + 0.15; // 15-55% open rate
    const clickRate = Math.random() * 0.15 + 0.02; // 2-17% click rate
    
    const opensSimulated = Math.floor(successCount * openRate);
    const clicksSimulated = Math.floor(opensSimulated * clickRate);
    
    return {
      sent: successCount,
      opens: opensSimulated,
      clicks: clicksSimulated,
      bounces: errorCount,
      unsubscribes: Math.floor(successCount * 0.005) // 0.5% unsubscribe rate
    };
  } catch (error) {
    console.error('Error enviando emails:', error);
    throw error;
  }
}

// Función para generar nuevo contenido con IA
async function generateNewContent(campaign: CampaignData, userApiKey?: string): Promise<{ subject: string; content: string }> {
  try {
    const apiKey = userApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('API key no disponible');
    }

    const aiSettings = campaign.aiSettings;
    if (!aiSettings) {
      return { subject: campaign.subject, content: campaign.content };
    }

    // Analizar rendimiento previo para mejorar
    const previousMetrics = campaign.metrics;
    const performanceContext = previousMetrics ? 
      `Métricas previas: Open Rate ${previousMetrics.openRate}%, Click Rate ${previousMetrics.clickRate}%. ` : '';

    const prompt = `
${performanceContext}Crea un nuevo email de marketing mejorado basado en:
- Tema: ${aiSettings.contentTheme}
- Audiencia: ${aiSettings.targetAudience}
- Tono: ${aiSettings.tone}
- Email anterior: ${campaign.subject}

Mejora el rendimiento creando:
- Asunto más atractivo y optimizado
- Contenido más persuasivo
- Call-to-action más efectivo
- Personalización mejorada

Devuelve SOLO un JSON:
{
  "subject": "Nuevo asunto optimizado",
  "content": "Nuevo contenido en HTML"
}
`;

    const modelEndpoint = userApiKey ? 'gemini-2.5-flash-lite' : 'gemini-1.5-flash-latest';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelEndpoint}:generateContent?key=${apiKey}`, {
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
      const emailData = JSON.parse(jsonMatch[0]);
      return {
        subject: emailData.subject || campaign.subject,
        content: emailData.content || campaign.content
      };
    }
    
    return { subject: campaign.subject, content: campaign.content };
  } catch (error) {
    console.error('Error generando nuevo contenido:', error);
    return { subject: campaign.subject, content: campaign.content };
  }
}

// Función para procesar A/B testing
function processABTesting(campaign: CampaignData): { winnerVariant?: any; shouldDeclareWinner: boolean } {
  if (!campaign.abTestSettings?.isEnabled || !campaign.abTestSettings.variants) {
    return { shouldDeclareWinner: false };
  }

  const variants = campaign.abTestSettings.variants;
  const testDuration = campaign.abTestSettings.testDuration || 24; // horas
  const criteria = campaign.abTestSettings.winnerCriteria || 'open_rate';

  // Verificar si ha pasado suficiente tiempo
  const campaignAge = Date.now() - new Date(campaign.createdAt).getTime();
  const hoursElapsed = campaignAge / (1000 * 60 * 60);

  if (hoursElapsed < testDuration) {
    return { shouldDeclareWinner: false };
  }

  // Calcular métricas para cada variante
  const variantsWithMetrics = variants.map(variant => {
    const openRate = variant.sentCount > 0 ? (variant.openCount / variant.sentCount) * 100 : 0;
    const clickRate = variant.openCount > 0 ? (variant.clickCount / variant.openCount) * 100 : 0;
    
    return {
      ...variant,
      openRate,
      clickRate,
      score: criteria === 'open_rate' ? openRate : clickRate
    };
  });

  // Encontrar el ganador
  const winner = variantsWithMetrics.reduce((best, current) => 
    current.score > best.score ? current : best
  );

  return {
    winnerVariant: winner,
    shouldDeclareWinner: true
  };
}

// POST - Procesar automatizaciones (endpoint para cron job)
export async function POST(request: NextRequest) {
  try {
    // Verificar autorización (esto debería ser un token de sistema o cron job)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.AUTOMATION_TOKEN || 'automation-secret-token';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const now = new Date();
    const results = {
      processed: 0,
      sent: 0,
      errors: 0,
      abTestsProcessed: 0,
      contentGenerated: 0
    };

    // Obtener todas las campañas automatizadas activas
    const allCampaigns = getUserCampaigns(''); // Obtener todas las campañas
    const automatedCampaigns = allCampaigns.filter(campaign => 
      campaign.isAutomated && 
      campaign.automationSettings?.isActive &&
      campaign.status === 'automated'
    );

    console.log(`Procesando ${automatedCampaigns.length} campañas automatizadas`);

    for (const campaign of automatedCampaigns) {
      try {
        results.processed++;
        
        // Verificar si es hora de enviar
        const nextSendDate = campaign.automationSettings?.nextSendDate;
        if (!nextSendDate || new Date(nextSendDate) > now) {
          continue;
        }

        // Verificar límites de envío
        const maxEmails = campaign.automationSettings?.maxEmails;
        const sentCount = campaign.automationSettings?.sentCount || 0;
        if (maxEmails && sentCount >= maxEmails) {
          // Pausar campaña si se alcanzó el límite
          updateCampaign(campaign.id, {
            status: 'paused',
            automationSettings: {
              ...campaign.automationSettings,
              isActive: false
            }
          });
          continue;
        }

        // Obtener contactos del usuario
        const contacts = getUserContacts(campaign.userEmail);
        const subscribedContacts = contacts.filter(contact => contact.isSubscribed);

        if (subscribedContacts.length === 0) {
          continue;
        }

        // Obtener credenciales del usuario
        const user = getUserByEmail(campaign.userEmail);
        if (!user) {
          continue;
        }

        // Generar nuevo contenido si está habilitado
        let emailToSend = { subject: campaign.subject, content: campaign.content };
        if (campaign.aiSettings?.generateContent) {
          emailToSend = await generateNewContent(campaign, user.aiStudioApiKey);
          results.contentGenerated++;
        }

        // Procesar A/B testing si está habilitado
        if (campaign.abTestSettings?.isEnabled) {
          const abResult = processABTesting(campaign);
          if (abResult.shouldDeclareWinner && abResult.winnerVariant) {
            // Usar el contenido ganador
            emailToSend = {
              subject: abResult.winnerVariant.subject,
              content: abResult.winnerVariant.content || campaign.content
            };
            
            // Marcar ganador
            const updatedVariants = campaign.abTestSettings.variants?.map(v => ({
              ...v,
              winnerDeclared: v.id === abResult.winnerVariant.id
            }));

            updateCampaign(campaign.id, {
              abTestSettings: {
                ...campaign.abTestSettings,
                variants: updatedVariants
              }
            });
            
            results.abTestsProcessed++;
          }
        }

        // Enviar emails
        const sendResult = await sendEmailToContacts(
          { ...campaign, subject: emailToSend.subject, content: emailToSend.content },
          subscribedContacts,
          { gmailUser: user.gmailUser, gmailPassword: user.gmailPassword }
        );

        // Calcular próxima fecha de envío
        const nextSend = new Date(now);
        const frequency = campaign.automationSettings?.frequency;
        if (frequency === 'daily') {
          nextSend.setDate(nextSend.getDate() + 1);
        } else if (frequency === 'every3days') {
          nextSend.setDate(nextSend.getDate() + 3);
        } else if (frequency === 'weekly') {
          nextSend.setDate(nextSend.getDate() + 7);
        } else if (frequency === 'custom' && campaign.automationSettings?.customDays) {
          nextSend.setDate(nextSend.getDate() + campaign.automationSettings.customDays);
        }

        // Actualizar campaña con nuevas métricas
        const newOpenCount = campaign.openCount + sendResult.opens;
        const newClickCount = campaign.clickCount + sendResult.clicks;
        const newUnsubscribeCount = campaign.unsubscribeCount + sendResult.unsubscribes;
        const newRecipientCount = campaign.recipientCount + sendResult.sent;

        const openRate = newRecipientCount > 0 ? (newOpenCount / newRecipientCount) * 100 : 0;
        const clickRate = newOpenCount > 0 ? (newClickCount / newOpenCount) * 100 : 0;
        const unsubscribeRate = newRecipientCount > 0 ? (newUnsubscribeCount / newRecipientCount) * 100 : 0;

        updateCampaign(campaign.id, {
          subject: emailToSend.subject,
          content: emailToSend.content,
          openCount: newOpenCount,
          clickCount: newClickCount,
          unsubscribeCount: newUnsubscribeCount,
          recipientCount: newRecipientCount,
          sentAt: now.toISOString(),
          automationSettings: {
            ...campaign.automationSettings,
            nextSendDate: nextSend.toISOString(),
            sentCount: sentCount + 1,
            isActive: true
          },
          metrics: {
            openRate: Math.round(openRate * 100) / 100,
            clickRate: Math.round(clickRate * 100) / 100,
            unsubscribeRate: Math.round(unsubscribeRate * 100) / 100,
            bounceRate: campaign.metrics?.bounceRate || 0,
            conversionRate: campaign.metrics?.conversionRate || 0,
            revenueGenerated: campaign.metrics?.revenueGenerated || 0,
            lastCalculated: now.toISOString()
          }
        });

        results.sent += sendResult.sent;
        
      } catch (error) {
        console.error(`Error procesando campaña ${campaign.id}:`, error);
        results.errors++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Automatizaciones procesadas exitosamente',
      results,
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error('Error procesando automatizaciones:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// GET - Obtener estado de automatizaciones
export async function GET(request: NextRequest) {
  try {
    const allCampaigns = getUserCampaigns('');
    const automatedCampaigns = allCampaigns.filter(campaign => campaign.isAutomated);
    
    const stats = {
      totalAutomated: automatedCampaigns.length,
      active: automatedCampaigns.filter(c => c.automationSettings?.isActive).length,
      paused: automatedCampaigns.filter(c => c.status === 'paused').length,
      withABTesting: automatedCampaigns.filter(c => c.abTestSettings?.isEnabled).length,
      totalEmailsSent: automatedCampaigns.reduce((sum, c) => sum + (c.automationSettings?.sentCount || 0), 0),
      averageOpenRate: automatedCampaigns.length > 0 ? 
        automatedCampaigns.reduce((sum, c) => sum + (c.metrics?.openRate || 0), 0) / automatedCampaigns.length : 0,
      averageClickRate: automatedCampaigns.length > 0 ? 
        automatedCampaigns.reduce((sum, c) => sum + (c.metrics?.clickRate || 0), 0) / automatedCampaigns.length : 0
    };

    return NextResponse.json({
      stats,
      nextProcessing: 'Cada hora', // En producción esto sería configurable
      lastProcessed: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error obteniendo estado de automatizaciones:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}