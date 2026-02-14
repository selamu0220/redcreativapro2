import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const locales = ['es', 'fr', 'de', 'it', 'pt', 'zh']

const protectedPaths = [
    '/dashboard', '/escritor-ia', '/correos-ia', '/documentos',
    '/contactos', '/ai-browser', '/ajustes', '/admin',
    '/corrector-textos-ia', '/calendario', '/audio-test'
]

const publicPaths = [
    '/login', '/auth/login', '/auth/callback', '/auth/auth-code-error',
    '/registro', '/api/auth'
]

const sitemapUrls = [
    '/', '/blog', '/prompts', '/planes', '/contacto', '/herramientas',
    '/categoria', '/comparativas', '/alternativas', '/industria',
    '/guia/escritor-ia', '/guia/prompts-ia', '/guia/seo-ia',
    '/guia/copywriting-ia', '/guia/marketing-ia',
    '/herramientas/calculadora-meta-tags', '/herramientas/generador-headlines',
    '/mejores-herramientas-ia-escritura', '/copywriting-espanol',
    '/seo-con-ia', '/escritor-ia-gratis', '/mejores-ia-2025',
    '/email-marketing-ia', '/redes-sociales-ia', '/prompt-engineering',
    '/inteligencia-artificial-escritura', '/automatizar-contenido',
    '/chatgpt-vs-claude', '/guia-chatgpt-espanol', '/ia-para-blogs',
    '/escritura-creativa-ia', '/copywriting-ecommerce',
]

function isSitemapUrl(pathname: string): boolean {
    if (sitemapUrls.some(url => pathname === url || pathname.startsWith(url + '/'))) return true
    if (pathname.startsWith('/blog/') || pathname.startsWith('/prompts/') ||
        pathname.startsWith('/categoria/') || pathname.startsWith('/comparativas/') ||
        pathname.startsWith('/alternativas/') || pathname.startsWith('/industria/') ||
        pathname.startsWith('/guia/escritor-ia/')) return true
    return false
}

function getLocaleFromPath(pathname: string): { locale: string; normalizedPath: string } | null {
    if (pathname.startsWith('/en') && pathname !== '/en') {
        return { locale: 'en', normalizedPath: pathname.replace(/^\/en/, '') || '/' }
    }
    const localeMatch = pathname.match(new RegExp(`^/(${locales.join('|')})(/|$)`))
    if (localeMatch) {
        return {
            locale: localeMatch[1],
            normalizedPath: pathname.replace(new RegExp(`^/${localeMatch[1]}`), '') || '/'
        }
    }
    return null
}

const countryMap: Record<string, string> = {
    'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'CL': 'es', 'PE': 'es',
    'VE': 'es', 'EC': 'es', 'GT': 'es', 'CU': 'es', 'BO': 'es', 'DO': 'es',
    'HN': 'es', 'PY': 'es', 'SV': 'es', 'NI': 'es', 'CR': 'es', 'PA': 'es',
    'UY': 'es', 'GQ': 'es', 'PT': 'pt', 'BR': 'pt', 'AO': 'pt', 'MZ': 'pt',
    'FR': 'fr', 'BE': 'fr', 'SN': 'fr', 'DE': 'de', 'AT': 'de', 'CH': 'de',
    'IT': 'it', 'CN': 'zh', 'TW': 'zh', 'HK': 'zh', 'SG': 'zh'
}

function detectLocale(request: NextRequest, cookieLocale: string | undefined): string {
    if (cookieLocale && locales.includes(cookieLocale)) return cookieLocale
    const country = request.headers.get('x-vercel-ip-country') || 'US'
    const geoLocale = countryMap[country]
    if (geoLocale && locales.includes(geoLocale)) return geoLocale
    const acceptLanguage = request.headers.get('accept-language')
    if (acceptLanguage) {
        const preferred = acceptLanguage.split(',')[0].split('-')[0]
        if (locales.includes(preferred)) return preferred
    }
    return 'en'
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip static files and API routes early
    if (pathname.startsWith('/api') || pathname.startsWith('/_next') ||
        pathname.startsWith('/static') || pathname.includes('.')) {
        return NextResponse.next()
    }

    const isFromSitemap = isSitemapUrl(pathname)
    const pathLocale = getLocaleFromPath(pathname)
    let locale: string
    let normalizedPath: string

    if (pathLocale) {
        locale = pathLocale.locale
        normalizedPath = pathLocale.normalizedPath
    } else {
        const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
        locale = detectLocale(request, cookieLocale)
        normalizedPath = pathname

        if (locale !== 'en' && !isFromSitemap) {
            const redirectUrl = request.nextUrl.clone()
            redirectUrl.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
            const response = NextResponse.redirect(redirectUrl, 301)
            response.cookies.set('NEXT_LOCALE', locale)
            return response
        }
    }

    const response = NextResponse.rewrite(
        new URL(normalizedPath, request.url)
    )

    response.headers.set('x-language-tag', locale)
    response.headers.set('x-language', locale)
    response.headers.set('x-pathname', normalizedPath)
    response.cookies.set('NEXT_LOCALE', locale)

    let user = null
    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return request.cookies.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        request.cookies.set({ name, value, ...options })
                        response.cookies.set({ name, value, ...options })
                    },
                    remove(name: string, options: CookieOptions) {
                        request.cookies.set({ name, value: '', ...options })
                        response.cookies.set({ name, value: '', ...options })
                    },
                },
            }
        )

        const { data } = await supabase.auth.getUser()
        if (data?.user) user = data.user
    } catch (err) {
        console.error('[Middleware] Supabase auth error:', err)
    }

    const isProtected = protectedPaths.some(path =>
        normalizedPath.startsWith(path) || normalizedPath === path
    )

    const isPublicPath = publicPaths.some(path =>
        normalizedPath.startsWith(path) || normalizedPath === path
    )

    if (isProtected && !user && !isPublicPath) {
        const loginUrl = request.nextUrl.clone()
        loginUrl.pathname = '/login'
        if (locale !== 'en') {
            loginUrl.pathname = `/${locale}/login`
        }
        loginUrl.searchParams.set('next', pathname)
        return NextResponse.redirect(loginUrl)
    }

    return response
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sw.js).*)'],
}
