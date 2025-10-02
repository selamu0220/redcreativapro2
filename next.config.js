import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: __dirname,
  trailingSlash: false,
  // Permitir acceso desde IP de red local para desarrollo
  allowedDevOrigins: ['192.168.1.77:3000'],
  images: {
    unoptimized: true
  },
  // Mejorar hidratación y evitar errores
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'react-syntax-highlighter'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Configuración optimizada para desarrollo
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // Aumentado para reducir recompilaciones
    pagesBufferLength: 5, // Más páginas en buffer
  },
  // Optimizaciones webpack
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Optimizaciones para desarrollo
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
      
      // Mejorar cache de webpack
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    
    // Optimizar resolución de módulos
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname,
    };
    
    return config;
  },
  // Optimizaciones para producción
  poweredByHeader: false,
  compress: true,
  // Headers de seguridad
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
        ],
      },
    ];
  },
};

export default nextConfig;