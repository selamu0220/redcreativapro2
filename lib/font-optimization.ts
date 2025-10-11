// Optimización de carga de fuentes
export const fontOptimization = {
  // Preload de fuentes críticas
  preloadFonts: [
    {
      href: '/fonts/inter-var.woff2',
      type: 'font/woff2',
      crossOrigin: 'anonymous'
    }
  ],
  
  // Font display strategy
  fontDisplay: 'swap',
  
  // Font loading optimization
  optimizeLoading: () => {
    if (typeof window !== 'undefined') {
      // Font loading API si está disponible
      if ('fonts' in document) {
        // Precargar fuentes críticas
        const criticalFonts = [
          new FontFace('Inter', 'url(/fonts/inter-var.woff2)', {
            display: 'swap',
            weight: '100 900'
          })
        ]
        
        criticalFonts.forEach(font => {
          font.load().then(loadedFont => {
            document.fonts.add(loadedFont)
          }).catch(error => {
            console.warn('Error loading font:', error)
          })
        })
      }
      
      // Fallback para navegadores sin soporte
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = '/fonts/inter-var.woff2'
      link.as = 'font'
      link.type = 'font/woff2'
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    }
  }
}

// CSS crítico inline
export const criticalCSS = `
  /* Critical CSS para Above the Fold */
  * {
    box-sizing: border-box;
  }
  
  body {
    margin: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  /* Optimización de CLS */
  img, video {
    max-width: 100%;
    height: auto;
  }
  
  /* Skeleton loading */
  .skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }
  
  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`