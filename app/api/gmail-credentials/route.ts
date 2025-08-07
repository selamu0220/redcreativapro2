import { NextRequest, NextResponse } from 'next/server';
import { updateUserGmailCredentials, getUserGmailCredentials } from '../../lib/database';


// GET - Obtener las credenciales de Gmail del usuario
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

    const credentials = getUserGmailCredentials(email);
    
    return NextResponse.json({
      success: true,
      gmailUser: credentials?.gmailUser || '',
      gmailPassword: credentials?.gmailPassword || '',
      hasCredentials: !!(credentials?.gmailUser && credentials?.gmailPassword)
    });
  } catch (error) {
    console.error('Error getting Gmail credentials:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Guardar las credenciales de Gmail del usuario
export async function POST(request: NextRequest) {
  try {
    const { email, gmailUser, gmailPassword } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!gmailUser || !gmailPassword) {
      return NextResponse.json(
        { error: 'Gmail user and password are required' },
        { status: 400 }
      );
    }

    const success = updateUserGmailCredentials(email, gmailUser, gmailPassword);
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Gmail credentials saved successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to save Gmail credentials' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error saving Gmail credentials:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar las credenciales de Gmail del usuario
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const success = updateUserGmailCredentials(email, '', '');
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Gmail credentials deleted successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete Gmail credentials' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting Gmail credentials:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}