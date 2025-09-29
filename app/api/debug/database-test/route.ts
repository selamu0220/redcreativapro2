import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserByEmailAsync, 
  updateUserEmailProviderAsync, 
  getUserEmailProviderAsync,
  getUsersAsync 
} from '../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 === INICIANDO PRUEBA DE BASE DE DATOS ===');
    
    const userEmail = request.headers.get('x-user-email') || 'test@example.com';
    console.log('📧 Email de prueba:', userEmail);

    // 1. Verificar conexión básica obteniendo todos los usuarios
    console.log('\n1️⃣ Probando obtención de usuarios...');
    const allUsers = await getUsersAsync();
    console.log('👥 Total de usuarios en base de datos:', allUsers.length);
    console.log('📋 Primeros 3 usuarios:', allUsers.slice(0, 3).map(u => ({
      email: u.email,
      hasEmailProvider: !!(u as any).emailProvider,
      emailProvider: (u as any).emailProvider
    })));

    // 2. Buscar usuario específico
    console.log('\n2️⃣ Probando búsqueda de usuario específico...');
    const user = await getUserByEmailAsync(userEmail);
    console.log('🔍 Usuario encontrado:', {
      exists: !!user,
      email: user?.email,
      subscriptionStatus: user?.subscriptionStatus,
      hasEmailProvider: !!(user as any)?.emailProvider,
      emailProvider: (user as any)?.emailProvider,
      hasEmailProviderConfig: !!(user as any)?.emailProviderConfig
    });

    // 3. Probar guardado de configuración de email
    console.log('\n3️⃣ Probando guardado de configuración de email...');
    const testConfig = {
      provider: 'resend' as const,
      config: {
        resendApiKey: 'test-api-key-' + Date.now(),
        resendFromEmail: 'test@example.com'
      }
    };
    
    const saveResult = await updateUserEmailProviderAsync(userEmail, testConfig);
    console.log('💾 Resultado del guardado:', saveResult);

    // 4. Verificar que se guardó correctamente
    console.log('\n4️⃣ Verificando configuración guardada...');
    const savedConfig = await getUserEmailProviderAsync(userEmail);
    console.log('📖 Configuración recuperada:', {
      hasConfig: !!savedConfig,
      provider: savedConfig?.provider,
      configKeys: savedConfig?.config ? Object.keys(savedConfig.config) : [],
      resendApiKey: savedConfig?.config?.resendApiKey ? 'PRESENTE' : 'AUSENTE',
      resendFromEmail: savedConfig?.config?.resendFromEmail
    });

    // 5. Verificar usuario actualizado
    console.log('\n5️⃣ Verificando usuario después del guardado...');
    const updatedUser = await getUserByEmailAsync(userEmail);
    console.log('🔄 Usuario actualizado:', {
      email: updatedUser?.email,
      emailProvider: (updatedUser as any)?.emailProvider,
      hasEmailProviderConfig: !!(updatedUser as any)?.emailProviderConfig,
      configKeys: (updatedUser as any)?.emailProviderConfig ? Object.keys((updatedUser as any).emailProviderConfig) : []
    });

    console.log('\n✅ === PRUEBA DE BASE DE DATOS COMPLETADA ===');

    return NextResponse.json({
      success: true,
      message: 'Prueba de base de datos completada exitosamente',
      results: {
        totalUsers: allUsers.length,
        userExists: !!user,
        configSaved: saveResult,
        configRetrieved: !!savedConfig,
        configMatches: savedConfig?.provider === testConfig.provider
      },
      details: {
        originalUser: user ? {
          email: user.email,
          emailProvider: (user as any).emailProvider
        } : null,
        savedConfig: savedConfig,
        updatedUser: updatedUser ? {
          email: updatedUser.email,
          emailProvider: (updatedUser as any).emailProvider
        } : null
      }
    });

  } catch (error) {
    console.error('❌ Error en prueba de base de datos:', error);
    return NextResponse.json({
      success: false,
      error: 'Error en prueba de base de datos',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userEmail, testConfig } = await request.json();
    
    if (!userEmail) {
      return NextResponse.json({ error: 'userEmail requerido' }, { status: 400 });
    }

    console.log('🧪 Prueba POST con datos personalizados:', { userEmail, testConfig });

    // Probar guardado con configuración personalizada
    const saveResult = await updateUserEmailProviderAsync(userEmail, testConfig);
    const retrievedConfig = await getUserEmailProviderAsync(userEmail);

    return NextResponse.json({
      success: true,
      saveResult,
      retrievedConfig,
      matches: JSON.stringify(retrievedConfig) === JSON.stringify(testConfig)
    });

  } catch (error) {
    console.error('❌ Error en POST database-test:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}