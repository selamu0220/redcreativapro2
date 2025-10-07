import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Verificar si Supabase está disponible
    if (!supabase) {
      return NextResponse.json({ 
        authenticated: false, 
        error: 'Supabase not configured',
        hasSession: false 
      }, { status: 200 });
    }

    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      return NextResponse.json({ 
        authenticated: false, 
        error: error.message,
        hasSession: false 
      }, { status: 401 });
    }

    if (!session?.user) {
      return NextResponse.json({ 
        authenticated: false,
        hasSession: false,
        message: 'No hay sesión activa'
      }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      hasSession: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        created_at: session.user.created_at
      }
    });

  } catch (error) {
    console.error('❌ Error en check-auth:', error);
    return NextResponse.json({
      authenticated: false,
      hasSession: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}