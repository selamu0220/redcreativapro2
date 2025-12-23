/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  
  webpack: (config, { dev, isServer }) => {
    // Client-side fallbacks
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    return config;
  },
}

module.exports = nextConfig
