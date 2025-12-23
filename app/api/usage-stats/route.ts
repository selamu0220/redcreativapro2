import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getUsageData, getUserByEmailAsync } from '../../lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 [USAGE-STATS] Iniciando obtención de estadísticas de uso');
    
    // Verificar autenticación con Clerk
    const { userId } = getAuth(request);
    if (!userId) {
      console.log('❌ [USAGE-STATS] Usuario no autenticado');
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    // Obtener el email del usuario desde Clerk
    // Nota: En una implementación real, podrías usar el SDK de Clerk para obtener el email si no viene en el token
    // Pero aquí asumimos que el frontend maneja la sesión y nosotros verificamos el userId.
    // Para obtener el email, consultamos nuestro servicio de usuario actual o el SDK
    
    // Obtenemos el usuario de nuestra base de datos por el userId o email
    // Como el sistema actual usa email como clave, necesitamos mapear userId -> email
    // Por ahora, intentaremos obtener el email de los headers si el frontend lo envía,
    // o de una ruta interna de Clerk.
    
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.substring(7);
    
    // Simulación de obtención de email (ajustar según cómo Clerk esté configurado en el frontend)
    // Usamos el endpoint de current-user que ya debe estar configurado para Clerk
    const baseUrl = new URL(request.url).origin;
    const userRes = await fetch(`${baseUrl}/api/current-user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!userRes.ok) {
        console.log('❌ [USAGE-STATS] No se pudo obtener el email del usuario');
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    
    const { email: userEmail } = await userRes.json();
    
    if (!userEmail) {
      console.log('❌ [USAGE-STATS] Usuario sin email');
      return NextResponse.json(
        { error: 'Email de usuario no encontrado' },
        { status: 401 }
      );
    }

    console.log('✅ [USAGE-STATS] Usuario autenticado:', userEmail);

    // Verificar que el usuario existe en la base de datos local
    const dbUser = await getUserByEmailAsync(userEmail);
    if (!dbUser) {
      console.log('❌ [USAGE-STATS] Usuario no encontrado en la base de datos:', userEmail);
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Obtener datos de uso del usuario
    const allUsageData = await getUsageData();
    const userUsageData = allUsageData.filter(usage => usage.email === userEmail);

    console.log(`📈 [USAGE-STATS] Datos de uso encontrados: ${userUsageData.length} registros`);

    // Calcular estadísticas del día actual
    const today = new Date().toISOString().split('T')[0];
    const todayUsage = userUsageData.find(usage => usage.date === today) || {
      escritorIA: 0,
      correosIA: 0,
      prompts: 0,
    };

    // Calcular total de generaciones (suma de todos los días)
    const totalGenerations = userUsageData.reduce(
      (total, usage) => total + (usage.escritorIA || 0) + (usage.correosIA || 0) + (usage.prompts || 0),
      0
    );

    // Calcular generaciones de hoy
    const generationsToday = (todayUsage.escritorIA || 0) + (todayUsage.correosIA || 0) + (todayUsage.prompts || 0);

    // Determinar límite diario basado en el estado de suscripción
    const subscriptionStatus = dbUser.subscriptionStatus || 'free';
    const dailyLimit = subscriptionStatus === 'premium' ? 1000 : 50; // Límites ejemplo

    console.log('📊 [USAGE-STATS] Estadísticas calculadas:', {
      totalGenerations,
      generationsToday,
      dailyLimit,
      subscriptionStatus
    });

    // Devolver estadísticas en el formato esperado por la página
    return NextResponse.json({
      totalGenerations,
      generationsToday,
      dailyLimit,
      subscriptionStatus,
      userSince: dbUser.createdAt,
      lastActive: dbUser.lastActiveAt,
      todayBreakdown: {
        escritorIA: todayUsage.escritorIA || 0,
        correosIA: todayUsage.correosIA || 0,
        prompts: todayUsage.prompts || 0
      }
    });

  } catch (error) {
    console.error('💥 [USAGE-STATS] Error al obtener estadísticas:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
