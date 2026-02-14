import path from 'path';
import withBundleAnalyzerPkg from '@next/bundle-analyzer';

const withBundleAnalyzer = withBundleAnalyzerPkg({
    enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Environment variables
    env: {
        KINDE_SITE_URL: process.env.KINDE_SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
        KINDE_POST_LOGOUT_REDIRECT_URL: process.env.KINDE_POST_LOGOUT_REDIRECT_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
        KINDE_POST_LOGIN_REDIRECT_URL: process.env.KINDE_POST_LOGIN_REDIRECT_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/dashboard` : 'http://localhost:3000/dashboard'),
    },

    // Skip type checking in development for speed (run separately with `pnpm type-check`)
    typescript: {
        ignoreBuildErrors: process.env.NODE_ENV === 'development',
    },
    
    // Skip ESLint in development for speed
    eslint: {
        ignoreDuringBuilds: process.env.NODE_ENV === 'development',
    },

    // Enable production source maps only when needed
    productionBrowserSourceMaps: process.env.SOURCE_MAPS === 'true',

    // Compression
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
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 31536000,
    },

    // Cache headers
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
        ];
    },

    experimental: {
        // Optimize package imports for faster dev
        optimizePackageImports: [
            'lucide-react',
            '@radix-ui/react-icons',
            '@heroicons/react',
            'date-fns',
            'lodash-es',
            'framer-motion',
        ],
        
        // SWC optimizations
        swcMinify: true,
        
        // Optimizations
        optimizeCss: true,
        scrollRestoration: true,
        
        // React optimizations
        reactCompiler: false, // Enable when stable
    },
    
    // Transpile specific packages for better performance
    transpilePackages: [
        '@inlang/paraglide-next',
        '@inlang/paraglide-js',
        'three',
        'gsap',
        '@gsap/react',
        'framer-motion',
    ],
    
    // Server external packages
    serverExternalPackages: [
        'import-in-the-middle',
        'require-in-the-middle',
    ],

    // Turbopack aliases for Paraglide (Vercel build)
    turbopack: {
        resolveAlias: {
            '$paraglide/runtime.js': './src/paraglide/runtime.js',
            '$paraglide/messages.js': './src/paraglide/messages.js',
            '$paraglide': './src/paraglide',
        },
    },

    // Webpack config
    webpack: (config, { dev, isServer, nextRuntime }) => {
        // Paraglide aliases - critical for module resolution
        config.resolve.alias['$paraglide/runtime.js'] = path.resolve(process.cwd(), './src/paraglide/runtime.js');
        config.resolve.alias['$paraglide/messages.js'] = path.resolve(process.cwd(), './src/paraglide/messages.js');
        config.resolve.alias['$paraglide'] = path.resolve(process.cwd(), './src/paraglide');

        // Fix for webpack runtime errors
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
            };
        }
        
        // Ignore remotion renderer on serverless environments (Vercel)
        // These are platform-specific binaries that can't be bundled
        if (isServer && nextRuntime === 'nodejs') {
            config.externals = config.externals || [];
            if (Array.isArray(config.externals)) {
                config.externals.push('@remotion/renderer');
                config.externals.push(/^@remotion\/compositor-/);
            }
        }
        
        // Enable persistent caching in webpack
        if (dev && config.cache) {
            config.cache = {
                type: 'filesystem',
                buildDependencies: {
                    config: [import.meta.filename],
                },
                cacheDirectory: path.resolve(process.cwd(), '.next/cache/webpack'),
            };
        }

        return config;
    },
};

// SEO Redirects
nextConfig.redirects = async () => {
    return [
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
