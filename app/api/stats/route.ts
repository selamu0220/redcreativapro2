import { NextRequest, NextResponse } from 'next/server';
import { getUsageData, getUserByEmailAsync } from '../../lib/database';


export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const user = await getUserByEmailAsync(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Obtener todos los datos de uso del usuario
    const allUsageData = getUsageData();
    const userUsageData = allUsageData.filter(usage => usage.email === email);



    // Obtener estadísticas del día actual
    const today = new Date().toISOString().split('T')[0];
    const todayUsage = userUsageData.find(usage => usage.date === today) || {
      escritorIA: 0,
      correosIA: 0,
      prompts: 0,
    };

    // Obtener estadísticas de los últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
    
    const last30DaysUsage = userUsageData
      .filter(usage => usage.date >= thirtyDaysAgoStr)
      .reduce(
        (acc, usage) => {
          acc.textosGenerados += usage.escritorIA;
          acc.correosEnviados += usage.correosIA;
          acc.promptsUsados += usage.prompts;
          return acc;
        },
        {
          textosGenerados: 0,
          correosEnviados: 0,
          promptsUsados: 0,
        }
      );

    return NextResponse.json({
      dailyTextsGenerated: todayUsage.escritorIA,
      dailyEmailsSent: todayUsage.correosIA,
      dailyPrompts: todayUsage.prompts,
      last30DaysTextsGenerated: last30DaysUsage.textosGenerados,
      last30DaysEmailsSent: last30DaysUsage.correosEnviados,
      last30DaysPrompts: last30DaysUsage.promptsUsados,
      userSince: user.createdAt,
      lastActive: user.lastActiveAt,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}