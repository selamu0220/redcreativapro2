/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: false,
  images: {
    unoptimized: true
  },
  reactStrictMode: true,
  serverExternalPackages: [],
  // webpack: (config, { isServer }) => {
  //   // Disable webpack cache to prevent module resolution issues
  //   config.cache = false;
  //   return config;
  // }
}

module.exports = nextConfig;