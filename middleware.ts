import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkSubscriptionStatus } from './app/lib/middleware/subscription'
import { getAllowedOrigins } from './app/lib/config/api.config'

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

// Rutas de páginas que requieren suscripción premium
const premiumPagePaths = [
  '/dashboard',
  '/escritor-ia/advanced',
  '/ai-browser/premium',
  '/dashboard/analytics',
  '/subscription/manage'
];

// Rutas de API que requieren suscripción premium
const premiumPaths = [
  '/api/ai-studio-key',
  '/api/prompts/premium',
  '/api/export/premium',
  '/api/documents/premium',
  '/api/business-context/premium'
];

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
  '/api/user/profile', // Allow user profile creation and retrieval
  '/api/admin/provision-all-users',
  '/api/admin/provision-user',
  '/api/debug/check-separation',
  '/api/public',
  '/api/voice-guide' // Allow voice guide API endpoints
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log(`[MIDDLEWARE] Accessed path: ${pathname} method: ${request.method}`);

  // Forzar HTTPS en producción
  if (process.env.NODE_ENV === 'production' && 
      request.headers.get('x-forwarded-proto') !== 'https') {
    return NextResponse.redirect(
      `https://${request.headers.get('host')}${pathname}`,
      301
    );
  }

  // Redirects para URLs antiguas (ya configurados en next.config.js pero como backup)
  const legacyRedirects: Record<string, string> = {
    '/old-dashboard': '/dashboard',
    '/escritor': '/escritor-ia',
    '/correos': '/correos-ia',
    '/email-ia': '/correos-ia',
  };
  
  if (legacyRedirects[pathname]) {
    return NextResponse.redirect(
      new URL(legacyRedirects[pathname], request.url),
      301
    );
  }

  // Configurar CORS para permitir acceso desde diferentes hosts
  const response = NextResponse.next()
  
  // Headers de seguridad
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  
  // Solo en producción, agregar HSTS
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  
  // Usar configuración centralizada de CORS
  const allowedOrigins = getAllowedOrigins()
  
  const origin = request.headers.get('origin')
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-email, x-user-uid')
  }
  
  // Manejar preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-email, x-user-uid'
      }
    })
  }

  // Skip middleware during build time
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    return response
  }

  // === MANEJO DE RUTAS DE PÁGINAS ===
  if (!pathname.startsWith('/api/')) {
    // Rutas públicas que no requieren verificación
    const publicPagePaths = [
      '/',
      '/auth',
      '/auth/login',
      '/auth/register',
      '/planes',
      '/blog',
      '/_next',
      '/static',
      '/favicon.ico',
      '/robots.txt',
      '/sitemap.xml'
    ];

    // Verificar si es una ruta pública
    const isPublicPath = publicPagePaths.some(path => 
      pathname === path || pathname.startsWith(path + '/')
    );

    if (isPublicPath) {
      console.log(`[MIDDLEWARE] Public page path, allowing access: ${pathname}`);
      return NextResponse.next();
    }

    // Obtener token de autenticación de las cookies
    const token = request.cookies.get('sb-access-token')?.value;
    
    if (!token) {
      console.log(`[MIDDLEWARE] No token found for page: ${pathname}`);
      
      // Si la ruta requiere premium, redirigir al login
      if (premiumPagePaths.some(path => pathname.startsWith(path))) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        console.log(`[MIDDLEWARE] Redirecting to login: ${loginUrl}`);
        return NextResponse.redirect(loginUrl);
      }
      
      return NextResponse.next();
    }
    
    // Si hay un redirect parameter, verificar si el usuario ya está autenticado
    const redirectParam = request.nextUrl.searchParams.get('redirect');
    if (redirectParam && pathname === '/auth') {
      console.log(`[MIDDLEWARE] Auth page with redirect parameter, allowing access to complete login flow`);
      return NextResponse.next();
    }

    // Crear cliente de Supabase para verificar tokens de páginas
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    try {
      // Verificar token y obtener usuario
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        console.log(`[MIDDLEWARE] Invalid token for page: ${pathname}`);
        
        // Si la ruta requiere premium, redirigir al login
        if (premiumPagePaths.some(path => pathname.startsWith(path))) {
          const loginUrl = new URL('/auth/login', request.url);
          loginUrl.searchParams.set('redirect', pathname);
          return NextResponse.redirect(loginUrl);
        }
        
        return NextResponse.next();
      }

      console.log(`[MIDDLEWARE] Valid user: ${user.email} accessing page: ${pathname}`);

      // Verificar si la ruta requiere suscripción premium
      if (premiumPagePaths.some(path => pathname.startsWith(path))) {
        console.log(`[MIDDLEWARE] Checking subscription for premium page route: ${pathname}`);
        
        try {
          // Verificar estado de suscripción
          const subscriptionStatus = await checkSubscriptionStatus(user.id);
          
          if (!subscriptionStatus.isActive) {
            console.log(`[MIDDLEWARE] No active subscription, redirecting to planes`);
            // Redirigir a página de planes si no tiene suscripción activa
            const upgradeUrl = new URL('/planes', request.url);
            upgradeUrl.searchParams.set('feature', 'premium_access');
            upgradeUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(upgradeUrl);
          }
          
          console.log(`[MIDDLEWARE] Premium access granted for page: ${pathname}`);
        } catch (error) {
          console.error('[MIDDLEWARE] Error checking subscription:', error);
          // En caso de error, redirigir a planes
          const upgradeUrl = new URL('/planes', request.url);
          upgradeUrl.searchParams.set('error', 'subscription_check_failed');
          return NextResponse.redirect(upgradeUrl);
        }
      }

      // Usuario autenticado y con acceso permitido
      return NextResponse.next();
      
    } catch (error) {
      console.error('[MIDDLEWARE] Error verifying page access:', error);
      // En caso de error, permitir acceso pero loggear
      return NextResponse.next();
    }
  }

  // Verificar si es una ruta pública
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  if (isPublicPath) {
    console.log(`[MIDDLEWARE] Public path accessed: ${pathname} method: ${request.method}`);
    return response
  }

  // Permitir POST requests a /api/email-collection/[userEmail] (recopilación pública)
  if (pathname.match(/^\/api\/email-collection\/[^/]+$/) && request.method === 'POST') {
    return response
  }

  // Permitir GET requests a /api/email-collection/[userEmail] y /api/email-collection/[userEmail]/settings (página de administración)
  if (pathname.match(/^\/api\/email-collection\/[^/]+(\/settings)?$/) && (request.method === 'GET' || request.method === 'PUT')) {
    return response
  }

  // El endpoint de exportación requiere autenticación, se maneja más abajo

  // Verificar si es una ruta protegida
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  if (!isProtectedPath) {
    return response
  }

  console.log(`[MIDDLEWARE] Protected path accessed: ${pathname}`)

  try {
    // Obtener el token de autorización
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(`[MIDDLEWARE] Missing or invalid auth header for ${pathname}`);
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401, headers: response.headers }
      )
    }

    const token = authHeader.substring(7) // Remover 'Bearer '
    
    // Verificar el token de Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('⚠️ Missing Supabase environment variables. Using placeholder values.')
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
          { status: 401, headers: response.headers }
        )
      }

      // Obtener el email del usuario del token verificado
      const userEmail = user.email
      if (!userEmail) {
        return NextResponse.json(
        { error: 'Email no encontrado en el token' },
        { status: 401, headers: response.headers }
      )
      }
      
      console.log(`[MIDDLEWARE] Valid Supabase token for user: ${userEmail}`)

      // Verificar que el email del header coincida con el del token
      const headerEmail = request.headers.get('x-user-email')
      if (headerEmail && headerEmail !== userEmail) {
        return NextResponse.json(
        { error: 'Email del header no coincide con el token' },
        { status: 403, headers: response.headers }
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
              { status: 403, headers: response.headers }
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
            { status: 500, headers: response.headers }
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
        },
        headers: response.headers
      })
      
    } catch (supabaseError) {
      console.error('Error verificando token de Supabase:', supabaseError)
      return NextResponse.json(
        { error: 'Token de autenticación inválido' },
        { status: 401, headers: response.headers }
      )
    }

  } catch (error) {
    console.error('Error en middleware de autenticación:', error)
    return NextResponse.json(
      { error: 'Token inválido' },
      { status: 401, headers: response.headers }
    )
  }
}

export const config = {
  matcher: [
    // Aplicar a todas las rutas excepto las excluidas explícitamente
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}