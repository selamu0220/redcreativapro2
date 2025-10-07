import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUsageData, getUserByEmailAsync } from '../../lib/database';

// Safe Supabase client initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validar que las URLs de Supabase sean válidas
function isValidSupabaseUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:' && parsedUrl.hostname.includes('supabase');
  } catch {
    return false;
  }
}

let supabase: any = null;
if (supabaseUrl && supabaseServiceKey && isValidSupabaseUrl(supabaseUrl)) {
  try {
    // Verificar que las variables no sean placeholders

    if (!supabaseUrl || !supabaseServiceKey || 

        supabaseUrl === 'your_supabase_url' || 

        supabaseServiceKey === 'your_supabase_service_role_key') {

      console.warn('Supabase environment variables not configured or using placeholder values');

      supabase = null;

    } else {

      try {

        // Validar URL

        new URL(supabaseUrl);

        supabase = createClient(supabaseUrl, supabaseServiceKey);

      } catch (error) {

        console.warn('Failed to initialize Supabase client during build:', error);

        supabase = null;

      }

    }
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error);
    supabase = null;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 [USAGE-STATS] Iniciando obtención de estadísticas de uso');

    // Check if Supabase client is available
    if (!supabase) {
      console.warn('Supabase client not available during build');
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [USAGE-STATS] Token de autorización faltante');
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verificar si Supabase está disponible
    if (!supabase) {
      console.log('❌ [USAGE-STATS] Supabase not configured');
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // Verificar el token con Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user || !user.email) {
      console.log('❌ [USAGE-STATS] Token inválido o usuario sin email:', authError?.message);
      return NextResponse.json(
        { error: 'Token de autenticación inválido' },
        { status: 401 }
      );
    }

    const userEmail = user.email;
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
    const allUsageData = getUsageData();
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
      // Campos adicionales que podrían ser útiles
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