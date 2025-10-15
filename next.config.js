/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output configuration
  output: 'standalone',
  
  // Optimizaciones de rendimiento - reduced for compatibility
  experimental: {
    // Temporarily disable optimizeCss to avoid build issues
    // optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  
  // Compresión y optimización de imágenes
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 año
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Headers de seguridad y rendimiento
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/blog/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },
  
  // Compresión
  compress: true,
  
  // Simplified webpack configuration to avoid build issues
  webpack: (config, { dev, isServer }) => {
    // Basic fallback configuration
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
  },
  
  // Redirects para SEO
  async redirects() {
    return [
      {
        source: '/blog/:slug*',
        has: [
          {
            type: 'query',
            key: 'utm_source'
          }
        ],
        destination: '/blog/:slug*',
        permanent: false,
      }
    ]
  },
  
  // Rewrites para mejor estructura de URLs
  async rewrites() {
    return [
      // Removed sitemap.xml rewrite as we use app/sitemap.ts
      // Removed robots.txt rewrite as we use app/robots.ts
    ]
  }
}

module.exports = nextConfig