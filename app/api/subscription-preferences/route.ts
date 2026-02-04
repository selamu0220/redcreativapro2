import { NextRequest, NextResponse } from 'next/server';
import { 
  getCollectedEmailsAsync,
  addCollectedEmailAsync
} from '../../lib/database';

// GET - Get subscription preferences for an email
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    const userEmail = url.searchParams.get('userEmail');
    
    if (!email || !userEmail) {
      return NextResponse.json(
        { error: 'Email y userEmail son requeridos' },
        { status: 400 }
      );
    }

    // Get collected emails to find preferences
    const collectedEmails = await getCollectedEmailsAsync();
    const emailRecord = collectedEmails.find(ce => ce.email === email && ce.userEmail === userEmail);
    
    if (!emailRecord) {
      return NextResponse.json(
        { error: 'Email no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      preferences: (emailRecord as any).preferences || {
        topics: [],
        frequency: 'weekly',
        language: 'es'
      }
    });
    
  } catch (error) {
    console.error('Error fetching subscription preferences:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Save subscription preferences
export async function POST(request: NextRequest) {
  try {
    const { email, userEmail, preferences } = await request.json();
    
    if (!email || !userEmail || !preferences) {
      return NextResponse.json(
        { error: 'Email, userEmail y preferences son requeridos' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Validate preferences structure
    if (!preferences.topics || !Array.isArray(preferences.topics)) {
      return NextResponse.json(
        { error: 'Topics debe ser un array' },
        { status: 400 }
      );
    }

    const validFrequencies = ['daily', 'weekly', 'monthly'];
    if (!validFrequencies.includes(preferences.frequency)) {
      return NextResponse.json(
        { error: 'Frecuencia inválida. Debe ser daily, weekly o monthly' },
        { status: 400 }
      );
    }

    const validLanguages = ['es', 'en'];
    if (!validLanguages.includes(preferences.language)) {
      return NextResponse.json(
        { error: 'Idioma inválido. Debe ser es o en' },
        { status: 400 }
      );
    }

    // Get client IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Save or update email with preferences
    await addCollectedEmailAsync({
      email,
      userEmail,
      source: 'preferences-update',
      // ipAddress: ip,
      preferences: preferences
    });
    
    return NextResponse.json({
      success: true,
      message: 'Preferencias de suscripción guardadas exitosamente'
    });
    
  } catch (error) {
    console.error('Error saving subscription preferences:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Update subscription preferences
export async function PUT(request: NextRequest) {
  try {
    const { email, userEmail, preferences } = await request.json();
    
    if (!email || !userEmail || !preferences) {
      return NextResponse.json(
        { error: 'Email, userEmail y preferences son requeridos' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Validate preferences structure
    if (!preferences.topics || !Array.isArray(preferences.topics)) {
      return NextResponse.json(
        { error: 'Topics debe ser un array' },
        { status: 400 }
      );
    }

    const validFrequencies = ['daily', 'weekly', 'monthly'];
    if (!validFrequencies.includes(preferences.frequency)) {
      return NextResponse.json(
        { error: 'Frecuencia inválida. Debe ser daily, weekly o monthly' },
        { status: 400 }
      );
    }

    const validLanguages = ['es', 'en'];
    if (!validLanguages.includes(preferences.language)) {
      return NextResponse.json(
        { error: 'Idioma inválido. Debe ser es o en' },
        { status: 400 }
      );
    }

    // Get client IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Update email with new preferences
    await addCollectedEmailAsync({
      email,
      userEmail,
      source: 'preferences-update',
      // ipAddress: ip,
      preferences: preferences
    });
    
    return NextResponse.json({
      success: true,
      message: 'Preferencias de suscripción actualizadas exitosamente'
    });
    
  } catch (error) {
    console.error('Error updating subscription preferences:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
