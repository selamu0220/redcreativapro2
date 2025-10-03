import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Obtener la sesión actual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Error al obtener sesión:', sessionError)
      return NextResponse.json({ 
        authenticated: false, 
        error: 'Error al verificar sesión',
        details: sessionError.message 
      }, { status: 500 })
    }

    if (!session) {
      return NextResponse.json({ 
        authenticated: false,
        message: 'No hay sesión activa'
      })
    }

    // Obtener información del usuario
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('Error al obtener usuario:', userError)
      return NextResponse.json({ 
        authenticated: true, 
        session: true,
        error: 'Error al obtener información del usuario',
        details: userError.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      authenticated: true,
      session: true,
      user: {
        id: user?.id,
        email: user?.email,
        emailVerified: user?.email_confirmed_at,
        createdAt: user?.created_at,
        updatedAt: user?.updated_at
      }
    })

  } catch (error) {
    console.error('Error en auth-status:', error)
    return NextResponse.json({ 
      authenticated: false, 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}