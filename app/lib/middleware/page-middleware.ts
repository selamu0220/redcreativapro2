import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { subscriptionMiddleware, requiresPremium } from './subscription';

// Configuración de Supabase para middleware
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Only create Supabase client if environment variables are available
let supabase: any = null;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
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