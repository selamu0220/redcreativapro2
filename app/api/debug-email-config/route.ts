import { NextRequest, NextResponse } from 'next/server';
import { getUserEmailProviderAsync } from '../../lib/database';

// GET: Debug endpoint para verificar configuración de email del usuario
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 === DEBUG EMAIL CONFIG ENDPOINT ===');
    
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      return NextResponse.json({ 
        error: 'Email del usuario requerido en headers' 
      }, { status: 400 });
    }

    console.log('👤 Debugging config for user:', userEmail);

    // Obtener configuración del usuario
    const emailProviderConfig = await getUserEmailProviderAsync(userEmail);
    
    console.log('📋 Raw config from database:', emailProviderConfig);

    // Preparar respuesta de debug
    const debugInfo = {
      userEmail,
      timestamp: new Date().toISOString(),
      hasConfig: !!emailProviderConfig,
      provider: emailProviderConfig?.provider || 'none',
      configKeys: emailProviderConfig?.config ? Object.keys(emailProviderConfig.config) : [],
      configDetails: {
        hasGmailConfig: !!(emailProviderConfig?.config?.gmailUser && emailProviderConfig?.config?.gmailPassword),
        hasWeb3FormsConfig: !!(emailProviderConfig?.config?.web3formsKey && emailProviderConfig?.config?.senderEmail),
        hasResendConfig: !!(emailProviderConfig?.config?.resendApiKey && emailProviderConfig?.config?.resendFromEmail),
      },
      rawConfig: emailProviderConfig
    };

    console.log('✅ Debug info prepared:', debugInfo);

    return NextResponse.json({
      success: true,
      debug: debugInfo
    });

  } catch (error) {
    console.error('❌ Error in debug endpoint:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}