import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserCampaigns, 
  createCampaign, 
  updateCampaign,
  deleteCampaign,
  getUserContacts,
  CampaignData 
} from '../../../lib/database';

// Función para generar contenido con IA
async function generateEmailContent(theme: string, audience: string, tone: string, userApiKey?: string): Promise<{ subject: string; content: string }> {
  try {
    const apiKey = userApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('API key no disponible');
    }

    const prompt = `
Crea un email de marketing altamente efectivo con las siguientes características:
- Tema: ${theme}
- Audiencia: ${audience}
- Tono: ${tone}
- Objetivo: Maximizar el ROI y las conversiones
- Incluir call-to-action persuasivo
- Optimizado para evitar spam
- Longitud ideal para email marketing

Devuelve SOLO un JSON con esta estructura exacta:
{
  "subject": "Asunto del email optimizado para alta apertura",
  "content": "Contenido completo del email en HTML"
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
    
    // Extraer JSON del texto generado
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const emailData = JSON.parse(jsonMatch[0]);
      return {
        subject: emailData.subject || 'Email generado por IA',
        content: emailData.content || 'Contenido generado por IA'
      };
    }
    
    throw new Error('No se pudo extraer el contenido JSON');
  } catch (error) {
    console.error('Error generando contenido:', error);
    return {
      subject: 'Email Marketing Personalizado',
      content: '<h2>¡Hola!</h2><p>Este es un email generado automáticamente por nuestra IA.</p><p>Estamos trabajando para ofrecerte el mejor contenido personalizado.</p>'
    };
  }
}

// Función para generar variantes de A/B testing
async function generateABVariants(originalSubject: string, originalContent: string, userApiKey?: string): Promise<{ subject: string; content: string }[]> {
  try {
    const apiKey = userApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('API key no disponible');
    }

    const prompt = `
Crea 2 variantes diferentes para A/B testing del siguiente email:

Asunto original: ${originalSubject}
Contenido original: ${originalContent}

Crea variantes que:
- Tengan diferentes enfoques psicológicos
- Usen diferentes call-to-actions
- Mantengan el mismo objetivo pero con diferente estrategia
- Sean optimizadas para diferentes tipos de personalidad

Devuelve SOLO un JSON con esta estructura exacta:
{
  "variants": [
    {
      "subject": "Variante 1 del asunto",
      "content": "Contenido variante 1 en HTML"
    },
    {
      "subject": "Variante 2 del asunto", 
      "content": "Contenido variante 2 en HTML"
    }
  ]
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
      const variantsData = JSON.parse(jsonMatch[0]);
      return variantsData.variants || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error generando variantes A/B:', error);
    return [];
  }
}

