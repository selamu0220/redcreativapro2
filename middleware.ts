import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/escritor-ia/advanced',
  '/ai-browser/premium',
  '/subscription/manage'
]);

export default clerkMiddleware(async (auth, req) => {
  try {
    if (isProtectedRoute(req)) {
      await auth.protect()
    }
  } catch (error) {
    console.error('Middleware Invocation Failed:', error);
    // If it's a standard clerk redirect/error, we might want to rethrow or handle specific cases
    // But for now, let's assume if it crashes here, we strictly protect.
    // However, re-throwing might just cause the 500 again if that's the issue.
    // Let's inspect the error.

    // Check if it's a redirect (which are thrown as errors in Next.js)
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error; // Let redirects pass through
    }

    // For actual errors, log and redirect to login to be safe/prevent 500
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('error', 'middleware_error')
    return NextResponse.redirect(loginUrl)
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
