import { createRequire } from 'module';
import path from 'path';
const require = createRequire(import.meta.url);
const { paraglide } = require("@inlang/paraglide-next/plugin");
import withBundleAnalyzerPkg from '@next/bundle-analyzer';

const withBundleAnalyzer = withBundleAnalyzerPkg({
    enabled: process.env.ANALYZE === 'true',
});

// Manual Paraglide Alias Configuration (No Plugin Wrapper)
// The plugin wrapper causes "Invalid Key" errors in Next.js 16 + Turbopack
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

    // Optimización de imágenes
    images: {
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60,
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

    // Redirect www to non-www (SEO canonical - modern best practice)
    async redirects() {
        return [
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
        ];
    },

    experimental: {
        optimizePackageImports: [
            'lucide-react',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu'
        ],
    },
    serverExternalPackages: [
        'import-in-the-middle',
        'require-in-the-middle',
    ],

    webpack: (config, { dev, isServer }) => {
        // Alias for Paraglide runtime
        config.resolve.alias['$paraglide/runtime.js'] = path.resolve(process.cwd(), './src/paraglide/runtime.js');

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

// Apply Paraglide plugin
let configWithParaglide = paraglide({
    paraglide: {
        project: "./project.inlang",
        outdir: "./src/paraglide"
    },
    ...nextConfig
});

// CRITICAL FIX: The plugin injects an invalid 'turbo' key for Next.js 16.
// We must remove it to pass config validation, since we are forcing Webpack anyway.
if (configWithParaglide.turbo) {
    delete configWithParaglide.turbo;
}

export default withBundleAnalyzer(configWithParaglide);
