import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkSubscriptionStatus } from './app/lib/middleware/subscription'

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

// Rutas que requieren suscripción premium
const premiumPaths = [
  '/api/ai-studio-key',
  '/api/prompts/premium',
  '/api/export/premium',
  '/api/documents/premium',
  '/api/business-context/premium'
]

// Rutas públicas que no requieren autenticación
const publicPaths = [
  '/api/subscribe',
  '/api/unsubscribe', 
  '/api/qualification-responses',
  '/api/stripe',
  '/api/webhooks/stripe',
  '/api/subscription',
  '/api/subscription/cancel',
  '/api/subscription/create',
  '/api/subscription/status',
  '/api/test-connection',
  '/api/chat',
  '/api/improve-text',
  '/api/improve-content',
  '/api/send-email',
  '/api/generate-email',
  '/api/execute-chain',
  '/api/test-openrouter',
  '/api/users/check-admin',
  '/api/users/provision-database',
  '/api/users', // Permitir registro de nuevos usuarios
  '/api/admin/provision-all-users',
  '/api/admin/provision-user',
  '/api/debug/check-separation',
  '/api/public'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log(`[MIDDLEWARE] Accessed path: ${pathname} method: ${request.method}`);

  // Skip middleware during build time
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    return NextResponse.next()
  }

  // Solo aplicar middleware a rutas de API
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Verificar si es una ruta pública
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  if (isPublicPath) {
    console.log(`[MIDDLEWARE] Public path accessed: ${pathname} method: ${request.method}`);
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
    
    // Verificar el token de Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase configuration missing')
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      )
    }

    // Crear cliente de Supabase con service role para verificar tokens
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    try {
      // Verificar el token JWT de Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token)
      
      if (error || !user) {
        console.log(`[MIDDLEWARE] Invalid Supabase token: ${error?.message}`)
        return NextResponse.json(
          { error: 'Token de autenticación inválido o expirado' },
          { status: 401 }
        )
      }

      // Obtener el email del usuario del token verificado
      const userEmail = user.email
      if (!userEmail) {
        return NextResponse.json(
          { error: 'Email no encontrado en el token' },
          { status: 401 }
        )
      }
      
      console.log(`[MIDDLEWARE] Valid Supabase token for user: ${userEmail}`)

      // Verificar que el email del header coincida con el del token
      const headerEmail = request.headers.get('x-user-email')
      if (headerEmail && headerEmail !== userEmail) {
        return NextResponse.json(
          { error: 'Email del header no coincide con el token' },
          { status: 403 }
        )
      }

      // Verificar si la ruta requiere suscripción premium
      const isPremiumPath = premiumPaths.some(path => pathname.startsWith(path))
      
      if (isPremiumPath) {
        try {
          // Verificar el estado de suscripción del usuario
          const subscriptionData = await checkSubscriptionStatus(user.id)
          
          if (!subscriptionData || !subscriptionData.isActive) {
            console.log(`[MIDDLEWARE] Premium access denied for ${userEmail} on ${pathname}`)
            return NextResponse.json(
              { 
                error: 'Suscripción premium requerida',
                code: 'PREMIUM_REQUIRED',
                upgradeUrl: '/planes'
              },
              { status: 403 }
            )
          }
          
          console.log(`[MIDDLEWARE] Premium access granted for ${userEmail} on ${pathname}`)
        } catch (error) {
          console.error('Error verificando suscripción:', error)
          return NextResponse.json(
            { 
              error: 'Error verificando suscripción',
              code: 'SUBSCRIPTION_CHECK_ERROR'
            },
            { status: 500 }
          )
        }
      }

      // Agregar el email verificado al header para las rutas de API
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-email', userEmail)
      requestHeaders.set('x-user-uid', user.id)

      return NextResponse.next({
        request: {
          headers: requestHeaders
        }
      })
      
    } catch (supabaseError) {
      console.error('Error verificando token de Supabase:', supabaseError)
      return NextResponse.json(
        { error: 'Token de autenticación inválido' },
        { status: 401 }
      )
    }

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