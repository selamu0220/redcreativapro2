/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Excluir rutas API del export estático
  experimental: {
    missingSuspenseWithCSRBailout: false,
  }
};

module.exports = nextConfig;