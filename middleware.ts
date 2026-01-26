import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    await supabase.auth.getUser()

    // --- Localization Logic (Preserved) ---
    const pathname = request.nextUrl.pathname;

    // Skip internal paths
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
        return response;
    }

    const SUPPORTED_LANGUAGES = ['es', 'en', 'fr', 'de', 'it', 'pt'];
    const DEFAULT_LANGUAGE = 'es';

    const pathnameIsMissingLocale = SUPPORTED_LANGUAGES.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    // If locale is missing, add headers
    if (pathnameIsMissingLocale) {
        response.headers.set('x-language', DEFAULT_LANGUAGE);
        response.headers.set('x-pathname', pathname);
        return response;
    }

    const locale = SUPPORTED_LANGUAGES.find(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (locale) {
        const internalPath = pathname.replace(`/${locale}`, '') || '/';
        // We need to recreate the response with rewrite to preserve the session updates
        const newResponse = NextResponse.rewrite(new URL(internalPath, request.url));

        // Copy cookies from the auth response to the rewritten response
        // This is crucial for Supabase auth to work with rewrites
        newResponse.headers.set('x-language', locale);
        newResponse.headers.set('x-pathname', internalPath);

        // Copy all cookies from the original response (which might have auth updates) to the new one
        response.cookies.getAll().forEach((cookie) => {
            newResponse.cookies.set(cookie.name, cookie.value, cookie)
        })

        return newResponse;
    }

    return response;
}

export const config = {
    matcher: [
        // Combined matchers
        "/dashboard/:path*",
        "/escritor-ia/:path*",
        "/ajustes/:path*",
        "/api/protected/:path*",
        // Exclude static files and internal Next.js paths
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ]
};
