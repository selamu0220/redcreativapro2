import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// Rutas que requieren autenticación
const protectedPaths = [
  '/api/documents',
  '/api/folders', 
  '/api/import',
  '/api/export',
  '/api/email-history',
  '/api/business-context',
  '/api/calendar',
  '/api/prompts',
  '/api/ai-studio-key',
  '/api/gmail-credentials',
  '/api/users/track-usage',
  '/api/gmail-notification',
  '/api/email-collection'
]

// Rutas públicas que no requieren autenticación
const publicPaths = [
  '/api/subscribe',
  '/api/unsubscribe', 
  '/api/qualification-responses',
  '/api/stripe',
  '/api/test-connection',
  '/api/chat',
  '/api/improve-text',
  '/api/improve-content',
  '/api/send-email',
  '/api/generate-email',
  '/api/execute-chain',
  '/api/test-gemini',
  '/api/users/check-admin',
  '/api/users/provision-database',
  '/api/users', // Permitir registro de nuevos usuarios
  '/api/admin/provision-all-users',
  '/api/admin/provision-user',
  '/api/debug/check-separation',
  '/api/email-collection',
  '/api/public'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Solo aplicar middleware a rutas de API
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Verificar si es una ruta pública
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  if (isPublicPath) {
    return NextResponse.next()
  }

  // Permitir POST requests a /api/email-collection/[userEmail] (recopilación pública)
  if (pathname.match(/^\/api\/email-collection\/[^/]+$/) && request.method === 'POST') {
    return NextResponse.next()
  }

  // Permitir GET requests a /api/email-collection/[userEmail] y /api/email-collection/[userEmail]/settings (página de administración)
  if (pathname.match(/^\/api\/email-collection\/[^/]+(\/settings)?$/) && (request.method === 'GET' || request.method === 'PUT')) {
    return NextResponse.next()
  }

  // El endpoint de exportación requiere autenticación, se maneja más abajo

  // Verificar si es una ruta protegida
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  if (!isProtectedPath) {
    return NextResponse.next()
  }

  console.log(`[MIDDLEWARE] Protected path accessed: ${pathname}`)

  try {
    // Obtener el token de autorización
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(`[MIDDLEWARE] Missing or invalid auth header for ${pathname}`);
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remover 'Bearer '
    
    // Verificar el token de Firebase
    const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    if (!firebaseProjectId) {
      console.error('NEXT_PUBLIC_FIREBASE_PROJECT_ID no está configurado')
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      )
    }

    // Obtener las claves públicas de Firebase
    const keysResponse = await fetch(
      `https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com`
    )
    const keys = await keysResponse.json()
    
    // Decodificar el token JWT
    const decoded = JSON.parse(atob(token.split('.')[1]))
    const keyId = JSON.parse(atob(token.split('.')[0])).kid
    
    if (!keys[keyId]) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Verificar que el token sea para nuestro proyecto
    if (decoded.aud !== firebaseProjectId) {
      return NextResponse.json(
        { error: 'Token inválido para este proyecto' },
        { status: 401 }
      )
    }

    // Verificar que el token no haya expirado
    if (decoded.exp < Date.now() / 1000) {
      return NextResponse.json(
        { error: 'Token expirado' },
        { status: 401 }
      )
    }

    // Obtener el email del usuario del token
    const userEmail = decoded.email
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email no encontrado en el token' },
        { status: 401 }
      )
    }

    // Verificar que el email del header coincida con el del token
    const headerEmail = request.headers.get('x-user-email')
    if (headerEmail && headerEmail !== userEmail) {
      return NextResponse.json(
        { error: 'Email del header no coincide con el token' },
        { status: 403 }
      )
    }

    // Agregar el email verificado al header para las rutas de API
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-email', userEmail)
    requestHeaders.set('x-user-uid', decoded.sub)

    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    })

  } catch (error) {
    console.error('Error en middleware de autenticación:', error)
    return NextResponse.json(
      { error: 'Token inválido' },
      { status: 401 }
    )
  }
}

export const config = {
  matcher: '/api/:path*'
}