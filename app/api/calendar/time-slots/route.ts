import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';


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

const TIME_SLOTS_FILE = join(process.cwd(), 'data', 'time-slots.json');

function loadTimeSlotsData(): TimeSlotsData {
  try {
    if (!existsSync(TIME_SLOTS_FILE)) {
      return { timeSlots: [] };
    }
    const data = readFileSync(TIME_SLOTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading time slots data:', error);
    return { timeSlots: [] };
  }
}

function saveTimeSlotsData(data: TimeSlotsData): void {
  try {
    writeFileSync(TIME_SLOTS_FILE, JSON.stringify(data, null, 2));
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

    const data = loadTimeSlotsData();
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
    const data = loadTimeSlotsData();

    const newTimeSlot: TimeSlot = {
      id: Date.now().toString(),
      ...slotData,
      userEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.timeSlots.push(newTimeSlot);
    saveTimeSlotsData(data);

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
    const data = loadTimeSlotsData();

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

    saveTimeSlotsData(data);

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
    const data = loadTimeSlotsData();

    const slotIndex = data.timeSlots.findIndex(slot => 
      slot.id === slotId && slot.userEmail === userEmail
    );

    if (slotIndex === -1) {
      return NextResponse.json({ error: 'Horario no encontrado' }, { status: 404 });
    }

    data.timeSlots.splice(slotIndex, 1);
    saveTimeSlotsData(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting time slot:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}