module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000',
        'http://localhost:3000/dashboard',
        'http://localhost:3000/blog',
        'http://localhost:3000/planes',
      ],
      startServerCommand: 'npm run build && npm start',
      startServerReadyPattern: 'ready on',
      startServerReadyTimeout: 30000,
      numberOfRuns: 3, // Run multiple times for more accurate results
    },
    assert: {
      assertions: {
        // Performance targets based on our optimization goals
        'categories:performance': ['error', { minScore: 0.85 }], // 85% target
        'categories:accessibility': ['error', { minScore: 0.90 }],
        'categories:best-practices': ['warn', { minScore: 0.90 }],
        'categories:seo': ['warn', { minScore: 0.90 }],
        'categories:pwa': ['warn', { minScore: 0.7 }],
        
        // Core Web Vitals thresholds
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }], // 2.5s
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],   // 0.1
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],    // 1.8s
        'total-blocking-time': ['warn', { maxNumericValue: 200 }],        // 200ms
        'speed-index': ['warn', { maxNumericValue: 3400 }],               // 3.4s
        
        // Additional performance metrics
        'first-meaningful-paint': ['warn', { maxNumericValue: 2000 }],
        'interactive': ['warn', { maxNumericValue: 3800 }],
        'max-potential-fid': ['warn', { maxNumericValue: 130 }],
        
        // Resource optimization
        'unused-css-rules': ['warn', { maxNumericValue: 20000 }],
        'unused-javascript': ['warn', { maxNumericValue: 20000 }],
        'modern-image-formats': ['warn', { minScore: 0.8 }],
        'uses-optimized-images': ['warn', { minScore: 0.8 }],
        'uses-webp-images': ['warn', { minScore: 0.8 }],
        'uses-responsive-images': ['warn', { minScore: 0.8 }],
        
        // Caching and compression
        'uses-long-cache-ttl': ['warn', { minScore: 0.8 }],
        'uses-text-compression': ['error', { minScore: 0.9 }],
        
        // JavaScript optimization
        'unminified-css': ['error', { maxNumericValue: 0 }],
        'unminified-javascript': ['error', { maxNumericValue: 0 }],
        'render-blocking-resources': ['warn', { maxNumericValue: 500 }],
      },
      preset: 'lighthouse:recommended',
    },
    upload: {
      target: 'temporary-public-storage',
    },
    server: {
      port: 9001,
      host: '0.0.0.0',
    },
  },
};