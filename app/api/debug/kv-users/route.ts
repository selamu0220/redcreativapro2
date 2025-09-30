import { NextRequest, NextResponse } from 'next/server';
import { getUsersAsync, getUserByEmailAsync } from '../../../lib/database';

// API de debug para verificar usuarios en KV storage
export async function GET(request: NextRequest) {
  try {
    // Verificar que sea un administrador
    const adminEmail = request.headers.get('x-user-email');
    const adminEmails = ['selamu.garcia@gmail.com', 'programar@gmail.com', 'admin@redcreativa.pro'];
    
    if (!adminEmail || !adminEmails.includes(adminEmail)) {
      return NextResponse.json(
        { error: 'Acceso no autorizado' },
        { status: 403 }
      );
    }

    // Obtener todos los usuarios del KV storage
    const users = await getUsersAsync();
    
    console.log('🔍 Debug KV Users:');
    console.log('Total usuarios en KV:', users.length);
    
    const userDetails = users.map(user => ({
      email: user.email,
      subscriptionStatus: user.subscriptionStatus,
      hasEmailProvider: !!user.emailProvider,
      emailProvider: user.emailProvider,
      hasEmailProviderConfig: !!user.emailProviderConfig,
      emailProviderConfigKeys: user.emailProviderConfig ? Object.keys(user.emailProviderConfig) : []
    }));
    
    // Probar búsqueda específica para selamu.garcia@gmail.com
    const testUser = await getUserByEmailAsync('selamu.garcia@gmail.com');
    console.log('🔍 Test getUserByEmailAsync para selamu.garcia@gmail.com:', testUser);
    
    return NextResponse.json({
      totalUsers: users.length,
      users: userDetails,
      testUserSearch: {
        email: 'selamu.garcia@gmail.com',
        found: !!testUser,
        user: testUser
      }
    });

  } catch (error) {
    console.error('Error en debug KV users:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}