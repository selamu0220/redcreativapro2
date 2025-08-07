import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserCampaigns, 
  updateCampaign,
  CampaignData
} from '../../../lib/database';

// Validar configuraciones de automatización
function validateAutomationSettings(settings: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!settings.frequency || !['daily', 'every3days', 'weekly', 'custom'].includes(settings.frequency)) {
    errors.push('Frecuencia inválida. Debe ser: daily, every3days, weekly, o custom');
  }
  
  if (settings.frequency === 'custom' && (!settings.customDays || settings.customDays < 1)) {
    errors.push('Para frecuencia custom, customDays debe ser mayor a 0');
  }
  
  if (settings.maxEmailsPerCampaign && settings.maxEmailsPerCampaign < 1) {
    errors.push('maxEmailsPerCampaign debe ser mayor a 0');
  }
  
  if (settings.endDate && new Date(settings.endDate) <= new Date()) {
    errors.push('La fecha de finalización debe ser futura');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Validar configuraciones de IA
function validateAISettings(settings: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const validTones = ['professional', 'friendly', 'casual', 'urgent', 'informative', 'persuasive'];
  if (settings.tone && !validTones.includes(settings.tone)) {
    errors.push(`Tono inválido. Debe ser uno de: ${validTones.join(', ')}`);
  }
  
  const validLengths = ['short', 'medium', 'long'];
  if (settings.contentLength && !validLengths.includes(settings.contentLength)) {
    errors.push(`Longitud de contenido inválida. Debe ser: ${validLengths.join(', ')}`);
  }
  
  if (settings.contentTheme && settings.contentTheme.length > 200) {
    errors.push('El tema del contenido no puede exceder 200 caracteres');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Validar configuraciones de A/B testing
function validateABTestSettings(settings: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (settings.isEnabled) {
    if (!settings.testDuration || settings.testDuration < 1 || settings.testDuration > 30) {
      errors.push('La duración del test debe estar entre 1 y 30 días');
    }
    
    const validCriteria = ['openRate', 'clickRate'];
    if (!settings.winnerCriteria || !validCriteria.includes(settings.winnerCriteria)) {
      errors.push(`Criterio de ganador inválido. Debe ser: ${validCriteria.join(', ')}`);
    }
    
    if (settings.variants && settings.variants.length > 5) {
      errors.push('Máximo 5 variantes permitidas para A/B testing');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// GET - Obtener configuraciones de automatización de una campaña
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const url = new URL(request.url);
    const campaignId = url.searchParams.get('campaignId');
    
    if (!campaignId) {
      return NextResponse.json({ error: 'ID de campaña requerido' }, { status: 400 });
    }

    const campaigns = getUserCampaigns(userEmail);
    const campaign = campaigns.find(c => c.id === campaignId);
    
    if (!campaign) {
      return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });
    }

    const settings = {
      campaignId: campaign.id,
      campaignName: campaign.name,
      isAutomated: campaign.isAutomated || false,
      automationSettings: campaign.automationSettings || {
        frequency: 'weekly',
        isActive: false,
        nextSendDate: null,
        maxEmailsPerCampaign: 50,
        sentCount: 0,
        endDate: null,
        customDays: null
      },
      aiSettings: campaign.aiSettings || {
        generateContent: true,
        optimizeSubjects: true,
        personalizeContent: false,
        tone: 'professional',
        contentLength: 'medium',
        contentTheme: '',
        useUserData: false
      },
      abTestSettings: campaign.abTestSettings || {
        isEnabled: false,
        testDuration: 7,
        winnerCriteria: 'openRate',
        variants: []
      },
      currentStatus: {
        status: campaign.status,
        lastSent: campaign.sentAt,
        totalSent: campaign.automationSettings?.sentCount || 0,
        isActive: campaign.automationSettings?.isActive || false
      }
    };

    return NextResponse.json({
      success: true,
      settings
    });

  } catch (error) {
    console.error('Error fetching automation settings:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT - Actualizar configuraciones de automatización
export async function PUT(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const body = await request.json();
    const { 
      campaignId, 
      automationSettings, 
      aiSettings, 
      abTestSettings,
      enableAutomation 
    } = body;
    
    if (!campaignId) {
      return NextResponse.json({ error: 'ID de campaña requerido' }, { status: 400 });
    }

    const campaigns = getUserCampaigns(userEmail);
    const campaignIndex = campaigns.findIndex(c => c.id === campaignId);
    
    if (campaignIndex === -1) {
      return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });
    }

    const campaign = campaigns[campaignIndex];
    const errors: string[] = [];

    // Validar configuraciones si se proporcionan
    if (automationSettings) {
      const validation = validateAutomationSettings(automationSettings);
      if (!validation.valid) {
        errors.push(...validation.errors);
      }
    }

    if (aiSettings) {
      const validation = validateAISettings(aiSettings);
      if (!validation.valid) {
        errors.push(...validation.errors);
      }
    }

    if (abTestSettings) {
      const validation = validateABTestSettings(abTestSettings);
      if (!validation.valid) {
        errors.push(...validation.errors);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ 
        error: 'Configuraciones inválidas', 
        details: errors 
      }, { status: 400 });
    }

    // Calcular próxima fecha de envío si se cambia la frecuencia
    let nextSendDate = campaign.automationSettings?.nextSendDate;
    if (automationSettings?.frequency) {
      const now = new Date();
      switch (automationSettings.frequency) {
        case 'daily':
          nextSendDate = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'every3days':
          nextSendDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'weekly':
          nextSendDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'custom':
          const customDays = automationSettings.customDays || 7;
          nextSendDate = new Date(now.getTime() + customDays * 24 * 60 * 60 * 1000).toISOString();
          break;
      }
    }

    // Actualizar configuraciones
    const updatedCampaign: CampaignData = {
      ...campaign,
      isAutomated: enableAutomation !== undefined ? enableAutomation : campaign.isAutomated,
      automationSettings: {
        ...campaign.automationSettings,
        ...automationSettings,
        nextSendDate: nextSendDate || campaign.automationSettings?.nextSendDate,
        isActive: automationSettings?.isActive !== undefined ? 
          automationSettings.isActive : 
          campaign.automationSettings?.isActive || false
      },
      aiSettings: {
        ...campaign.aiSettings,
        ...aiSettings
      },
      abTestSettings: {
        ...campaign.abTestSettings,
        ...abTestSettings
      },
      updatedAt: new Date().toISOString()
    };

    // Guardar cambios
    const success = updateCampaign(userEmail, updatedCampaign);
    
    if (!success) {
      return NextResponse.json({ error: 'Error actualizando la campaña' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Configuraciones actualizadas correctamente',
      campaign: {
        id: updatedCampaign.id,
        name: updatedCampaign.name,
        isAutomated: updatedCampaign.isAutomated,
        automationSettings: updatedCampaign.automationSettings,
        aiSettings: updatedCampaign.aiSettings,
        abTestSettings: updatedCampaign.abTestSettings,
        nextSendDate: updatedCampaign.automationSettings?.nextSendDate
      }
    });

  } catch (error) {
    console.error('Error updating automation settings:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST - Activar/Desactivar automatización rápidamente
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const body = await request.json();
    const { campaignId, action } = body; // action: 'activate', 'deactivate', 'pause', 'resume'
    
    if (!campaignId || !action) {
      return NextResponse.json({ error: 'ID de campaña y acción requeridos' }, { status: 400 });
    }

    const campaigns = getUserCampaigns(userEmail);
    const campaignIndex = campaigns.findIndex(c => c.id === campaignId);
    
    if (campaignIndex === -1) {
      return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });
    }

    const campaign = campaigns[campaignIndex];
    let updatedCampaign: CampaignData;

    switch (action) {
      case 'activate':
        if (!campaign.isAutomated) {
          return NextResponse.json({ 
            error: 'La campaña debe estar configurada como automatizada primero' 
          }, { status: 400 });
        }
        
        updatedCampaign = {
          ...campaign,
          status: 'active',
          automationSettings: {
            ...campaign.automationSettings,
            isActive: true,
            nextSendDate: campaign.automationSettings?.nextSendDate || 
              new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // mañana por defecto
          },
          updatedAt: new Date().toISOString()
        };
        break;
        
      case 'deactivate':
        updatedCampaign = {
          ...campaign,
          status: 'draft',
          automationSettings: {
            ...campaign.automationSettings,
            isActive: false
          },
          updatedAt: new Date().toISOString()
        };
        break;
        
      case 'pause':
        updatedCampaign = {
          ...campaign,
          status: 'paused',
          automationSettings: {
            ...campaign.automationSettings,
            isActive: false
          },
          updatedAt: new Date().toISOString()
        };
        break;
        
      case 'resume':
        if (campaign.status !== 'paused') {
          return NextResponse.json({ 
            error: 'Solo se pueden reanudar campañas pausadas' 
          }, { status: 400 });
        }
        
        updatedCampaign = {
          ...campaign,
          status: 'active',
          automationSettings: {
            ...campaign.automationSettings,
            isActive: true
          },
          updatedAt: new Date().toISOString()
        };
        break;
        
      default:
        return NextResponse.json({ 
          error: 'Acción inválida. Debe ser: activate, deactivate, pause, o resume' 
        }, { status: 400 });
    }

    // Guardar cambios
    const success = updateCampaign(userEmail, updatedCampaign);
    
    if (!success) {
      return NextResponse.json({ error: 'Error actualizando la campaña' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Campaña ${action === 'activate' ? 'activada' : action === 'deactivate' ? 'desactivada' : action === 'pause' ? 'pausada' : 'reanudada'} correctamente`,
      campaign: {
        id: updatedCampaign.id,
        name: updatedCampaign.name,
        status: updatedCampaign.status,
        isActive: updatedCampaign.automationSettings?.isActive,
        nextSendDate: updatedCampaign.automationSettings?.nextSendDate
      }
    });

  } catch (error) {
    console.error('Error managing campaign automation:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}