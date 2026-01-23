import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static files, API routes, and special files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.startsWith('/manifest.json') ||
    pathname.startsWith('/sw.js') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Language support
  const SUPPORTED_LANGUAGES = ['es', 'en', 'fr', 'de', 'it', 'pt'];
  const DEFAULT_LANGUAGE = 'es';

  // Check if pathname starts with a supported language
  const pathnameIsMissingLocale = SUPPORTED_LANGUAGES.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // If locale is missing (e.g. /blog), treat as default language (es)
  if (pathnameIsMissingLocale) {
    const response = NextResponse.next();
    response.headers.set('x-language', DEFAULT_LANGUAGE);
    response.headers.set('x-pathname', pathname);
    return response;
  }

  // If locale is present (e.g. /en/blog), rewrite to internal path
  const locale = SUPPORTED_LANGUAGES.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (locale) {
    // Remove locale from path for internal routing
    // /en/blog -> /blog
    const internalPath = pathname.replace(`/${locale}`, '') || '/';

    // Create rewrite response
    const response = NextResponse.rewrite(new URL(internalPath, request.url));

    // Set headers for server components to know the language
    response.headers.set('x-language', locale);
    response.headers.set('x-pathname', internalPath);

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};