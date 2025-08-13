import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserByEmailAsync, 
  getUserPageSettingsByEmailAsync,
  addCollectedEmailAsync
} from '../../../lib/database';

// Function to send contact to Web3Forms
async function sendContactToWeb3Forms(email: string, userEmail: string, accessKey: string): Promise<boolean> {
  try {
    if (!accessKey) {
      console.warn('Web3Forms access key not provided for user:', userEmail);
      return false;
    }

    const formData = new FormData();
    formData.append('access_key', accessKey);
    formData.append('email', email);
    formData.append('subject', `Nuevo suscriptor para ${userEmail}`);
    formData.append('message', `Nuevo contacto recopilado:\n\nEmail: ${email}\nPágina de: ${userEmail}\nFecha: ${new Date().toLocaleString()}`);
    
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Contacto enviado exitosamente via Web3Forms:', result);
      return true;
    } else {
      console.error('Error enviando via Web3Forms:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('Error conectando con Web3Forms:', error);
    return false;
  }
}

// Function to check if Web3Forms is configured for a user
function isWeb3FormsConfigured(accessKey?: string): boolean {
  return !!accessKey;
}

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
    const pageSettings = await getUserPageSettingsByEmailAsync(userEmail);
    if (!pageSettings || !pageSettings.isActive) {
      console.warn('[email-collection][POST] page not available', { userEmail, hasSettings: !!pageSettings, isActive: pageSettings?.isActive });
      return NextResponse.json(
        { error: 'Página de recopilación no disponible' },
        { status: 404 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { email, customFields } = body;
    
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
    
    // Check if Web3Forms is configured for this user
    let emailSent = false;
    if (isWeb3FormsConfigured(pageSettings.web3formsAccessKey)) {
      // Send notification via Web3Forms if configured
      emailSent = await sendContactToWeb3Forms(sanitizedEmail, userEmail, pageSettings.web3formsAccessKey!);
      if (!emailSent) {
        console.error('[email-collection][POST] Web3Forms notification failed', { userEmail, email: sanitizedEmail });
      }
    } else {
      console.log('[email-collection][POST] Web3Forms not configured for user, saving locally only:', userEmail);
    }

    // Always save contact locally
    try {
      await addCollectedEmailAsync({
        email: sanitizedEmail,
        userEmail: userEmail,
        source: 'collection-page',
        customFields: customFields || undefined
      });
      console.log('[email-collection][POST] Email saved locally', { userEmail, email: sanitizedEmail, emailSent, hasCustomFields: !!customFields });
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