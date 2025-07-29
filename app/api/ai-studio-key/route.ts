import { NextRequest, NextResponse } from 'next/server';
import { updateUserAiStudioApiKey, getUserAiStudioApiKey } from '../../lib/database';

// GET - Obtener la API key de AI Studio del usuario
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

    const apiKey = getUserAiStudioApiKey(email);
    
    return NextResponse.json({
      success: true,
      apiKey: apiKey,
      hasApiKey: !!apiKey
    });
  } catch (error) {
    console.error('Error getting AI Studio API key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Guardar/actualizar la API key de AI Studio del usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, apiKey } = body;

    if (!email || !apiKey) {
      return NextResponse.json(
        { error: 'Email and API key are required' },
        { status: 400 }
      );
    }

    // Validación básica de la API key (debe empezar con AIza)
    if (!apiKey.startsWith('AIza')) {
      return NextResponse.json(
        { error: 'Invalid AI Studio API key format' },
        { status: 400 }
      );
    }

    const updatedUser = updateUserAiStudioApiKey(email, apiKey);
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'AI Studio API key saved successfully',
      user: {
        email: updatedUser.email,
        hasApiKey: !!updatedUser.aiStudioApiKey
      }
    });
  } catch (error) {
    console.error('Error saving AI Studio API key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar la API key de AI Studio del usuario
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

    const updatedUser = updateUserAiStudioApiKey(email, '');
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'AI Studio API key removed successfully'
    });
  } catch (error) {
    console.error('Error removing AI Studio API key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}