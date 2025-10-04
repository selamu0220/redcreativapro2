/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: false,
  images: {
    unoptimized: true
  },
  reactStrictMode: true, // Re-enable React Strict Mode
  serverExternalPackages: [],
  outputFileTracingRoot: __dirname,
  experimental: {
    // Enable React 18 features
    appDir: true,
  },
  webpack: (config, { isServer, dev }) => {
    // Only disable cache in development to prevent issues
    if (dev) {
      config.cache = false;
    }
    
    // Ensure proper module resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false
    };
    
    return config;
  }
}

module.exports = nextConfig;