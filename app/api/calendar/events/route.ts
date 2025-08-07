import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getUserCampaigns, CampaignData } from '../../../lib/database';


interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'meeting' | 'call' | 'email' | 'task' | 'campaign';
  status: 'scheduled' | 'completed' | 'cancelled';
  attendees?: string[];
  location?: string;
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  reminderMinutes?: number;
  campaignId?: string;
  contactIds?: string[];
  userEmail: string;
  createdAt: string;
  updatedAt: string;
}

interface CalendarData {
  events: CalendarEvent[];
}

const CALENDAR_FILE = join(process.cwd(), 'data', 'calendar.json');

function loadCalendarData(): CalendarData {
  try {
    if (!existsSync(CALENDAR_FILE)) {
      return { events: [] };
    }
    const data = readFileSync(CALENDAR_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading calendar data:', error);
    return { events: [] };
  }
}

function saveCalendarData(data: CalendarData): void {
  try {
    writeFileSync(CALENDAR_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving calendar data:', error);
  }
}

// GET - Obtener eventos del calendario
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const data = loadCalendarData();
    const userEvents = data.events.filter(event => event.userEmail === userEmail);

    // Agregar eventos automáticos de campañas enviadas
    const campaigns = getUserCampaigns(userEmail);
    const campaignEvents: CalendarEvent[] = [];

    campaigns.forEach((campaign: CampaignData) => {
      if (campaign.automationSettings?.sentCount && campaign.automationSettings.sentCount > 0) {
        // Crear evento para cada envío de campaña
        const lastSentDate = campaign.automationSettings.lastSentDate || campaign.updatedAt;
        const eventDate = new Date(lastSentDate);
        
        campaignEvents.push({
          id: `campaign-${campaign.id}-${lastSentDate}`,
          title: `📧 Campaña Enviada: ${campaign.name}`,
          description: `Campaña automatizada enviada a ${campaign.automationSettings.sentCount} contactos`,
          date: eventDate.toISOString().split('T')[0],
          startTime: eventDate.toTimeString().slice(0, 5),
          endTime: eventDate.toTimeString().slice(0, 5),
          type: 'email' as const,
          status: 'completed' as const,
          campaignId: campaign.id,
          userEmail: userEmail,
          createdAt: lastSentDate,
          updatedAt: lastSentDate
        });
      }

      // Agregar evento para próximo envío si está programado
      if (campaign.status === 'automated' && campaign.automationSettings?.isActive && campaign.automationSettings?.nextSendDate) {
        const nextDate = new Date(campaign.automationSettings.nextSendDate);
        
        campaignEvents.push({
          id: `campaign-next-${campaign.id}`,
          title: `📅 Próximo Envío: ${campaign.name}`,
          description: `Campaña automatizada programada`,
          date: nextDate.toISOString().split('T')[0],
          startTime: nextDate.toTimeString().slice(0, 5),
          endTime: nextDate.toTimeString().slice(0, 5),
          type: 'campaign' as const,
          status: 'scheduled' as const,
          campaignId: campaign.id,
          userEmail: userEmail,
          createdAt: campaign.createdAt,
          updatedAt: campaign.updatedAt
        });
      }
    });

    const allEvents = [...userEvents, ...campaignEvents];
    return NextResponse.json({ events: allEvents });
  } catch (error) {
    console.error('Error getting calendar events:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST - Crear nuevo evento
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const eventData = await request.json();
    const data = loadCalendarData();

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      ...eventData,
      userEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.events.push(newEvent);
    saveCalendarData(data);

    return NextResponse.json({ event: newEvent });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT - Actualizar evento existente
export async function PUT(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const { eventId, ...updateData } = await request.json();
    const data = loadCalendarData();

    const eventIndex = data.events.findIndex(event => 
      event.id === eventId && event.userEmail === userEmail
    );

    if (eventIndex === -1) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    data.events[eventIndex] = {
      ...data.events[eventIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    saveCalendarData(data);

    return NextResponse.json({ event: data.events[eventIndex] });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE - Eliminar evento
export async function DELETE(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const { eventId } = await request.json();
    const data = loadCalendarData();

    const eventIndex = data.events.findIndex(event => 
      event.id === eventId && event.userEmail === userEmail
    );

    if (eventIndex === -1) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    data.events.splice(eventIndex, 1);
    saveCalendarData(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}