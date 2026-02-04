import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// 1. Define Locales Manually (Must match project.inlang)
const locales = ['es', 'fr', 'de', 'it', 'pt', 'zh'];
// 'en' is handled as default (no prefix)

// Protected paths definition
const protectedPaths = [
    '/dashboard',
    '/escritor-ia',
    '/correos-ia',
    '/documentos',
    '/contactos',
    '/ai-browser',
    '/ajustes',
    '/admin',
    '/corrector-textos-ia',
    '/calendario',
    '/audio-test'
];

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const host = request.headers.get('host') || '';

    // 0. SEO FIX: Redirect www to non-www (consolidate domain authority)
    if (host.startsWith('www.')) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.host = host.replace('www.', '');
        return NextResponse.redirect(redirectUrl, 301);
    }

    // 2. Manual Locale Detection
    let locale = 'en'; // Default fallback
    let normalizedPath = pathname;

    // A. Handle explicit /en/ prefix - redirect to prefix-less (English is default)
    if (pathname.startsWith('/en/') || pathname === '/en') {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = pathname.replace(/^\/en/, '') || '/';
        return NextResponse.redirect(redirectUrl);
    }

    // B. Check for existing Locale Prefix in URL (Highest Priority)
    // Regex to detect /es, /es/blog, etc.
    const localeMatch = pathname.match(new RegExp(`^/(${locales.join('|')})(/|$)`));

    if (localeMatch) {
        // User explicitly requested a language via URL
        locale = localeMatch[1];
        normalizedPath = pathname.replace(new RegExp(`^/${locale}`), '') || '/';
    } else {
        // C. No URL prefix found. Let's detect the best language.

        // 1. Check Cookie (Returning User Preference)
        const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
        if (cookieLocale && locales.includes(cookieLocale)) {
            locale = cookieLocale;
        } else {
            // 2. Check Geolocation (Smart Country Detection)
            const country = request.headers.get('x-vercel-ip-country') || 'US';

            // Map Countries to Languages
            const countryMap: Record<string, string> = {
                // Spanish
                'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'CL': 'es', 'PE': 'es',
                'VE': 'es', 'EC': 'es', 'GT': 'es', 'CU': 'es', 'BO': 'es', 'DO': 'es',
                'HN': 'es', 'PY': 'es', 'SV': 'es', 'NI': 'es', 'CR': 'es', 'PA': 'es',
                'UY': 'es', 'GQ': 'es',
                // Portuguese
                'PT': 'pt', 'BR': 'pt', 'AO': 'pt', 'MZ': 'pt',
                // French
                'FR': 'fr', 'BE': 'fr', 'SN': 'fr',
                // German
                'DE': 'de', 'AT': 'de', 'CH': 'de',
                // Italian
                'IT': 'it',
                // Chinese
                'CN': 'zh', 'TW': 'zh', 'HK': 'zh', 'SG': 'zh'
            };

            const geoLocale = countryMap[country];

            if (geoLocale && locales.includes(geoLocale)) {
                locale = geoLocale;
            } else {
                // 3. Fallback: Check Browser Accept-Language Header
                const acceptLanguage = request.headers.get('accept-language');
                if (acceptLanguage) {
                    // Simple check: does the string contain 'es', 'fr', etc?
                    // "es-ES,es;q=0.9"
                    const preferred = acceptLanguage.split(',')[0].split('-')[0]; // 'es'
                    if (locales.includes(preferred)) {
                        locale = preferred;
                    }
                }
            }
        }

        // OPTIONAL: If we detected a non-default language (e.g. 'es') and we are at root '/', 
        // we might want to redirect them to '/es'?
        // However, the requested architecture uses REWRITES for seamless experience.
        // If we want to show the 'es' version WITHOUT changing URL, we use Rewrite.
        // BUT, for SEO, it is better to have unique URLs.
        // Current implementation uses REWRITES for /es/... -> handling internally.
        // If the user lands on '/', and we decide they are 'es', we should probably redirect to '/es' 
        // OR just rewrite '/' to serve Spanish content?
        // Standard Next.js i18n redirects to the prefixed route. 
        // Let's REDIRECT to the logic path if it's not the default 'en'.

        // Only redirect if we are at root OR specific pages that should be localized immediately.
        // AND we haven't already redirected.
        // If we are at '/', and detected 'es', redirect to '/es'.
        if (locale !== 'en' && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
            const redirectUrl = request.nextUrl.clone();
            redirectUrl.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
            return NextResponse.redirect(redirectUrl);
        }
    }

    // 3. Prepare Response with Manual Rewrite
    const url = request.nextUrl.clone();
    url.pathname = normalizedPath;

    // Create the response object with the rewrite
    // This tells Next.js: "User sees /es/blog, but render /blog"
    const response = NextResponse.rewrite(url);

    // 4. Set Headers for Paraglide/App
    // Usually Paraglide looks for specific headers. 
    // We set 'x-language-tag' which is standard for inlang.
    response.headers.set('x-language-tag', locale);
    response.headers.set('x-language', locale); // Match server.ts expectation
    response.headers.set('x-pathname', normalizedPath); // For hreflang generation
    response.cookies.set('NEXT_LOCALE', locale);

    // LOGGING
    console.log(`[Middleware Manual] Path: ${pathname} -> Rewrite: ${normalizedPath} | Locale: ${locale}`);

    // 5. Supabase Auth Integration
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options });
                    response.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options });
                    response.cookies.set({ name, value: '', ...options });
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // 6. Protected Route Guard (using normalized path)
    const isProtected = protectedPaths.some(path =>
        normalizedPath.startsWith(path) || normalizedPath === path
    );

    if (isProtected && !user) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/login';
        // If we are in 'es', redirect to /es/login
        if (locale !== 'en') {
            loginUrl.pathname = `/${locale}/login`;
        }
        loginUrl.searchParams.set('next', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ]
};
