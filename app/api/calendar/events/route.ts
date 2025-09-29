import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';



interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'meeting' | 'call' | 'email' | 'task';
  status: 'scheduled' | 'completed' | 'cancelled';
  attendees?: string[];
  location?: string;
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  reminderMinutes?: number;

  contactIds?: string[];
  userEmail: string;
  createdAt: string;
  updatedAt: string;
}

interface CalendarData {
  events: CalendarEvent[];
}

// KV helper functions
async function kvGet(key: string): Promise<any> {
  try {
    return await kv.get(key);
  } catch (error) {
    console.error(`Error getting KV key ${key}:`, error);
    return null;
  }
}

async function kvSet(key: string, value: any): Promise<void> {
  try {
    await kv.set(key, value);
  } catch (error) {
    console.error(`Error setting KV key ${key}:`, error);
  }
}

const CALENDAR_KEY = 'calendar-events';

async function loadCalendarData(): Promise<CalendarData> {
  try {
    const data = await kvGet(CALENDAR_KEY);
    return data || { events: [] };
  } catch (error) {
    console.error('Error loading calendar data:', error);
    return { events: [] };
  }
}

async function saveCalendarData(data: CalendarData): Promise<void> {
  try {
    await kvSet(CALENDAR_KEY, data);
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

    const data = await loadCalendarData();
    const userEvents = data.events.filter(event => event.userEmail === userEmail);

    return NextResponse.json({ events: userEvents });
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
    const data = await loadCalendarData();

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      ...eventData,
      userEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.events.push(newEvent);
    await saveCalendarData(data);

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
    const data = await loadCalendarData();

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

    await saveCalendarData(data);

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
    const data = await loadCalendarData();

    const eventIndex = data.events.findIndex(event => 
      event.id === eventId && event.userEmail === userEmail
    );

    if (eventIndex === -1) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    data.events.splice(eventIndex, 1);
    await saveCalendarData(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}