import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse, NextRequest } from 'next/server'

const SUPPORTED = new Set(['es', 'en', 'de', 'fr', 'zh', 'pt'])

function getLanguageFromPath(pathname: string): string | null {
  const m = pathname.match(/^\/([a-z]{2})(?:\/|$)/)
  if (!m) return null
  const code = m[1]
  return SUPPORTED.has(code) ? code : null
}

function removeLanguageFromPath(pathname: string): string {
  const lang = getLanguageFromPath(pathname)
  if (!lang) return pathname || '/'
  const without = pathname.replace(new RegExp(`^/${lang}(?=/|$)`), '')
  return without === '' ? '/' : without
}

function detectLanguage(req: NextRequest): string {
  const cookieLang = req.cookies.get('redcreativa-language')?.value
  if (cookieLang && SUPPORTED.has(cookieLang)) return cookieLang
  const header = req.headers.get('accept-language') || ''
  const parts = header.split(',').map(s => s.trim())
  for (const part of parts) {
    const code = part.split(';')[0]
    const short = code.split('-')[0]
    if (SUPPORTED.has(code)) return code
    if (SUPPORTED.has(short)) return short
  }
  return 'es'
}

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl

  // Logic to skip internal routes is now partly handled by Clerk's config.matcher,
  // but we keep the logic here to be consistent with previous behavior just in case.
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const hasLangPrefix = !!getLanguageFromPath(pathname)

  if (!hasLangPrefix) {
    const lang = detectLanguage(req)
    const url = req.nextUrl.clone()
    url.pathname = `/${lang}${pathname === '/' ? '' : pathname}`

    // Avoid redirect loop if we are already correctly redirected (shouldn't happen with hasLangPrefix check but safe to add)
    if (url.toString() === req.url) {
      return NextResponse.next()
    }

    const res = NextResponse.redirect(url)
    res.cookies.set('redcreativa-language', lang, { path: '/', httpOnly: false })
    return res
  }

  const clean = removeLanguageFromPath(pathname)
  // Fix: Rewrite logic should ensure it doesn't conflict with Clerk 
  // Clerk middleware wraps this, so we should allow it to protect routes if needed.
  // But here we are just handling i18n routing.

  const rewriteUrl = req.nextUrl.clone()
  rewriteUrl.pathname = clean

  const res = NextResponse.rewrite(rewriteUrl)
  const lang = getLanguageFromPath(pathname) || 'es'
  res.cookies.set('redcreativa-language', lang, { path: '/', httpOnly: false })
  return res
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};