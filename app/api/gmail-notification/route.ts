import { NextRequest, NextResponse } from 'next/server';
import { shouldNotifyGmailConfig, markGmailConfigNotified } from '../../lib/database';

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

    const shouldNotify = shouldNotifyGmailConfig(email);
    
    return NextResponse.json({
      success: true,
      shouldNotify,
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

    const success = markGmailConfigNotified(email);
    
    if (success) {
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