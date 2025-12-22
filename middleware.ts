import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/escritor-ia(.*)',
  '/correos-ia(.*)',
  '/documentos(.*)',
  '/contactos(.*)',
  '/ai-browser(.*)',
  '/ajustes(.*)',
  '/admin(.*)',
  '/corrector-textos-ia(.*)',
  '/calendario(.*)',
  '/audio-test(.*)'
]);

const SUPPORTED_LANGUAGES = ['es', 'en', 'fr', 'de', 'pt', 'zh'];

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  
  // 1. Language Logic
  // Check if the path starts with a language code
  const pathnameHasLocale = SUPPORTED_LANGUAGES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    // Extract the language and the rest of the path
    const segments = pathname.split('/');
    const locale = segments[1];
    const pathWithoutLocale = '/' + segments.slice(2).join('/');
    
    // Store the language in a cookie for the app to use
    const response = NextResponse.rewrite(new URL(pathWithoutLocale || '/', req.url));
    response.cookies.set('redcreativa-language', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365 // 1 year
    });
    
    // For localized routes, we allow the request to proceed to the page component.
    // The page component (or ProtectedRoute wrapper) handles authentication checks.
    // This allows showing the "Acceso Restringido" UI instead of a hard redirect.
    
    return response;
  }

  // 2. Auth Protection for non-localized routes
  // We use the matcher defined above.
  if (isProtectedRoute(req)) {
    const { userId } = await auth();
    
    if (!userId) {
      // Custom redirect to /auth to avoid 500 errors if Clerk sign-in URL is not configured
      const url = new URL('/auth', req.url);
      url.searchParams.set('redirect', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
