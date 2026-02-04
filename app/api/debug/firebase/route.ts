import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseAuthAsync } from '../../../firebase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Firebase endpoint called')
    
    // Verificar variables de entorno
    const envVars = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Configurado' : '❌ No configurado',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Configurado' : '❌ No configurado',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Configurado' : '❌ No configurado',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✅ Configurado' : '❌ No configurado',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✅ Configurado' : '❌ No configurado',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ Configurado' : '❌ No configurado',
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ? '✅ Configurado' : '❌ No configurado',
    }
    
    // Intentar obtener Firebase Auth
    const auth = await getFirebaseAuthAsync()
    
    const response = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      isClient: typeof window !== 'undefined',
      firebaseConfig: {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'usando valor por defecto',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'usando valor por defecto',
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'usando valor por defecto',
      },
      envVars,
      firebaseAuth: auth ? '✅ Inicializado' : '❌ No inicializado',
      error: auth ? null : 'Firebase Auth es null',
    }
    
    console.log('📊 Debug response:', response)
    
    return NextResponse.json(response, { status: 200 })
  } catch (error: any) {
    console.error('❌ Debug endpoint error:', error)
    return NextResponse.json({
      error: 'Error en debug',
      message: error.message,
      stack: error.stack,
    }, { status: 500 })
  }
}
