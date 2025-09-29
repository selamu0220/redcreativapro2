import { NextRequest, NextResponse } from 'next/server';
import { updateUserEmailProviderAsync, getUserEmailProviderAsync } from '../../../lib/database';

// POST: Actualizar configuración de proveedor de email
export async function POST(request: NextRequest) {
  try {
    console.log('📧 API /user/email-provider POST: Iniciando actualización de configuración');
    
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      return NextResponse.json({ 
        error: 'Email del usuario requerido en headers' 
      }, { status: 400 });
    }

    const body = await request.json();
    const { provider, config } = body;

    console.log('📝 Datos recibidos:', {
      userEmail,
      provider,
      configKeys: config ? Object.keys(config) : [],
      hasConfig: !!config
    });

    // Validar datos requeridos
    if (!provider || !config) {
      return NextResponse.json({ 
        error: 'Provider y config son requeridos' 
      }, { status: 400 });
    }

    // Validar que el proveedor sea válido
    if (!['gmail', 'web3forms', 'resend'].includes(provider)) {
      return NextResponse.json({ 
        error: 'Proveedor no válido. Debe ser gmail, web3forms o resend' 
      }, { status: 400 });
    }

    // Validar configuración según el proveedor
    let isConfigValid = false;
    let missingFields: string[] = [];

    switch (provider) {
      case 'gmail':
        isConfigValid = !!(config.gmailUser && config.gmailPassword);
        if (!config.gmailUser) missingFields.push('gmailUser');
        if (!config.gmailPassword) missingFields.push('gmailPassword');
        break;
      case 'web3forms':
        isConfigValid = !!(config.web3formsKey && config.senderEmail);
        if (!config.web3formsKey) missingFields.push('web3formsKey');
        if (!config.senderEmail) missingFields.push('senderEmail');
        break;
      case 'resend':
        isConfigValid = !!(config.resendApiKey && config.resendFromEmail);
        if (!config.resendApiKey) missingFields.push('resendApiKey');
        if (!config.resendFromEmail) missingFields.push('resendFromEmail');
        break;
    }

    if (!isConfigValid) {
      console.log('❌ Configuración no válida:', { provider, missingFields });
      return NextResponse.json({ 
        error: `Configuración incompleta para ${provider}`,
        missingFields
      }, { status: 400 });
    }

    // Actualizar configuración en la base de datos
    const success = await updateUserEmailProviderAsync(userEmail, { provider, config });

    if (!success) {
      return NextResponse.json({ 
        error: 'Error actualizando configuración en la base de datos' 
      }, { status: 500 });
    }

    console.log('✅ Configuración actualizada exitosamente:', {
      userEmail,
      provider,
      configKeys: Object.keys(config)
    });

    return NextResponse.json({ 
      success: true,
      message: 'Configuración actualizada exitosamente',
      provider,
      syncedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error en POST /user/email-provider:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

// GET: Obtener configuración actual de proveedor de email
export async function GET(request: NextRequest) {
  try {
    console.log('📧 API /user/email-provider GET: Obteniendo configuración');
    
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      return NextResponse.json({ 
        error: 'Email del usuario requerido en headers' 
      }, { status: 400 });
    }

    const config = await getUserEmailProviderAsync(userEmail);
    
    console.log('📋 Configuración obtenida:', {
      userEmail,
      hasConfig: !!config,
      provider: config?.provider,
      configKeys: config?.config ? Object.keys(config.config) : []
    });

    if (!config) {
      return NextResponse.json({ 
        provider: null,
        config: null,
        message: 'No hay configuración guardada'
      });
    }

    // Verificar si es una llamada interna (desde EmailFallbackSystem)
    const isInternalCall = request.headers.get('x-internal-call') === 'true';
    
    if (isInternalCall) {
      // Para llamadas internas, devolver la configuración completa
      console.log('🔒 Llamada interna: devolviendo configuración completa');
      return NextResponse.json({
        provider: config.provider,
        config: config.config
      });
    }

    // Para llamadas externas, no devolver datos sensibles
    const safeConfig = {
      provider: config.provider,
      hasConfig: !!(config.config && Object.keys(config.config).length > 0),
      configuredFields: config.config ? Object.keys(config.config) : [],
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(safeConfig);

  } catch (error) {
    console.error('❌ Error en GET /user/email-provider:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

// DELETE: Limpiar configuración de proveedor de email
export async function DELETE(request: NextRequest) {
  try {
    console.log('📧 API /user/email-provider DELETE: Limpiando configuración');
    
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      return NextResponse.json({ 
        error: 'Email del usuario requerido en headers' 
      }, { status: 400 });
    }

    const { clearUserEmailProviderAsync } = await import('../../../lib/database');
    const success = await clearUserEmailProviderAsync(userEmail);

    if (!success) {
      return NextResponse.json({ 
        error: 'Error limpiando configuración' 
      }, { status: 500 });
    }

    console.log('✅ Configuración limpiada exitosamente:', { userEmail });

    return NextResponse.json({ 
      success: true,
      message: 'Configuración limpiada exitosamente',
      clearedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error en DELETE /user/email-provider:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}