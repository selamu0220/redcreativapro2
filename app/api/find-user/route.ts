import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmailAsync } from '../../lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ 
        error: 'Email requerido como parámetro' 
      }, { status: 400 })
    }

    console.log('🔍 Buscando usuario por email:', email)
    const user = await getUserByEmailAsync(email)
    
    if (user) {
      console.log('✅ Usuario encontrado:', user)
      return NextResponse.json({
        found: true,
        user: user,
        message: 'Usuario encontrado en la base de datos'
      })
    } else {
      console.log('❌ Usuario no encontrado para email:', email)
      return NextResponse.json({
        found: false,
        user: null,
        message: 'Usuario no encontrado en la base de datos'
      })
    }

  } catch (error) {
    console.error('❌ Error al buscar usuario:', error)
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}