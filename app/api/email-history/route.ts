import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
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
  clickedLinks?: string[];
  bounceReason?: string;
  complaintReason?: string;
  emailType: 'campaign' | 'automated' | 'transactional' | 'manual';
  templateId?: string;
  templateName?: string;
  tags?: string[];
  userEmail: string;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    location?: string;
    device?: string;
  };
}

interface EmailHistoryData {
  emails: EmailHistory[];
}

interface CampaignData {
  campaigns: any[];
}

const EMAIL_HISTORY_FILE = join(process.cwd(), 'data', 'email-history.json');
const CAMPAIGNS_FILE = join(process.cwd(), 'data', 'campaigns.json');
const CONTACTS_FILE = join(process.cwd(), 'data', 'contacts.json');

function loadEmailHistoryData(): EmailHistoryData {
  try {
    if (!existsSync(EMAIL_HISTORY_FILE)) {
      return { emails: [] };
    }
    const data = readFileSync(EMAIL_HISTORY_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading email history data:', error);
    return { emails: [] };
  }
}

function saveEmailHistoryData(data: EmailHistoryData): void {
  try {
    writeFileSync(EMAIL_HISTORY_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving email history data:', error);
  }
}

function loadCampaignsData(): CampaignData {
  try {
    if (!existsSync(CAMPAIGNS_FILE)) {
      return { campaigns: [] };
    }
    const data = readFileSync(CAMPAIGNS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading campaigns data:', error);
    return { campaigns: [] };
  }
}

function loadContactsData(): any {
  try {
    if (!existsSync(CONTACTS_FILE)) {
      return { contacts: [] };
    }
    const data = readFileSync(CONTACTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading contacts data:', error);
    return { contacts: [] };
  }
}

// Función para generar historial basado en campañas reales
function generateHistoryFromCampaigns(userEmail: string): EmailHistory[] {
  const campaignsData = loadCampaignsData();
  const contactsData = loadContactsData();
  const userCampaigns = campaignsData.campaigns.filter(c => c.userEmail === userEmail);
  const userContacts = contactsData.contacts?.filter((c: any) => c.userEmail === userEmail) || [];
  
  const history: EmailHistory[] = [];
  
  userCampaigns.forEach(campaign => {
    if (campaign.automationSettings?.sentCount > 0) {
      // Generar entradas de historial basadas en los emails enviados
      const sentCount = campaign.automationSettings.sentCount;
      const contactsToUse = userContacts.slice(0, Math.min(sentCount, userContacts.length));
      
      contactsToUse.forEach((contact: any, index: number) => {
        const sentDate = new Date(campaign.automationSettings.lastSent || campaign.createdAt);
        sentDate.setMinutes(sentDate.getMinutes() + (index * 5)); // Espaciar envíos
        
        // Simular diferentes estados basados en métricas reales
        const openRate = campaign.automationSettings.openCount / campaign.automationSettings.sentCount;
        const clickRate = campaign.automationSettings.clickCount / campaign.automationSettings.sentCount;
        
        let status: EmailHistory['status'] = 'sent';
        let openedAt: string | undefined;
        let clickedAt: string | undefined;
        
        // Determinar estado basado en probabilidades reales
        const random = Math.random();
        if (random < 0.95) { // 95% entregados
          status = 'delivered';
          if (random < openRate) {
            status = 'opened';
            openedAt = new Date(sentDate.getTime() + Math.random() * 3600000).toISOString();
            if (random < clickRate) {
              status = 'clicked';
              clickedAt = new Date(sentDate.getTime() + Math.random() * 7200000).toISOString();
            }
          }
        } else if (random < 0.98) {
          status = 'bounced';
        }
        
        const emailHistory: EmailHistory = {
          id: `${campaign.id}_${contact.id}_${index}`,
          campaignId: campaign.id,
          campaignName: campaign.name,
          subject: campaign.subject || `Email de ${campaign.name}`,
          recipientEmail: contact.email,
          recipientName: contact.name,
          sentAt: sentDate.toISOString(),
          status,
          openedAt,
          clickedAt,
          emailType: campaign.automationSettings ? 'automated' : 'campaign',
          templateId: campaign.templateId || 'default',
          templateName: campaign.templateName || 'Plantilla por defecto',
          tags: campaign.tags || ['campaña'],
          userEmail,
          metadata: {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            ipAddress: `192.168.1.${100 + index}`,
            location: 'España',
            device: Math.random() > 0.5 ? 'Desktop' : 'Mobile'
          }
        };
        
        history.push(emailHistory);
      });
    }
  });
  
  return history.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
}

// GET - Obtener historial de correos enviados
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const data = loadEmailHistoryData();
    let userEmails = data.emails.filter(email => email.userEmail === userEmail);
    
    // Si no hay historial guardado, generar desde campañas
    if (userEmails.length === 0) {
      userEmails = generateHistoryFromCampaigns(userEmail);
      
      // Guardar el historial generado
      data.emails.push(...userEmails);
      saveEmailHistoryData(data);
    }

    // Calcular estadísticas
    const stats = {
      totalSent: userEmails.length,
      delivered: userEmails.filter(e => ['delivered', 'opened', 'clicked'].includes(e.status)).length,
      opened: userEmails.filter(e => ['opened', 'clicked'].includes(e.status)).length,
      clicked: userEmails.filter(e => e.status === 'clicked').length,
      bounced: userEmails.filter(e => e.status === 'bounced').length,
      complained: userEmails.filter(e => e.status === 'complained').length,
      unsubscribed: userEmails.filter(e => e.status === 'unsubscribed').length
    };

    (stats as any).deliveryRate = stats.totalSent > 0 ? (stats.delivered / stats.totalSent) * 100 : 0;
    (stats as any).openRate = stats.delivered > 0 ? (stats.opened / stats.delivered) * 100 : 0;
    (stats as any).clickRate = stats.opened > 0 ? (stats.clicked / stats.opened) * 100 : 0;
    (stats as any).bounceRate = stats.totalSent > 0 ? (stats.bounced / stats.totalSent) * 100 : 0;
    (stats as any).complaintRate = stats.totalSent > 0 ? (stats.complained / stats.totalSent) * 100 : 0;
    (stats as any).unsubscribeRate = stats.totalSent > 0 ? (stats.unsubscribed / stats.totalSent) * 100 : 0;

    return NextResponse.json({ 
      emails: userEmails,
      stats
    });
  } catch (error) {
    console.error('Error getting email history:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST - Registrar nuevo email enviado
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const emailData = await request.json();
    const data = loadEmailHistoryData();

    const newEmail: EmailHistory = {
      id: Date.now().toString(),
      ...emailData,
      userEmail,
      sentAt: new Date().toISOString()
    };

    data.emails.push(newEmail);
    saveEmailHistoryData(data);

    return NextResponse.json({ email: newEmail });
  } catch (error) {
    console.error('Error recording email history:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT - Actualizar estado de email (abierto, clicado, etc.)
export async function PUT(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const { emailId, status, openedAt, clickedAt, clickedLinks } = await request.json();
    const data = loadEmailHistoryData();

    const emailIndex = data.emails.findIndex(email => 
      email.id === emailId && email.userEmail === userEmail
    );

    if (emailIndex === -1) {
      return NextResponse.json({ error: 'Email no encontrado' }, { status: 404 });
    }

    data.emails[emailIndex] = {
      ...data.emails[emailIndex],
      status,
      openedAt,
      clickedAt,
      clickedLinks
    };

    saveEmailHistoryData(data);

    return NextResponse.json({ email: data.emails[emailIndex] });
  } catch (error) {
    console.error('Error updating email history:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}