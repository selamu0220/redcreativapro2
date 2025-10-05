import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Handle blog article redirections
  if (pathname.startsWith('/blog/') && pathname !== '/blog') {
    // Extract the article ID from the path
    const articleId = pathname.replace('/blog/', '')
    
    // Skip if it's a known static file or API route
    if (
      articleId.includes('.') || // Files with extensions
      articleId === 'sitemap.xml' ||
      articleId === 'not-found' ||
      articleId.startsWith('api/')
    ) {
      return NextResponse.next()
    }
    
    // Let Next.js handle the routing - if the page doesn't exist,
    // our blog/[id]/page.tsx will handle the 404 logic
    return NextResponse.next()
  }
  
  return NextResponse.next()
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
}