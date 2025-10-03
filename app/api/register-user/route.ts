import { NextRequest, NextResponse } from 'next/server'
import { createOrUpdateUserAsync } from '../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const { email, subscriptionStatus = 'free' } = await request.json()

    if (!email) {
      return NextResponse.json({ 
        error: 'Email requerido' 
      }, { status: 400 })
    }

    console.log('📝 Registrando usuario manualmente:', email)

    // Crear usuario con datos básicos
    const newUser = await createOrUpdateUserAsync({
      email: email,
      subscriptionStatus: subscriptionStatus,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    })

    console.log('✅ Usuario registrado exitosamente:', newUser)

    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'Usuario registrado exitosamente'
    })

  } catch (error) {
    console.error('❌ Error al registrar usuario:', error)
    return NextResponse.json({
      error: 'Error al registrar usuario',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}