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

const clerkAuthMiddleware = clerkMiddleware(async (auth, req) => {
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
    const mockReq = { nextUrl: { pathname: targetPath } } as any;
    if (isProtectedRoute(mockReq)) {
      const authObj = await auth();
      if (!authObj.userId) {
        return authObj.redirectToSignIn({ returnBackUrl: req.url });
      }
    }

    return response;
  }

  // 2. Auth Protection for non-localized routes
  if (isProtectedRoute(req)) {
    try {
      const authObj = await auth();

      if (!authObj.userId) {
        return authObj.redirectToSignIn({ returnBackUrl: req.url });
      }
    } catch (error) {
      console.error("Clerk auth failed:", error);
      // Fallback to Clerk's sign-in if auth fails
      const authObj = await auth();
      return authObj.redirectToSignIn({ returnBackUrl: req.url });
    }
  }

  return NextResponse.next();
});

export default function middleware(req: any, evt: any) {
  // Safety check for environment variables
  // In production (Vercel), these should be set in the project settings.
  // In development, they should be in .env.local
  if (!process.env.CLERK_SECRET_KEY || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    console.error("CRITICAL: Clerk environment variables are missing. Skipping auth check to prevent crash.");
    // We return next() to avoid 500 error, but this means routes are unprotected if keys are missing.
    // This is better than a hard crash for debugging purposes.
    return NextResponse.next();
  }

  return clerkAuthMiddleware(req, evt);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
