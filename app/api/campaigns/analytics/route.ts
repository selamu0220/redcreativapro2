import { NextRequest, NextResponse } from 'next/server';
import { 

  getUserCampaigns, 
  CampaignData
} from '../../../lib/database';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface EmailHistory {
  id: string;
  campaignId?: string;
  campaignName?: string;
  subject: string;
  recipientEmail: string;
  recipientName?: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed';
  openedAt?: string;
  clickedAt?: string;
  emailType: 'campaign' | 'automated' | 'transactional' | 'manual';
  userEmail: string;
}

interface EmailHistoryData {
  emails: EmailHistory[];
}

const EMAIL_HISTORY_FILE = join(process.cwd(), 'data', 'email-history.json');

function loadEmailHistoryData(): EmailHistoryData {
  try {
    if (!existsSync(EMAIL_HISTORY_FILE)) {
      return { emails: [] };
    }
    const data = readFileSync(EMAIL_HISTORY_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading email history:', error);
    return { emails: [] };
  }
}

// Función para calcular ROI estimado
function calculateROI(campaign: CampaignData): number {
  // Si hay un ROI manual establecido, usarlo en lugar del cálculo automático
  if (campaign.metrics?.manualROI !== undefined && campaign.metrics.manualROI !== null) {
    return campaign.metrics.manualROI;
  }
  
  // ROI base de email marketing (cálculo automático)
  const baseROI = 35; // €35 por €1
  const costPerEmail = 0.01; // €0.01 por email enviado
  const totalCost = (campaign.automationSettings?.sentCount || 0) * costPerEmail;
  
  if (totalCost === 0) return 0;
  
  // Ajustar ROI basado en métricas de rendimiento
  const openRateMultiplier = (campaign.metrics?.openRate || 0) / 25; // 25% es promedio
  const clickRateMultiplier = (campaign.metrics?.clickRate || 0) / 3; // 3% es promedio
  
  const adjustedROI = baseROI * Math.max(0.1, (openRateMultiplier + clickRateMultiplier) / 2);
  const estimatedRevenue = totalCost * adjustedROI;
  
  return Math.round(estimatedRevenue * 100) / 100;
}

// Función eliminada: generateDemoEmailHistory
// Ahora solo se muestran datos reales del usuario

// Función para generar insights con IA
async function generateInsights(campaigns: CampaignData[], userApiKey?: string): Promise<string[]> {
  try {
    const apiKey = userApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey || campaigns.length === 0) {
      return ['No hay suficientes datos para generar insights.'];
    }

    // Preparar datos para análisis
    const campaignStats = campaigns.map(c => ({
      name: c.name,
      openRate: c.metrics?.openRate || 0,
      clickRate: c.metrics?.clickRate || 0,
      unsubscribeRate: c.metrics?.unsubscribeRate || 0,
      frequency: c.automationSettings?.frequency,
      tone: c.aiSettings?.tone,
      theme: c.aiSettings?.contentTheme,
      sentCount: c.automationSettings?.sentCount || 0
    }));

    const prompt = `
Analiza estas métricas de campañas de email marketing y genera 3-5 insights accionables:

${JSON.stringify(campaignStats, null, 2)}

Genera insights sobre:
- Qué tipos de contenido funcionan mejor
- Frecuencias óptimas de envío
- Oportunidades de mejora
- Tendencias de rendimiento
- Recomendaciones específicas

Devuelve SOLO un JSON con esta estructura:
{
  "insights": [
    "Insight 1: descripción específica y accionable",
    "Insight 2: descripción específica y accionable",
    "Insight 3: descripción específica y accionable"
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
      const insightsData = JSON.parse(jsonMatch[0]);
      return insightsData.insights || ['No se pudieron generar insights específicos.'];
    }
    
    return ['No se pudieron generar insights específicos.'];
  } catch (error) {
    console.error('Error generando insights:', error);
    return [
      'Tus campañas automatizadas están funcionando. Continúa monitoreando las métricas.',
      'Considera probar diferentes frecuencias de envío para optimizar el engagement.',
      'El A/B testing puede ayudarte a mejorar las tasas de apertura y clics.'
    ];
  }
}

// GET - Obtener analytics completos
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '30'; // días
    const includeInsights = url.searchParams.get('insights') === 'true';

    const campaigns = getUserCampaigns(userEmail);
    const automatedCampaigns = campaigns.filter(campaign => campaign.isAutomated);

    // Filtrar por período
    const periodDays = parseInt(period);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - periodDays);
    
    const recentCampaigns = automatedCampaigns.filter(campaign => 
      new Date(campaign.createdAt) >= cutoffDate
    );

    // Obtener datos del historial de emails para cálculos precisos
    const emailHistory = loadEmailHistoryData();
    const userEmailHistory = emailHistory.emails.filter(email => email.userEmail === userEmail);
    
    // Filtrar emails del período especificado
    const periodEmails = userEmailHistory.filter(email => {
      const emailDate = new Date(email.sentAt);
      return emailDate >= cutoffDate;
    });
    
    // Calcular métricas generales basadas en datos reales
    const totalEmailsSent = periodEmails.length;
    const totalOpens = periodEmails.filter(email => email.status === 'opened' || email.status === 'clicked').length;
    const totalClicks = periodEmails.filter(email => email.status === 'clicked').length;
    const totalUnsubscribes = periodEmails.filter(email => email.status === 'unsubscribed').length;
    const totalBounces = periodEmails.filter(email => email.status === 'bounced').length;

    const overallMetrics = {
      totalCampaigns: recentCampaigns.length,
      activeCampaigns: recentCampaigns.filter(c => c.automationSettings?.isActive).length,
      totalEmailsSent,
      totalRecipients: totalEmailsSent, // Usar emails enviados como base
      overallOpenRate: totalEmailsSent > 0 ? Math.round((totalOpens / totalEmailsSent) * 10000) / 100 : 0,
      overallClickRate: totalEmailsSent > 0 ? Math.round((totalClicks / totalEmailsSent) * 10000) / 100 : 0,
      overallUnsubscribeRate: totalEmailsSent > 0 ? Math.round((totalUnsubscribes / totalEmailsSent) * 10000) / 100 : 0,
      bounceRate: totalEmailsSent > 0 ? Math.round((totalBounces / totalEmailsSent) * 10000) / 100 : 0,
      totalROI: recentCampaigns.reduce((sum, c) => sum + calculateROI(c), 0)
    };

    // Métricas por campaña con ROI
    const campaignMetrics = recentCampaigns.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      frequency: campaign.automationSettings?.frequency,
      sentCount: campaign.automationSettings?.sentCount || 0,
      nextSendDate: campaign.automationSettings?.nextSendDate,
      metrics: campaign.metrics,
      estimatedROI: calculateROI(campaign),
      abTestEnabled: campaign.abTestSettings?.isEnabled || false,
      abTestWinner: campaign.abTestSettings?.variants?.find(v => v.winnerDeclared)?.subject,
      createdAt: campaign.createdAt,
      lastSent: campaign.sentAt
    }));

    // Análisis de rendimiento por frecuencia
    const frequencyAnalysis = {
      daily: { count: 0, avgOpenRate: 0, avgClickRate: 0, totalROI: 0 },
      every3days: { count: 0, avgOpenRate: 0, avgClickRate: 0, totalROI: 0 },
      weekly: { count: 0, avgOpenRate: 0, avgClickRate: 0, totalROI: 0 },
      custom: { count: 0, avgOpenRate: 0, avgClickRate: 0, totalROI: 0 }
    };

    recentCampaigns.forEach(campaign => {
      const freq = campaign.automationSettings?.frequency || 'custom';
      if ((frequencyAnalysis as any)[freq]) {
        (frequencyAnalysis as any)[freq].count++;
        (frequencyAnalysis as any)[freq].avgOpenRate += campaign.metrics?.openRate || 0;
        (frequencyAnalysis as any)[freq].avgClickRate += campaign.metrics?.clickRate || 0;
        (frequencyAnalysis as any)[freq].totalROI += calculateROI(campaign);
      }
    });

    // Calcular promedios
    Object.keys(frequencyAnalysis).forEach(freq => {
      const data = (frequencyAnalysis as any)[freq];
      if (data.count > 0) {
        data.avgOpenRate = Math.round((data.avgOpenRate / data.count) * 100) / 100;
        data.avgClickRate = Math.round((data.avgClickRate / data.count) * 100) / 100;
      }
    });

    // Análisis de A/B testing
    const abTestCampaigns = recentCampaigns.filter(c => c.abTestSettings?.isEnabled);
    const abTestAnalysis = {
      totalTests: abTestCampaigns.length,
      completedTests: abTestCampaigns.filter(c => 
        c.abTestSettings?.variants?.some(v => v.winnerDeclared)
      ).length,
      averageImprovement: 0, // Esto requeriría más lógica para calcular
      topWinningSubjects: abTestCampaigns
        .map(c => c.abTestSettings?.variants?.find(v => v.winnerDeclared)?.subject)
        .filter(Boolean)
        .slice(0, 5)
    };

    // Tendencias temporales (últimos 7 días) - Solo datos reales del historial
    // Usar la variable emailHistory ya declarada anteriormente
    const userEmailHistoryForTrends = emailHistory.emails.filter(email => email.userEmail === userEmail);
    
    const trends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Filtrar emails del día específico
      const dayEmails = userEmailHistoryForTrends.filter(email => {
        const emailDate = new Date(email.sentAt).toISOString().split('T')[0];
        return emailDate === dateStr;
      });
      
      const dayMetrics = {
        date: dateStr,
        emailsSent: dayEmails.length,
        opens: dayEmails.filter(email => email.status === 'opened' || email.status === 'clicked').length,
        clicks: dayEmails.filter(email => email.status === 'clicked').length,
        revenue: dayEmails.filter(email => email.status === 'clicked').length * 15 // Estimado €15 por click
      };
      
      trends.push(dayMetrics);
    }

    let insights: string[] = [];
    if (includeInsights) {
      insights = await generateInsights(recentCampaigns);
    }

    // Calendario detallado de envíos
    const calendarData = userEmailHistory.map(email => ({
      id: email.id,
      campaignId: email.campaignId,
      campaignName: email.campaignName,
      subject: email.subject,
      recipientEmail: email.recipientEmail,
      recipientName: email.recipientName,
      sentAt: email.sentAt,
      status: email.status,
      openedAt: email.openedAt,
      clickedAt: email.clickedAt,
      emailType: email.emailType,
      date: new Date(email.sentAt).toISOString().split('T')[0],
      time: new Date(email.sentAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    })).sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

    // Resumen por día para el calendario
    const calendarSummary: { [key: string]: any } = {};
    userEmailHistory.forEach(email => {
      const date = new Date(email.sentAt).toISOString().split('T')[0];
      if (!calendarSummary[date]) {
        calendarSummary[date] = {
          date,
          totalSent: 0,
          opened: 0,
          clicked: 0,
          campaigns: new Set()
        };
      }
      calendarSummary[date].totalSent++;
      if (email.status === 'opened' || email.status === 'clicked') {
        calendarSummary[date].opened++;
      }
      if (email.status === 'clicked') {
        calendarSummary[date].clicked++;
      }
      if (email.campaignName) {
        calendarSummary[date].campaigns.add(email.campaignName);
      }
    });

    // Convertir Set a Array para JSON
    Object.values(calendarSummary).forEach((day: any) => {
      day.campaigns = Array.from(day.campaigns);
      day.openRate = day.totalSent > 0 ? Math.round((day.opened / day.totalSent) * 100) : 0;
      day.clickRate = day.opened > 0 ? Math.round((day.clicked / day.opened) * 100) : 0;
    });

    const response = {
      period: `${period} días`,
      overallMetrics,
      campaignMetrics,
      frequencyAnalysis,
      abTestAnalysis,
      trends,
      calendar: {
        detailedHistory: calendarData,
        dailySummary: Object.values(calendarSummary).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      },
      insights,
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST - Generar reporte personalizado
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const body = await request.json();
    const { 
      campaignIds, 
      metrics, 
      dateRange, 
      includeRecommendations = true 
    } = body;

    const campaigns = getUserCampaigns(userEmail);
    let targetCampaigns = campaigns.filter(campaign => campaign.isAutomated);

    // Filtrar por IDs específicos si se proporcionan
    if (campaignIds && campaignIds.length > 0) {
      targetCampaigns = targetCampaigns.filter(c => campaignIds.includes(c.id));
    }

    // Filtrar por rango de fechas
    if (dateRange) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      targetCampaigns = targetCampaigns.filter(c => {
        const campaignDate = new Date(c.createdAt);
        return campaignDate >= startDate && campaignDate <= endDate;
      });
    }

    // Generar reporte personalizado
    const customReport = {
      reportId: `report_${Date.now()}`,
      generatedAt: new Date().toISOString(),
      campaignsAnalyzed: targetCampaigns.length,
      requestedMetrics: metrics || ['openRate', 'clickRate', 'roi'],
      summary: {
        bestPerformingCampaign: targetCampaigns.reduce((best, current) => 
          (current.metrics?.openRate || 0) > (best.metrics?.openRate || 0) ? current : best
        , targetCampaigns[0]),
        totalROI: targetCampaigns.reduce((sum, c) => sum + calculateROI(c), 0),
        averageOpenRate: targetCampaigns.length > 0 ? 
          targetCampaigns.reduce((sum, c) => sum + (c.metrics?.openRate || 0), 0) / targetCampaigns.length : 0,
        averageClickRate: targetCampaigns.length > 0 ? 
          targetCampaigns.reduce((sum, c) => sum + (c.metrics?.clickRate || 0), 0) / targetCampaigns.length : 0
      },
      detailedMetrics: targetCampaigns.map(campaign => ({
        campaignId: campaign.id,
        name: campaign.name,
        roi: calculateROI(campaign),
        metrics: campaign.metrics,
        automationSettings: campaign.automationSettings,
        performance: {
          above_average: (campaign.metrics?.openRate || 0) > 25,
          high_engagement: (campaign.metrics?.clickRate || 0) > 3,
          low_unsubscribe: (campaign.metrics?.unsubscribeRate || 0) < 1
        }
      }))
    };

    if (includeRecommendations) {
      const recommendations = await generateInsights(targetCampaigns);
      (customReport as any)['recommendations'] = recommendations;
    }

    return NextResponse.json({
      success: true,
      report: customReport
    });

  } catch (error) {
    console.error('Error generating custom report:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}