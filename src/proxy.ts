import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  '/dashboard',
  '/escritor-ia',
  '/correos-ia',
  '/documentos',
  '/contactos',
  '/ai-browser',
  '/ajustes',
  '/admin',
  '/corrector-textos-ia',
  '/calendario',
  '/audio-test'
];

const isProtectedRoute = (pathname: string) => {
  return protectedRoutes.some(route => pathname.startsWith(route));
};

const SUPPORTED_LANGUAGES = ['es', 'en', 'fr', 'de', 'pt', 'zh'];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // 1. Language Logic
  // Check if the path starts with a language code
  const pathnameHasLocale = SUPPORTED_LANGUAGES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  let targetPath = pathname;
  let localePrefix = '';

  if (pathnameHasLocale) {
    const segments = pathname.split('/');
    const locale = segments[1];
    localePrefix = `/${locale}`;
    targetPath = '/' + segments.slice(2).join('/');
    
    // Store the language in a cookie
    const response = NextResponse.rewrite(new URL(targetPath || '/', req.url));
    response.cookies.set('redcreativa-language', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365 // 1 year
    });
    
    // Now check if the target path is protected
    if (isProtectedRoute(targetPath)) {
      // For Kinde, we'll redirect to auth page - Kinde will handle the session check
      // This is a simplified approach; you may want to check session on server side
      const url = new URL(`${localePrefix}/auth`, req.url);
      url.searchParams.set('redirect', pathname);
      // Note: Actual auth check happens in the auth page or via Kinde's built-in middleware
    }
    
    return response;
  }

  // 2. Auth Protection for non-localized routes
  if (isProtectedRoute(pathname)) {
    // Redirect to auth page - Kinde will handle authentication
    const url = new URL('/auth', req.url);
    url.searchParams.set('redirect', pathname);
    // Note: You may want to add actual session checking here using Kinde's session helpers
    // For now, we rely on the auth page to handle the redirect
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
