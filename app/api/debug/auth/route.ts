import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Verificar variables de entorno
    const envVars = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Configurado' : '❌ No configurado',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ Configurado' : '❌ No configurado',
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      isServer: true,
      envVars,
      message: 'Debug endpoint ejecutándose en el servidor'
    })
  } catch (error) {
    console.error('Error en debug endpoint:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}