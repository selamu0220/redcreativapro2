import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
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

    // Obtener todos los usuarios de Supabase (si es posible)
    // Nota: Esto puede requerir permisos de admin
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()

    return NextResponse.json({
      currentUser: {
        id: user.id,
        email: user.email,
        hasEmail: !!user.email,
        createdAt: user.created_at,
        userMetadata: user.user_metadata || {}
      },
      allUsers: usersError ? null : users,
      usersError: usersError ? usersError.message : null,
      message: 'Información de usuarios obtenida'
    })

  } catch (error) {
    console.error('Error en users-info:', error)
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}