// POST - Crear campaña automatizada con IA
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const body = await request.json();
    const { 
      name,
      description,
      businessType,
      goal,
      aiSettings, 
      automationSettings, 
      abTestSettings,
      userApiKey 
    } = body;

    if (!name || !aiSettings) {
      return NextResponse.json({ error: 'Nombre y configuración de IA son requeridos' }, { status: 400 });
    }

    // Crear objeto campaign temporal para generar contenido
    const tempCampaign = {
      name,
      description: description || '',
      businessType: businessType || '',
      goal: goal || '',
      content: '',
      aiSettings: {
        ...aiSettings,
        contentTheme: aiSettings.contentTheme || 'marketing general',
        targetAudience: aiSettings.targetAudience || 'clientes potenciales',
        tone: aiSettings.tone || 'professional'
      }
    } as CampaignData;

    // Generar contenido inicial con IA
    const { subject, content } = await generateEmailContent(
      tempCampaign.name || 'Campaña automatizada',
      'Audiencia general',
      'profesional',
      userApiKey
    );

    // Contar contactos suscritos
    const contacts = getUserContacts(userEmail);
    const subscribedContacts = contacts.filter(contact => contact.isSubscribed);

    // Configurar próxima fecha de envío
    const nextSendDate = new Date();
    if (automationSettings?.frequency === 'daily') {
      nextSendDate.setDate(nextSendDate.getDate() + 1);
    } else if (automationSettings?.frequency === 'every3days') {
      nextSendDate.setDate(nextSendDate.getDate() + 3);
    } else if (automationSettings?.frequency === 'weekly') {
      nextSendDate.setDate(nextSendDate.getDate() + 7);
    } else if (automationSettings?.frequency === 'custom' && automationSettings?.customDays) {
      nextSendDate.setDate(nextSendDate.getDate() + automationSettings.customDays);
    }

    const campaignData: Omit<CampaignData, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      description: description || '',
      businessType: businessType || '',
      goal: goal || '',
      subject,
      content,
      userEmail,
      status: 'automated',
      recipientCount: subscribedContacts.length,
      openCount: 0,
      clickCount: 0,
      unsubscribeCount: 0,
      isAutomated: true,
      automationSettings: {
        ...automationSettings,
        nextSendDate: nextSendDate.toISOString(),
        isActive: true,
        sentCount: 0
      },
      aiSettings,
      abTestSettings: abTestSettings?.isEnabled ? {
        ...abTestSettings,
        variants: []
      } : undefined,
      metrics: {
        openRate: 0,
        clickRate: 0,
        unsubscribeRate: 0,
        bounceRate: 0,
        conversionRate: 0,
        revenueGenerated: 0,
        lastCalculated: new Date().toISOString()
      }
    };

    const newCampaign = createCampaign(campaignData);

    // Si A/B testing está habilitado, generar variantes
    if (abTestSettings?.isEnabled && newCampaign.id) {
      const variants = await generateABVariants(subject, content, userApiKey);
      
      if (variants.length > 0) {
        const abVariants = variants.map((variant, index) => ({
          id: `${newCampaign.id}_variant_${index + 1}`,
          subject: variant.subject,
          content: variant.content,
          sentCount: 0,
          openCount: 0,
          clickCount: 0,
          winnerDeclared: false
        }));

        // Actualizar campaña con variantes
        const updatedCampaign = updateCampaign(newCampaign.id, {
          abTestSettings: {
            ...abTestSettings,
            variants: abVariants
          }
        });

        return NextResponse.json({ 
          campaign: updatedCampaign,
          message: 'Campaña automatizada creada con A/B testing',
          abVariantsGenerated: variants.length
        }, { status: 201 });
      }
    }

    return NextResponse.json({ 
      campaign: newCampaign,
      message: 'Campaña automatizada creada exitosamente'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating automated campaign:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// GET - Obtener campañas automatizadas y sus métricas
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const campaigns = getUserCampaigns(userEmail);
    const automatedCampaigns = campaigns.filter(campaign => campaign.isAutomated);

    // Calcular métricas actualizadas para cada campaña
    const campaignsWithMetrics = automatedCampaigns.map(campaign => {
      const openRate = campaign.recipientCount > 0 ? (campaign.openCount / campaign.recipientCount) * 100 : 0;
      const clickRate = campaign.openCount > 0 ? (campaign.clickCount / campaign.openCount) * 100 : 0;
      const unsubscribeRate = campaign.recipientCount > 0 ? (campaign.unsubscribeCount / campaign.recipientCount) * 100 : 0;

      return {
        ...campaign,
        metrics: {
          ...campaign.metrics,
          openRate: Math.round(openRate * 100) / 100,
          clickRate: Math.round(clickRate * 100) / 100,
          unsubscribeRate: Math.round(unsubscribeRate * 100) / 100,
          lastCalculated: new Date().toISOString()
        }
      };
    });

    return NextResponse.json({ 
      campaigns: campaignsWithMetrics,
      totalAutomated: automatedCampaigns.length,
      activeAutomations: automatedCampaigns.filter(c => c.automationSettings?.isActive).length
    });
  } catch (error) {
    console.error('Error fetching automated campaigns:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT - Actualizar configuración de automatización
export async function PUT(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const body = await request.json();
    const { campaignId, action, id, ...updateData } = body;
    const targetCampaignId = campaignId || id;

    if (!targetCampaignId) {
      return NextResponse.json({ error: 'ID de campaña requerido' }, { status: 400 });
    }

    let updates: any = {};

    if (action) {
      // Manejo de acciones específicas (pause, resume, etc.)
      switch (action) {
        case 'pause':
          updates = {
            status: 'paused',
            automationSettings: {
              ...updateData.automationSettings,
              isActive: false
            }
          };
          break;
        case 'resume':
          updates = {
            status: 'automated',
            automationSettings: {
              ...updateData.automationSettings,
              isActive: true
            }
          };
          break;
        case 'update_settings':
          updates = updateData;
          break;
        default:
          return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
      }
    } else {
      // Edición completa de campaña
      updates = {
        name: updateData.name,
        description: updateData.description,
        subject: updateData.subject,
        content: updateData.content,
        frequency: updateData.frequency,
        segment: updateData.segment,
        aiEnabled: updateData.aiEnabled,
        abTestEnabled: updateData.abTestEnabled,
        updatedAt: new Date().toISOString()
      };
    }

    // Primero verificar que la campaña existe y pertenece al usuario
    const campaigns = getUserCampaigns(userEmail);
    console.log('DEBUG PUT - userEmail:', userEmail);
    console.log('DEBUG PUT - targetCampaignId:', targetCampaignId);
    console.log('DEBUG PUT - campaigns found:', campaigns.length);
    console.log('DEBUG PUT - campaign IDs:', campaigns.map(c => c.id));
    
    const existingCampaign = campaigns.find(c => c.id === targetCampaignId);
    
    if (!existingCampaign) {
      console.log('DEBUG PUT - Campaign not found for ID:', targetCampaignId);
      return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });
    }

    if (existingCampaign.userEmail !== userEmail) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Ahora actualizar la campaña
    const updatedCampaign = updateCampaign(targetCampaignId, updates);

    if (!updatedCampaign) {
      return NextResponse.json({ error: 'Error actualizando campaña' }, { status: 500 });
    }

    return NextResponse.json({ 
      campaign: updatedCampaign,
      message: `Campaña ${action === 'pause' ? 'pausada' : action === 'resume' ? 'reanudada' : 'actualizada'} exitosamente`
    });
  } catch (error) {
    console.error('Error updating automated campaign:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const body = await request.json();
    const { campaignId } = body;

    if (!campaignId) {
      return NextResponse.json({ error: 'ID de campaña requerido' }, { status: 400 });
    }

    // Verificar que la campaña existe y pertenece al usuario
    const campaigns = getUserCampaigns(userEmail);
    const existingCampaign = campaigns.find(c => c.id === campaignId);
    
    if (!existingCampaign) {
      return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });
    }

    if (existingCampaign.userEmail !== userEmail) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Eliminar la campaña
    const success = deleteCampaign(campaignId);

    if (!success) {
      return NextResponse.json({ error: 'Error eliminando campaña' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Campaña eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting automated campaign:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}