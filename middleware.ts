import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SUPPORTED_LANGUAGES = ['es', 'en', 'fr', 'de', 'pt', 'zh']

export function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl
    
    // Check if the path starts with a language code
    const pathnameHasLocale = SUPPORTED_LANGUAGES.some(
      (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )
    
    if (pathnameHasLocale) {
      // Extract the language and the rest of the path
      const segments = pathname.split('/')
      const locale = segments[1]
      const pathWithoutLocale = '/' + segments.slice(2).join('/')
      
      // Store the language in a cookie for the app to use
      const response = NextResponse.rewrite(new URL(pathWithoutLocale || '/', req.url))
      response.cookies.set('redcreativa-language', locale, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365 // 1 year
      })
      
      return response
    }
    
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
