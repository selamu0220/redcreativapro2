import { NextRequest, NextResponse } from 'next/server';
import { unsubscribeContactAsync, unsubscribeContactByEmailAsync } from '../../lib/database';


// POST - Desuscribir contacto usando token o email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, email } = body;

    if (!token && !email) {
      return NextResponse.json({ error: 'Token de desuscripción o email requerido' }, { status: 400 });
    }

    let success = false;

    if (token) {
      // Intentar desuscribir usando token
      success = await unsubscribeContactAsync(token);
    } else if (email) {
      // Intentar desuscribir usando email
      success = await unsubscribeContactByEmailAsync(email);
    }

    if (!success) {
      return NextResponse.json({ 
        error: token ? 'Token inválido o contacto no encontrado' : 'Email no encontrado en nuestra lista de suscriptores' 
      }, { status: 404 });
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
