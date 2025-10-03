import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Obtener información de usuarios de Supabase (solo si hay sesión activa)
    let supabaseUsers: any[] = []
    let sessionInfo = null
    let localUsers: any[] = []
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (!sessionError && session) {
        sessionInfo = {
          user: {
            id: session.user.id,
            email: session.user.email,
            emailVerified: session.user.email_confirmed_at,
            createdAt: session.user.created_at
          }
        }
        
        // Solo intentar obtener todos los usuarios si hay sesión activa
        // Nota: esto requiere permisos de admin
        const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
        
        if (!usersError && users) {
          supabaseUsers = users.users.map(user => ({
            id: user.id,
            email: user.email,
            emailVerified: user.email_confirmed_at,
            createdAt: user.created_at,
            updatedAt: user.updated_at
          }))
        }
        
        // Verificar si el usuario actual está en la base de datos local
        // usando el endpoint de check-and-register-user
        try {
          const checkResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3005'}/api/check-and-register-user`, {
            headers: {
              'Cookie': request.headers.get('cookie') || ''
            }
          })
          
          if (checkResponse.ok) {
            const checkData = await checkResponse.json()
            if (checkData.user) {
              localUsers = [checkData.user]
            }
          }
        } catch (localError) {
          console.log('No se pudo verificar usuario local:', localError)
        }
      }
    } catch (authError) {
      console.log('No se pudo obtener información de Supabase (requiere autenticación)')
    }

    return NextResponse.json({
      success: true,
      localDatabase: {
        count: localUsers.length,
        users: localUsers
      },
      supabase: {
        count: supabaseUsers.length,
        users: supabaseUsers
      },
      currentSession: sessionInfo,
      summary: {
        totalLocalUsers: localUsers.length,
        totalSupabaseUsers: supabaseUsers.length,
        hasActiveSession: !!sessionInfo
      }
    })

  } catch (error) {
    console.error('Error en all-users:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}