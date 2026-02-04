import { NextRequest, NextResponse } from 'next/server'
import { createOrUpdateUserAsync } from '../../lib/database'
import { notifyMake } from '../../lib/make-utils'
import { createOrUpdateSupabaseUser } from '../../lib/auth/supabase-admin'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { email, subscriptionStatus = 'free', id: externalId } = await request.json()

    if (!email) {
      return NextResponse.json({
        error: 'Email requerido'
      }, { status: 400 })
    }

    console.log('📝 Registrando usuario:', email)

    // Sync with KV (Legacy)
    const newUser = await createOrUpdateUserAsync({
      email: email,
      subscriptionStatus: subscriptionStatus,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    })

    // Sync with Supabase (New)
    try {
      const supabaseId = externalId || uuidv4()
      await createOrUpdateSupabaseUser(supabaseId, email, {
        full_name: email.split('@')[0],
      })
      console.log('✅ Sincronizado con Supabase')
    } catch (supabaseError) {
      console.error('⚠️ Error sincronizando con Supabase:', supabaseError)
      // We don't fail the whole request if Supabase fails for now, 
      // but in production we should ensure this works.
    }

    console.log('✅ Usuario registrado exitosamente:', newUser)

    // Notificar a Make.com para onboarding
    await notifyMake('user.registered', {
      email: email,
      subscriptionStatus: subscriptionStatus,
    })

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
