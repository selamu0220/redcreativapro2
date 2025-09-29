import { NextRequest, NextResponse } from 'next/server';
import { getUserEmailProviderAsync } from '../../../lib/database';

export async function GET(request: NextRequest) {
  console.log('🔍 === TEST LOGGING ENDPOINT ===');
  
  const userEmail = 'usuario@test.com';
  console.log('📧 Testing with user email:', userEmail);
  
  try {
    const config = await getUserEmailProviderAsync(userEmail);
    console.log('🔧 Retrieved config:', {
      hasConfig: !!config,
      provider: config?.provider,
      configKeys: config?.config ? Object.keys(config.config) : []
    });
    
    return NextResponse.json({
      success: true,
      userEmail,
      hasConfig: !!config,
      provider: config?.provider || null,
      configKeys: config?.config ? Object.keys(config.config) : []
    });
  } catch (error) {
    console.error('❌ Error in test logging:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}