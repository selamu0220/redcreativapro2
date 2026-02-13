import path from 'path';
import { fileURLToPath } from 'url';
import withBundleAnalyzerPkg from '@next/bundle-analyzer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withBundleAnalyzer = withBundleAnalyzerPkg({
    enabled: process.env.ANALYZE === 'true',
});

// Manual Paraglide Configuration - NO plugin wrapper
// The plugin causes module resolution issues with Turbopack on Vercel.
// We rely on "paraglide-js compile" in package.json for compilation.

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Configuración dinámica de URLs para Vercel
    env: {
        KINDE_SITE_URL: process.env.KINDE_SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
        KINDE_POST_LOGOUT_REDIRECT_URL: process.env.KINDE_POST_LOGOUT_REDIRECT_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
        KINDE_POST_LOGIN_REDIRECT_URL: process.env.KINDE_POST_LOGIN_REDIRECT_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/dashboard` : 'http://localhost:3000/dashboard'),
    },

    typescript: {
        ignoreBuildErrors: true,
    },

    // Enable source maps for production debugging
    productionBrowserSourceMaps: true,

    // Optimizaciones de rendimiento
    compress: true,

    images: {
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            { protocol: 'https', hostname: '*.supabase.co' },
            { protocol: 'https', hostname: 'redcreativa.pro' },
            { protocol: 'https', hostname: 'img.youtube.com' },
            { protocol: 'https', hostname: 'i.vimeocdn.com' },
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'unsplash.com' },
            { protocol: 'https', hostname: 'trae-api-us.mchost.guru' },
            { protocol: 'https', hostname: 'ibb.co' },
        ],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 31536000,
    },

    // Headers de caché
    async headers() {
        return [
            {
                source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/_next/static/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'StrictMode',
                        value: 'true'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin'
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()'
                    }
                ]
            }
        ];
    },

    experimental: {
        optimizePackageImports: [
            'lucide-react',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-accordion',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-select',
            '@radix-ui/react-popover',
            '@radix-ui/react-separator',
            '@radix-ui/react-switch',
            '@radix-ui/react-toast',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-avatar',
            '@radix-ui/react-progress',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-slider',
            'framer-motion',
            '@tiptap/react',
            '@tiptap/starter-kit',
        ],
        optimizeCss: true,
    },

    serverExternalPackages: [
        'import-in-the-middle',
        'require-in-the-middle',
    ],

    // Turbopack aliases (for Vercel build)
    turbopack: {
        resolveAlias: {
            '$paraglide/runtime.js': './src/paraglide/runtime.js',
            '$paraglide/messages.js': './src/paraglide/messages.js',
            '$paraglide': './src/paraglide',
        },
    },

    webpack: (config, { dev, isServer }) => {
        // Alias for Paraglide runtime
        config.resolve.alias['$paraglide/runtime.js'] = path.join(__dirname, 'src/paraglide/runtime.js');
        config.resolve.alias['$paraglide/messages.js'] = path.join(__dirname, 'src/paraglide/messages.js');
        config.resolve.alias['$paraglide'] = path.join(__dirname, 'src/paraglide');

        // Fix for webpack runtime errors (chunk loading)
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
            };
        }

        return config;
    },
};

// SEO Redirects - 301 Permanent Redirects
nextConfig.redirects = async () => {
    return [
        // Redirecciones de URLs antiguas
        {
            source: '/articulos-ia',
            destination: '/blog',
            permanent: true,
        },
        {
            source: '/articulos-ia/:slug((?!/).*)',
            destination: '/blog/:slug',
            permanent: true,
        },
        {
            source: '/studio-ia',
            destination: '/escritor-ia',
            permanent: true,
        },
        {
            source: '/plantillas',
            destination: '/prompts',
            permanent: true,
        },
        // Redirecciones de páginas antiguas eliminadas
        {
            source: '/aprendizaje',
            destination: '/blog',
            permanent: true,
        },
        {
            source: '/inicio',
            destination: '/',
            permanent: true,
        },
        {
            source: '/presentacion',
            destination: '/',
            permanent: true,
        },
        {
            source: '/proyectos',
            destination: '/',
            permanent: true,
        },
        {
            source: '/tareas',
            destination: '/',
            permanent: true,
        },
        {
            source: '/scripts',
            destination: '/',
            permanent: true,
        },
        {
            source: '/ayuda',
            destination: '/centro-ayuda',
            permanent: true,
        },
        {
            source: '/temas',
            destination: '/blog',
            permanent: true,
        },
        {
            source: '/sobre-red-creativa',
            destination: '/',
            permanent: true,
        },
        {
            source: '/audio-editor',
            destination: '/herramientas',
            permanent: true,
        },
        {
            source: '/infografias',
            destination: '/herramientas',
            permanent: true,
        },
        {
            source: '/infografias/:path*',
            destination: '/herramientas',
            permanent: true,
        },
        // Redirecciones de URLs con www
        {
            source: '/:path*',
            has: [
                {
                    type: 'host',
                    value: 'www.redcreativa.pro',
                },
            ],
            destination: 'https://redcreativa.pro/:path*',
            permanent: true,
        },
        // Redirecciones de URLs de búsqueda antiguas
        {
            source: '/search',
            destination: '/',
            permanent: true,
        },
        {
            source: '/buscar',
            destination: '/',
            permanent: true,
        },
    ];
};

export default withBundleAnalyzer(nextConfig);
