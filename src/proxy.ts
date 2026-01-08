import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SUPPORTED_LANGUAGES = ['es', 'en', 'fr', 'de', 'pt', 'zh'];

const protectedPaths = [
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

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip auth check for Kinde auth routes
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // 1. Language Logic
  const pathnameHasLocale = SUPPORTED_LANGUAGES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    const segments = pathname.split('/');
    const locale = segments[1];
    const targetPath = '/' + segments.slice(2).join('/');

    // Store the language in a cookie
    const response = NextResponse.rewrite(new URL(targetPath || '/', req.url));
    response.cookies.set('redcreativa-language', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365 // 1 year
    });

    return response;
  }

  // 2. Check if route is protected
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtected) {
    return withAuth(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Solo rutas protegidas y API
    '/dashboard/:path*',
    '/escritor-ia/:path*',
    '/correos-ia/:path*',
    '/documentos/:path*',
    '/contactos/:path*',
    '/ai-browser/:path*',
    '/ajustes/:path*',
    '/admin/:path*',
    '/corrector-textos-ia/:path*',
    '/calendario/:path*',
    '/audio-test/:path*',
    '/api/:path*',
    // Rutas con idioma
    '/:lang(es|en|fr|de|pt|zh)/:path*',
  ],
};