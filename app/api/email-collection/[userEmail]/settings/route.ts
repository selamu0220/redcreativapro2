import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserByEmailAsync, 
  getUserPageSettingsByEmailAsync,
  createOrUpdateUserPageSettingsAsync 
} from '../../../../lib/database';

interface UserPageSettingsUpdate {
  title?: string;
  description?: string;
  callToActionText?: string;
  successMessage?: string;
  customBranding?: {
    primaryColor?: string;
    logoUrl?: string;
  };
  isActive?: boolean;
  web3formsAccessKey?: string;
}

function validateSettingsInput(input: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (input.title !== undefined) {
    if (typeof input.title !== 'string' || input.title.trim().length === 0) {
      errors.push('El título es requerido y debe ser una cadena válida');
    } else if (input.title.length > 200) {
      errors.push('El título no puede exceder 200 caracteres');
    }
  }
  
  if (input.description !== undefined) {
    if (typeof input.description !== 'string' || input.description.trim().length === 0) {
      errors.push('La descripción es requerida y debe ser una cadena válida');
    } else if (input.description.length > 500) {
      errors.push('La descripción no puede exceder 500 caracteres');
    }
  }
  
  if (input.callToActionText !== undefined) {
    if (typeof input.callToActionText !== 'string' || input.callToActionText.trim().length === 0) {
      errors.push('El texto del botón es requerido y debe ser una cadena válida');
    } else if (input.callToActionText.length > 50) {
      errors.push('El texto del botón no puede exceder 50 caracteres');
    }
  }
  
  if (input.successMessage !== undefined) {
    if (typeof input.successMessage !== 'string' || input.successMessage.trim().length === 0) {
      errors.push('El mensaje de éxito es requerido y debe ser una cadena válida');
    } else if (input.successMessage.length > 300) {
      errors.push('El mensaje de éxito no puede exceder 300 caracteres');
    }
  }
  
  if (input.customBranding !== undefined) {
    if (typeof input.customBranding !== 'object' || input.customBranding === null) {
      errors.push('La configuración de marca debe ser un objeto válido');
    } else {
      if (input.customBranding.primaryColor !== undefined) {
        const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (typeof input.customBranding.primaryColor !== 'string' || 
            !colorRegex.test(input.customBranding.primaryColor)) {
          errors.push('El color primario debe ser un código hexadecimal válido (ej: #FF0000)');
        }
      }
      
      if (input.customBranding.logoUrl !== undefined) {
        if (typeof input.customBranding.logoUrl !== 'string') {
          errors.push('La URL del logo debe ser una cadena válida');
        } else if (input.customBranding.logoUrl.length > 0) {
          try {
            new URL(input.customBranding.logoUrl);
          } catch {
            errors.push('La URL del logo debe ser una URL válida');
          }
        }
      }
    }
  }
  
  if (input.isActive !== undefined) {
    if (typeof input.isActive !== 'boolean') {
      errors.push('El estado activo debe ser verdadero o falso');
    }
  }
  
  if (input.web3formsAccessKey !== undefined) {
    if (typeof input.web3formsAccessKey !== 'string') {
      errors.push('El Access Key de Web3Forms debe ser una cadena válida');
    } else if (input.web3formsAccessKey.length > 0 && input.web3formsAccessKey.length < 10) {
      errors.push('El Access Key de Web3Forms debe tener al menos 10 caracteres');
    }
  }
  
  return { valid: errors.length === 0, errors };
}

function sanitizeSettingsInput(input: UserPageSettingsUpdate): UserPageSettingsUpdate {
  const sanitized: UserPageSettingsUpdate = {};
  
  if (input.title !== undefined) {
    sanitized.title = input.title.trim();
  }
  
  if (input.description !== undefined) {
    sanitized.description = input.description.trim();
  }
  
  if (input.callToActionText !== undefined) {
    sanitized.callToActionText = input.callToActionText.trim();
  }
  
  if (input.successMessage !== undefined) {
    sanitized.successMessage = input.successMessage.trim();
  }
  
  if (input.customBranding !== undefined) {
    sanitized.customBranding = {};
    
    if (input.customBranding.primaryColor !== undefined) {
      sanitized.customBranding.primaryColor = input.customBranding.primaryColor.trim();
    }
    
    if (input.customBranding.logoUrl !== undefined) {
      sanitized.customBranding.logoUrl = input.customBranding.logoUrl.trim();
    }
  }
  
  if (input.isActive !== undefined) {
    sanitized.isActive = input.isActive;
  }
  
  if (input.web3formsAccessKey !== undefined) {
    sanitized.web3formsAccessKey = input.web3formsAccessKey.trim();
  }
  
  return sanitized;
}

// GET /api/email-collection/[userEmail]/settings - Get user page settings
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userEmail: string }> }
) {
  try {
    const { userEmail: rawUserEmail } = await params;
    const userEmail = decodeURIComponent(rawUserEmail);
    
    // Authentication is handled by middleware for admin access
    
    // Verify user exists
    const user = await getUserByEmailAsync(userEmail);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    // Get user page settings
    const pageSettings = await getUserPageSettingsByEmailAsync(userEmail);
    
    if (!pageSettings) {
      return NextResponse.json(
        { error: 'Configuraciones de página no encontradas' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ settings: pageSettings });
    
  } catch (error) {
    console.error('Error fetching page settings:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/email-collection/[userEmail]/settings - Update user page settings
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userEmail: string }> }
) {
  try {
    const { userEmail: rawUserEmail } = await params;
    const userEmail = decodeURIComponent(rawUserEmail);
    
    // Authentication is handled by middleware for admin access
    
    // Verify user exists
    const user = await getUserByEmailAsync(userEmail);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    // Get current settings
    const currentSettings = await getUserPageSettingsByEmailAsync(userEmail);
    if (!currentSettings) {
      return NextResponse.json(
        { error: 'Configuraciones de página no encontradas' },
        { status: 404 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate input
    const validation = validateSettingsInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.errors },
        { status: 400 }
      );
    }
    
    // Sanitize input
    const sanitizedInput = sanitizeSettingsInput(body);
    
    // Update settings
    const updatedSettings = await createOrUpdateUserPageSettingsAsync({
      ...currentSettings,
      ...sanitizedInput
    });
    
    return NextResponse.json({ 
      success: true,
      settings: updatedSettings 
    });
    
  } catch (error) {
    console.error('Error updating page settings:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}