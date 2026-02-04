import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';


interface TimeSlot {
  id: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  maxBookings?: number;
  title?: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
}

interface TimeSlotsData {
  timeSlots: TimeSlot[];
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

const TIME_SLOTS_KEY = 'time-slots';

async function loadTimeSlotsData(): Promise<TimeSlotsData> {
  try {
    const data = await kvGet(TIME_SLOTS_KEY);
    return data || { timeSlots: [] };
  } catch (error) {
    console.error('Error loading time slots data:', error);
    return { timeSlots: [] };
  }
}

async function saveTimeSlotsData(data: TimeSlotsData): Promise<void> {
  try {
    await kvSet(TIME_SLOTS_KEY, data);
  } catch (error) {
    console.error('Error saving time slots data:', error);
  }
}

// GET - Obtener horarios disponibles
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const data = await loadTimeSlotsData();
    const userTimeSlots = data.timeSlots.filter(slot => slot.userEmail === userEmail);

    return NextResponse.json({ timeSlots: userTimeSlots });
  } catch (error) {
    console.error('Error getting time slots:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST - Crear nuevo horario
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const slotData = await request.json();
    const data = await loadTimeSlotsData();

    const newTimeSlot: TimeSlot = {
      id: Date.now().toString(),
      ...slotData,
      userEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.timeSlots.push(newTimeSlot);
    await saveTimeSlotsData(data);

    return NextResponse.json({ timeSlot: newTimeSlot });
  } catch (error) {
    console.error('Error creating time slot:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT - Actualizar horario existente
export async function PUT(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const { slotId, ...updateData } = await request.json();
    const data = await loadTimeSlotsData();

    const slotIndex = data.timeSlots.findIndex(slot => 
      slot.id === slotId && slot.userEmail === userEmail
    );

    if (slotIndex === -1) {
      return NextResponse.json({ error: 'Horario no encontrado' }, { status: 404 });
    }

    data.timeSlots[slotIndex] = {
      ...data.timeSlots[slotIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    await saveTimeSlotsData(data);

    return NextResponse.json({ timeSlot: data.timeSlots[slotIndex] });
  } catch (error) {
    console.error('Error updating time slot:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE - Eliminar horario
export async function DELETE(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      return NextResponse.json({ error: 'Email de usuario requerido' }, { status: 400 });
    }

    const { slotId } = await request.json();
    const data = await loadTimeSlotsData();

    const slotIndex = data.timeSlots.findIndex(slot => 
      slot.id === slotId && slot.userEmail === userEmail
    );

    if (slotIndex === -1) {
      return NextResponse.json({ error: 'Horario no encontrado' }, { status: 404 });
    }

    data.timeSlots.splice(slotIndex, 1);
    await saveTimeSlotsData(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting time slot:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
