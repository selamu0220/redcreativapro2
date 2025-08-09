import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface EmailHistory {
  id: string;
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
  emailType: 'template' | 'manual';
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



const EMAIL_HISTORY_FILE = join(process.cwd(), 'data', 'email-history.json');


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






// GET - Obtener historial de correos enviados
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const data = loadEmailHistoryData();
    const userEmails = data.emails.filter(email => email.userEmail === userEmail);

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