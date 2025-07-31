import { NextRequest, NextResponse } from 'next/server';
import { unsubscribeContact } from '../../lib/database';

// POST - Desuscribir contacto usando token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token de desuscripción requerido' }, { status: 400 });
    }

    // Intentar desuscribir el contacto
    const success = unsubscribeContact(token);

    if (!success) {
      return NextResponse.json({ error: 'Token inválido o contacto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Desuscripción exitosa',
      success: true 
    });

  } catch (error) {
    console.error('Error unsubscribing contact:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}