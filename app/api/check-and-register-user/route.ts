import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../lib/supabase'
import { getUserByEmailAsync, createOrUpdateUserAsync } from '../../lib/database'

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

    // Verificar si el usuario tiene email
    if (!user.email) {
      return NextResponse.json({
        error: 'Usuario sin email',
        user: {
          id: user.id,
          email: null,
          hasEmail: false
        },
        message: 'El usuario autenticado no tiene un email asociado'
      }, { status: 400 })
    }

    // Buscar usuario en la base de datos local
    console.log('🔍 Buscando usuario en BD local:', user.email)
    const localUser = await getUserByEmailAsync(user.email)
    
    if (localUser) {
      console.log('✅ Usuario encontrado en BD local:', localUser.email)
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          hasEmail: true,
          localUser: localUser
        },
        message: 'Usuario encontrado en base de datos local'
      })
    } else {
      console.log('❌ Usuario NO encontrado en BD local, registrando...')
      
      // Registrar usuario automáticamente
      try {
        const newUser = await createOrUpdateUserAsync({
          email: user.email,
          subscriptionStatus: 'free',
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString()
        })
        
        console.log('✅ Usuario registrado exitosamente:', newUser.email)
        
        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            hasEmail: true,
            localUser: newUser,
            wasRegistered: true
          },
          message: 'Usuario registrado automáticamente en base de datos local'
        })
      } catch (registrationError) {
        console.error('❌ Error al registrar usuario:', registrationError)
        return NextResponse.json({
          error: 'Error al registrar usuario',
          user: {
            id: user.id,
            email: user.email,
            hasEmail: true
          },
          registrationError: registrationError instanceof Error ? registrationError.message : 'Error desconocido',
          message: 'Usuario autenticado pero error al registrar en BD local'
        }, { status: 500 })
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error)
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}