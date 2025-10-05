/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: false,
  
  // Optimización de imágenes con WebP/AVIF
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 año
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Compresión Gzip/Brotli
  compress: true,
  
  reactStrictMode: true,
  serverExternalPackages: [],
  outputFileTracingRoot: __dirname,
  
  // Permitir acceso desde diferentes orígenes en desarrollo
  allowedDevOrigins: [
    'localhost:3001',
    '192.168.1.77:3000',
    '192.168.1.77:3001',
    '192.168.1.77:3881',
    '127.0.0.1:3000',
    '127.0.0.1:3001'
  ],
  
  // Headers de seguridad y cache
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/((?:.*\\.(?:ico|png|jpg|jpeg|gif|webp|avif|svg)))',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Redirects para evitar múltiples redirecciones
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/escritor',
        destination: '/escritor-ia',
        permanent: true,
      },
      {
        source: '/correos',
        destination: '/correos-ia',
        permanent: true,
      },
    ];
  },
  
  // Webpack optimizations
  webpack: (config, { isServer, dev }) => {
    // Enable cache for better performance but clear on module issues
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    };
    
    // Ensure proper module resolution for Node.js modules
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      buffer: false,
      util: false,
      path: false,
      os: false,
      url: false,
      querystring: false,
      zlib: false,
      assert: false,
      http: false,
      https: false,
      constants: false
    };

    // Add proper module resolution for React and Next.js
    config.resolve.mainFields = ['browser', 'module', 'main'];
    config.resolve.extensions = ['.js', '.jsx', '.ts', '.tsx', '.json'];
    
    // Fix module loading issues
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    
    // Add rule to handle potential module conflicts
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false
      }
    });

    // Better optimization settings
    config.optimization = config.optimization || {};
    if (!dev) {
      // Use safer splitChunks configuration
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Keep vendor chunks but be more conservative
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true
          }
        }
      };
    }
    
    return config;
  },
  
  // Experimental features para optimización
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
}

module.exports = nextConfig;