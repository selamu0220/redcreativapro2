import { NextRequest, NextResponse } from 'next/server';
import { getUserEmailProviderAsync } from '../../lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');

    if (!userEmail) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    console.log(`🔍 Debug: Checking config for ${userEmail}`);
    
    // Obtener configuración del usuario
    const emailProviderConfig = await getUserEmailProviderAsync(userEmail);
    
    return NextResponse.json({
      success: true,
      userEmail,
      debug: {
        hasConfig: !!emailProviderConfig,
        provider: emailProviderConfig?.provider || 'none',
        configKeys: emailProviderConfig?.config ? Object.keys(emailProviderConfig.config) : [],
        configValues: emailProviderConfig?.config || {},
        isEmpty: !emailProviderConfig?.config || Object.keys(emailProviderConfig.config).length === 0
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}