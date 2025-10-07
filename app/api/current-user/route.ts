import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Verificar si Supabase está disponible
    if (!supabase) {
      return NextResponse.json({ 
        error: 'Supabase not configured',
        hasSession: false 
      }, { status: 200 })
    }

    // Obtener la sesión actual de Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      return NextResponse.json({ 
        error: 'Error al obtener sesión',
        details: sessionError.message 
      }, { status: 401 })
    }

    if (!session?.user) {
      return NextResponse.json({ 
        error: 'No hay sesión activa',
        hasSession: false 
      }, { status: 401 })
    }

    const user = session.user

    return NextResponse.json({
      authenticated: true,
      hasSession: true,
      user: {
        id: user.id,
        email: user.email,
        hasEmail: !!user.email,
        createdAt: user.created_at,
        userMetadata: user.user_metadata || {}
      },
      message: user.email ? 'Usuario con email' : 'Usuario sin email'
    })

  } catch (error) {
    console.error('Error en current-user:', error)
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}