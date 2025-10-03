import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserByEmailAsync, 
  getUserEmailPagesAsync,
  addCollectedEmailAsync
} from '../../../lib/database';



function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sanitizeInput(input: string): string {
  return input.trim().toLowerCase();
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userEmail: string }> }
) {
  const { userEmail: rawUserEmail } = await params;
  try {
    // Normalize email to lowercase to avoid case-sensitive mismatches
    const userEmail = decodeURIComponent(rawUserEmail).toLowerCase();
    console.log('[email-collection][POST] incoming', { rawUserEmail, userEmail });
    
    
    
    // Check if user's page is active
    const userPages = await getUserEmailPagesAsync(userEmail);
    const pageSettings = userPages && userPages.length > 0 ? userPages[0] : null;
    if (!pageSettings || !pageSettings.isActive) {
      console.warn('[email-collection][POST] page not available', { userEmail, hasSettings: !!pageSettings, isActive: pageSettings?.isActive });
      return NextResponse.json(
        { error: 'Página de recopilación no disponible' },
        { status: 404 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { email, name, customFields } = body;
    
    if (!email) {
      console.warn('[email-collection][POST] missing email body', { userEmail });
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const sanitizedEmail = sanitizeInput(email);
    if (!isValidEmail(sanitizedEmail)) {
      console.warn('[email-collection][POST] invalid email format', { userEmail, sanitizedEmail });
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }
    


    // Always save contact locally
    try {
      await addCollectedEmailAsync({
        email: sanitizedEmail,
        name: name || null,
        userEmail: userEmail,
        source: 'collection-page',
        customFields: customFields || undefined
      });
      console.log('[email-collection][POST] Email saved locally', { userEmail, email: sanitizedEmail, hasCustomFields: !!customFields });
    } catch (error) {
      console.error('Error guardando en collected-emails:', error);
      return NextResponse.json(
        { error: 'Error al guardar el correo' },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, message: pageSettings.successMessage });
    
  } catch (error) {
    console.error('Error in email collection:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userEmail: string }> }
) {
  try {
    // Contact listing is now handled through the admin panel with local storage
    return NextResponse.json(
      { error: 'El listado de contactos se maneja a través del panel de administración.' },
      { status: 410 }
    );
  } catch (error) {
    console.error('Error in email list:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}