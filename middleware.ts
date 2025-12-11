import { NextResponse, NextRequest } from 'next/server'

const SUPPORTED = new Set(['es', 'en', 'de', 'fr', 'zh'])

function getLanguageFromPath(pathname: string): string | null {
  const m = pathname.match(/^\/([a-z]{2})(?:\/|$)/)
  if (!m) return null
  const code = m[1]
  return SUPPORTED.has(code) ? code : null
}

function removeLanguageFromPath(pathname: string): string {
  const lang = getLanguageFromPath(pathname)
  if (!lang) return pathname || '/'
  const without = pathname.replace(new RegExp(`^\/${lang}(?=\/|$)`), '')
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

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const hasLangPrefix = !!getLanguageFromPath(pathname)

  if (!hasLangPrefix) {
    const lang = detectLanguage(req)
    const url = req.nextUrl.clone()
    url.pathname = `/${lang}${pathname === '/' ? '' : pathname}`
    const res = NextResponse.redirect(url)
    res.cookies.set('redcreativa-language', lang, { path: '/', httpOnly: false })
    return res
  }

  const clean = removeLanguageFromPath(pathname)
  const rewriteUrl = req.nextUrl.clone()
  rewriteUrl.pathname = clean
  const res = NextResponse.rewrite(rewriteUrl)
  const lang = getLanguageFromPath(pathname) || 'es'
  res.cookies.set('redcreativa-language', lang, { path: '/', httpOnly: false })
  return res
}

export const config = {
  matcher: '/:path*'
}