import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

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

  const SUPPORTED_LANGUAGES = ['es', 'en', 'fr', 'de', 'it', 'pt'];
  const DEFAULT_LANGUAGE = 'es';

  const pathnameIsMissingLocale = SUPPORTED_LANGUAGES.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const response = NextResponse.next();
    response.headers.set('x-language', DEFAULT_LANGUAGE);
    response.headers.set('x-pathname', pathname);
    return response;
  }

  const locale = SUPPORTED_LANGUAGES.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (locale) {
    const internalPath = pathname.replace(`/${locale}`, '') || '/';
    const response = NextResponse.rewrite(new URL(internalPath, request.url));
    response.headers.set('x-language', locale);
    response.headers.set('x-pathname', internalPath);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
