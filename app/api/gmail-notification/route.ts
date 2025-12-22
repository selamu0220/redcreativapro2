import { NextRequest, NextResponse } from 'next/server';


// GET - Verificar si el usuario necesita ser notificado sobre configurar Gmail
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await getSupabaseUserByEmail(email);
    
    // Si el usuario no existe o ya fue notificado, no notificar
    const shouldNotify = user && !user.gmail_config_notified && !user.gmail_user;
    
    return NextResponse.json({
      success: true,
      shouldNotify: !!shouldNotify,
      message: shouldNotify ? 'Por favor configura tus credenciales de Gmail en la página de ajustes' : ''
    });
  } catch (error) {
    console.error('Error checking Gmail notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Marcar que el usuario ya fue notificado
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const updatedUser = await createOrUpdateSupabaseUser(email, {
      gmail_config_notified: true
    });
    
    if (updatedUser) {
      return NextResponse.json({
        success: true,
        message: 'Gmail notification marked as shown'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to mark notification' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error marking Gmail notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}