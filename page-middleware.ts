import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkSubscriptionStatus } from './app/lib/middleware/subscription';

// Configuración de Supabase para middleware
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Only create Supabase client if environment variables are available
let supabase: any = null;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

// Rutas que requieren suscripción premium
const PREMIUM_ROUTES = [
  '/escritor-ia/advanced',
  '/ai-browser/premium',
  '/dashboard',
  '/dashboard/analytics',
  '/subscription/manage'
];

// Rutas públicas que no requieren autenticación
const PUBLIC_PATHS = [
  '/',
  '/auth',
  '/auth/login',
  '/auth/register',
  '/planes',
  '/blog',
  '/blog/:path*',
  '/api/:path*',
  '/_next/:path*',
  '/static/:path*',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml'
];

// Función para verificar si una ruta es pública
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(path => {
    if (path.includes(':path*')) {
      const basePath = path.replace('/:path*', '');
      return pathname === basePath || pathname.startsWith(basePath + '/');
    }
    return pathname === path;
  });
}

// Función para verificar si una ruta requiere suscripción premium
function requiresPremium(pathname: string): boolean {
  return PREMIUM_ROUTES.some(route => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`[MIDDLEWARE] Checking page access: ${pathname}`);

  // Skip middleware for API routes (handled by other middleware)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Permitir acceso a rutas públicas
  if (isPublicPath(pathname)) {
    console.log(`[MIDDLEWARE] Public path, allowing access: ${pathname}`);
    return NextResponse.next();
  }

  // Obtener token de autenticación de las cookies
  const token = request.cookies.get('sb-access-token')?.value;
  
  if (!token) {
    console.log(`[MIDDLEWARE] No token found for: ${pathname}`);
    
    // Si la ruta requiere premium, redirigir al login
    if (requiresPremium(pathname)) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      console.log(`[MIDDLEWARE] Redirecting to login: ${loginUrl}`);
      return NextResponse.redirect(loginUrl);
    }
    
    return NextResponse.next();
  }

  try {
    // Verificar token y obtener usuario
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.log(`[MIDDLEWARE] Invalid token for: ${pathname}`);
      
      // Si la ruta requiere premium, redirigir al login
      if (requiresPremium(pathname)) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
      
      return NextResponse.next();
    }

    console.log(`[MIDDLEWARE] Valid user: ${user.email} accessing: ${pathname}`);

    // Verificar si la ruta requiere suscripción premium
    if (requiresPremium(pathname)) {
      console.log(`[MIDDLEWARE] Checking subscription for premium route: ${pathname}`);
      
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
        
        console.log(`[MIDDLEWARE] Premium access granted for: ${pathname}`);
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
    console.error('[MIDDLEWARE] Error:', error);
    // En caso de error, permitir acceso pero loggear
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Aplicar a todas las rutas excepto las excluidas explícitamente
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};