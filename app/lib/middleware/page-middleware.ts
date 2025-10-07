import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { subscriptionMiddleware, requiresPremium } from './subscription';

// Configuración de Supabase para middleware
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Only create Supabase client if environment variables are available
let supabase: any = null;
if (supabaseUrl && supabaseServiceKey && supabaseUrl !== 'your_supabase_url' && supabaseServiceKey !== 'your_supabase_service_role_key') {
  try {
    // Validar URL
    new URL(supabaseUrl);
    supabase = createClient(supabaseUrl, supabaseServiceKey);
  } catch (error) {
    console.warn('Failed to initialize Supabase client during build:', error);
    supabase = null;
  }
} else {
  console.warn('Supabase environment variables not configured or using placeholder values');
}

export async function pageMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`[PAGE MIDDLEWARE] Checking access to: ${pathname}`);

  // Rutas públicas que no requieren verificación
  const publicPaths = [
    '/',
    '/auth',
    '/auth/login',
    '/auth/register',
    '/planes',
    '/blog',
    '/blog/*',
    '/api/*',
    '/_next/*',
    '/static/*',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml'
  ];

  // Verificar si es una ruta pública
  const isPublicPath = publicPaths.some(path => {
    if (path.endsWith('*')) {
      return pathname.startsWith(path.slice(0, -1));
    }
    return pathname === path;
  });

  if (isPublicPath) {
    console.log(`[PAGE MIDDLEWARE] Public path, allowing access: ${pathname}`);
    return NextResponse.next();
  }

  // Obtener token de autenticación de las cookies
  const token = request.cookies.get('sb-access-token')?.value;
  
  if (!token) {
    console.log(`[PAGE MIDDLEWARE] No token found for: ${pathname}`);
    // Para rutas que requieren suscripción, redirigir al login
    if (requiresPremium(pathname)) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  try {
    // Verificar si Supabase está disponible
    if (!supabase) {
      console.log(`[PAGE MIDDLEWARE] Supabase not configured for: ${pathname}`);
      return NextResponse.next();
    }

    // Verificar token y obtener usuario
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.log(`[PAGE MIDDLEWARE] Invalid token for: ${pathname}`);
      // Para rutas que requieren suscripción, redirigir al login
      if (requiresPremium(pathname)) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }

    console.log(`[PAGE MIDDLEWARE] Valid user: ${user.email} accessing: ${pathname}`);

    // Verificar si la ruta requiere suscripción premium
    if (requiresPremium(pathname)) {
      console.log(`[PAGE MIDDLEWARE] Premium route detected: ${pathname}`);
      // Usar el middleware de suscripción existente
      return subscriptionMiddleware(request);
    }

    // Para rutas protegidas pero no premium, permitir acceso si está autenticado
    return NextResponse.next();
    
  } catch (error) {
    console.error('[PAGE MIDDLEWARE] Error:', error);
    // En caso de error, permitir acceso pero loggear
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};