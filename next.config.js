/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output configuration
  output: 'standalone',
  
  // Optimizaciones de rendimiento
  experimental: {
    optimizeCss: true,
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
  
  // Optimización de bundle
  webpack: (config, { dev, isServer }) => {
    // Configuración para evitar errores de webpack factory
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Enhanced chunk loading configuration
    config.output = {
      ...config.output,
      // Increase chunk load timeout significantly
      chunkLoadTimeout: 60000, // 60 seconds for slow connections
      // Use more stable chunk filenames
      chunkFilename: dev 
        ? 'static/chunks/[name].js'
        : 'static/chunks/[name].[contenthash:8].js',
    };

    // Optimizations for production only to avoid dev build issues
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxSize: 244000, // Limitar el tamaño de chunks para mejor carga
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
            priority: 5,
          },
          // Separar React en su propio chunk
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
          },
        },
      };
    }
    
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
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap'
      },
      {
        source: '/robots.txt',
        destination: '/api/robots'
      }
    ]
  }
}

module.exports = nextConfig