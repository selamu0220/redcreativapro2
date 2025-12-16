import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkSubscriptionStatus } from './app/lib/middleware/subscription';

// --- INICIO: Lógica de Internacionalización (de middleware.ts) ---
const SUPPORTED_LANGUAGES = new Set(['es', 'en', 'de', 'fr', 'zh', 'pt']);

function detectLanguage(req: NextRequest): string {
  const cookieLang = req.cookies.get('redcreativa-language')?.value;
  if (cookieLang && SUPPORTED_LANGUAGES.has(cookieLang)) return cookieLang;
  
  const header = req.headers.get('accept-language') || '';
  const parts = header.split(',').map(s => s.trim());
  for (const part of parts) {
    const code = part.split(';')[0];
    const short = code.split('-')[0];
    if (SUPPORTED_LANGUAGES.has(code)) return code;
    if (SUPPORTED_LANGUAGES.has(short)) return short;
  }
  return 'es'; // Idioma por defecto
}
// --- FIN: Lógica de Internacionalización ---


// --- INICIO: Lógica de Autenticación y Rutas (de page-middleware.ts) ---

// Configuración de Supabase para middleware
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabase: any = null;
if (supabaseUrl && supabaseServiceKey && supabaseUrl !== 'your_supabase_url' && supabaseServiceKey !== 'your_supabase_service_role_key') {
  try {
    new URL(supabaseUrl);
    supabase = createClient(supabaseUrl, supabaseServiceKey);
  } catch (error) {
    console.warn('Failed to initialize Supabase client in middleware:', error);
    supabase = null;
  }
} else {
  console.warn('Middleware: Supabase environment variables not configured or using placeholder values.');
}

const PREMIUM_ROUTES = [
  '/escritor-ia/advanced',
  '/ai-browser/premium',
  '/dashboard',
  '/dashboard/analytics',
  '/subscription/manage'
];

const PUBLIC_PATHS = [
  '/',
  '/auth',
  '/auth/login',
  '/auth/register',
  '/planes',
  '/blog',
  '/api/webhooks/stripe', // Ruta pública para webhooks de Stripe
];

function isPublicPath(pathname: string): boolean {
    if (pathname.startsWith('/blog/')) return true;
    if (pathname.startsWith('/api/')) {
        // Permitir webhooks de stripe, pero proteger el resto de /api
        return pathname.startsWith('/api/webhooks/stripe');
    }
  return PUBLIC_PATHS.some(path => pathname === path);
}

function requiresPremium(pathname: string): boolean {
  return PREMIUM_ROUTES.some(route => pathname.startsWith(route));
}
// --- FIN: Lógica de Autenticación y Rutas ---


export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- 1. Exclusiones iniciales (archivos estáticos, etc.) ---
  // Adaptado del `matcher` y la lógica de ambos middlewares
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') // Excluir archivos como favicon.ico, sitemap.xml, etc.
  ) {
    return NextResponse.next();
  }

  // --- 2. Lógica de Internacionalización ---
  let response;
  let finalPathname = pathname;
  const pathParts = pathname.split('/');
  const potentialLang = pathParts[1];

  if (SUPPORTED_LANGUAGES.has(potentialLang)) {
    // La URL tiene prefijo de idioma, reescribir a la ruta interna
    const internalPath = '/' + pathParts.slice(2).join('/');
    finalPathname = internalPath === '' ? '/' : internalPath;
    
    response = NextResponse.rewrite(new URL(finalPathname, request.url));
    response.cookies.set('redcreativa-language', potentialLang, { path: '/', httpOnly: false });
  } else {
    // La URL no tiene prefijo, detectar idioma y preparar respuesta
    const lang = detectLanguage(request);
    response = NextResponse.next();
    response.cookies.set('redcreativa-language', lang, { path: '/', httpOnly: false });
  }

  console.log(`[MIDDLEWARE] Original path: ${pathname}, Handled path: ${finalPathname}`);

  // --- 3. Lógica de Autenticación y Suscripción sobre `finalPathname` ---

  // Permitir acceso a rutas públicas sin más verificaciones
  if (isPublicPath(finalPathname)) {
    console.log(`[MIDDLEWARE] Public path, allowing access: ${finalPathname}`);
    return response; // Devuelve la respuesta con la cookie de idioma
  }

  // A partir de aquí, las rutas son protegidas
  const token = request.cookies.get('sb-access-token')?.value;

  if (!token) {
    console.log(`[MIDDLEWARE] No token found for protected route: ${finalPathname}`);
    const loginUrl = new URL(`/${detectLanguage(request)}/auth/login`, request.url);
    loginUrl.searchParams.set('redirect', finalPathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si Supabase no está configurado, no podemos verificar el token.
  // Por seguridad, redirigimos a login indicando un error de configuración.
  if (!supabase) {
    console.error('[MIDDLEWARE] Supabase client not available. Cannot authenticate user.');
    const loginUrl = new URL(`/${detectLanguage(request)}/auth/login`, request.url);
    loginUrl.searchParams.set('error', 'server_config_error');
    return NextResponse.redirect(loginUrl);
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.log(`[MIDDLEWARE] Invalid token for: ${finalPathname}. Error: ${error?.message}`);
      const loginUrl = new URL(`/${detectLanguage(request)}/auth/login`, request.url);
      loginUrl.searchParams.set('redirect', finalPathname);
      // Opcional: limpiar cookies inválidas
      response.cookies.delete('sb-access-token');
      response.cookies.delete('sb-refresh-token');
      return NextResponse.redirect(loginUrl);
    }

    console.log(`[MIDDLEWARE] User ${user.email} authenticated for: ${finalPathname}`);

    // Si la ruta requiere premium, verificar la suscripción
    if (requiresPremium(finalPathname)) {
      const subscriptionStatus = await checkSubscriptionStatus(user.id);
      if (!subscriptionStatus.isActive) {
        console.log(`[MIDDLEWARE] No active subscription for ${user.email}. Redirecting to plans.`);
        const upgradeUrl = new URL('/planes', request.url);
        upgradeUrl.searchParams.set('redirect', finalPathname);
        return NextResponse.redirect(upgradeUrl);
      }
      console.log(`[MIDDLEWARE] Premium access granted for ${user.email}.`);
    }

    // Usuario autenticado y con acceso permitido, devolver la respuesta original (con reescritura de URL y cookies de idioma)
    return response;

  } catch (e) {
    console.error(`[MIDDLEWARE] Critical error: ${e}`);
    const loginUrl = new URL(`/${detectLanguage(request)}/auth/login`, request.url);
    loginUrl.searchParams.set('error', 'middleware_exception');
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Y que no contengan un punto, para excluir sitemap.xml, robots.txt, etc.
     * Esta es una aproximación para cubrir la mayoría de casos.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\..*).*)',
    '/(api|trpc)(.*)', // Asegurarse que las rutas de API también se procesan
  ],
};
