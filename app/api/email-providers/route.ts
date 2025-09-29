import { NextRequest, NextResponse } from 'next/server';
import { updateUserEmailProviderAsync, getUserEmailProviderAsync } from '../../lib/database';

export interface EmailProviderConfig {
  provider: 'gmail' | 'web3forms' | 'resend';
  config: {
    // Gmail
    gmailUser?: string;
    gmailPassword?: string;
    // Web3Forms
    web3formsKey?: string;
    senderEmail?: string;
    // Resend
    resendApiKey?: string;
    resendFromEmail?: string;
  };
}

// GET - Obtener configuración del proveedor de email del usuario
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

    const providerConfig = await getUserEmailProviderAsync(email);
    
    return NextResponse.json({
      success: true,
      provider: providerConfig?.provider || 'gmail',
      config: providerConfig?.config || {},
      hasConfig: !!(providerConfig?.config && Object.keys(providerConfig.config).length > 0)
    });
  } catch (error) {
    console.error('Error getting email provider config:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// POST - Guardar configuración del proveedor de email del usuario
export async function POST(request: NextRequest) {
  try {
    const { email, provider, config } = await request.json();
    
    console.log('🔄 POST /api/email-providers - Datos recibidos:');
    console.log('📧 Email:', email);
    console.log('🏷️ Provider:', provider);
    console.log('⚙️ Config:', config);
    console.log('🔑 Config keys:', Object.keys(config || {}));
    console.log('📝 Config values:', JSON.stringify(config, null, 2));

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!provider || !['gmail', 'web3forms', 'resend'].includes(provider)) {
      return NextResponse.json(
        { error: 'Valid provider is required (gmail, web3forms, resend)' },
        { status: 400 }
      );
    }

    if (!config || typeof config !== 'object') {
      return NextResponse.json(
        { error: 'Config object is required' },
        { status: 400 }
      );
    }

    // Validar configuración según el proveedor
    if (provider === 'gmail') {
      if (!config.gmailUser || !config.gmailPassword) {
        return NextResponse.json(
          { error: 'Gmail user and password are required for Gmail provider' },
          { status: 400 }
        );
      }
    } else if (provider === 'web3forms') {
      if (!config.web3formsKey || !config.senderEmail) {
        return NextResponse.json(
          { error: 'Web3Forms key and sender email are required for Web3Forms provider' },
          { status: 400 }
        );
      }
    } else if (provider === 'resend') {
      if (!config.resendApiKey || !config.resendFromEmail) {
        return NextResponse.json(
          { error: 'Resend API key and from email are required for Resend provider' },
          { status: 400 }
        );
      }
    }

    const success = await updateUserEmailProviderAsync(email, { provider, config });
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: `${provider} configuration saved successfully`
      });
    } else {
      return NextResponse.json(
        { error: `Failed to save ${provider} configuration` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error saving email provider config:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar configuración del proveedor de email del usuario
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

    const success = await updateUserEmailProviderAsync(email, { provider: 'gmail', config: {} });
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Email provider configuration deleted successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete email provider configuration' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting email provider config:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}