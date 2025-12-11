#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Next.js Webpack Runtime Error...');

// 1. Clear Next.js cache
const nextCacheDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextCacheDir)) {
  console.log('🗑️  Clearing .next cache...');
  fs.rmSync(nextCacheDir, { recursive: true, force: true });
}

// 2. Clear node_modules cache
const nodeModulesDir = path.join(process.cwd(), 'node_modules', '.cache');
if (fs.existsSync(nodeModulesDir)) {
  console.log('🗑️  Clearing node_modules cache...');
  fs.rmSync(nodeModulesDir, { recursive: true, force: true });
}

// 3. Update Next.js config to fix webpack issues
const nextConfigPath = path.join(process.cwd(), 'next.config.js');
const nextConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@heroicons/react'],
  },
  webpack: (config, { dev, isServer }) => {
    // Fix for webpack runtime errors
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      };
    }
    
    // Resolve fallbacks for client-side
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
}

module.exports = nextConfig`;

fs.writeFileSync(nextConfigPath, nextConfigContent);
console.log('✅ Updated next.config.js with webpack fixes');

// 4. Create a simple error boundary component
const errorBoundaryPath = path.join(process.cwd(), 'app', 'components', 'ErrorBoundary.tsx');
if (!fs.existsSync(errorBoundaryPath)) {
  const errorBoundaryContent = `'use client'

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} />
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-800">
                  Algo salió mal
                </h3>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p>Ha ocurrido un error inesperado. Por favor, recarga la página.</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Recargar página
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary`;

  fs.writeFileSync(errorBoundaryPath, errorBoundaryContent);
  console.log('✅ Created ErrorBoundary component');
}

// 5. Update the main layout to include error boundary
const layoutPath = path.join(process.cwd(), 'app', 'layout.tsx');
const layoutContent = `import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './components/Providers';
import ErrorBoundary from './components/ErrorBoundary';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap'
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning={true}>
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            <div className="min-h-screen bg-background text-foreground">
              {children}
            </div>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}`;

fs.writeFileSync(layoutPath, layoutContent);
console.log('✅ Updated layout.tsx with ErrorBoundary');

console.log('\n🎉 Webpack runtime error fixes applied!');
console.log('\n📋 Next steps:');
console.log('1. Run: npm run dev');
console.log('2. If the error persists, try: rm -rf node_modules && npm install');
console.log('3. Check browser console for more specific error details');