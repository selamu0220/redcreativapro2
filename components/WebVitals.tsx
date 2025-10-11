'use client'

import { useEffect } from 'react'

// Función para enviar métricas a analytics
function sendToAnalytics(metric: any) {
  // Enviar a Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    })
  }
  
  // Log para desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric)
  }
}

export default function WebVitals() {
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return

    // Importación dinámica más robusta
    const loadWebVitals = async () => {
      try {
        const webVitalsModule = await import('web-vitals')
        
        // Usar directamente el módulo importado
        const vitals = webVitalsModule
        
        // Verificar y usar las funciones disponibles
        const functions = [
          { name: 'onCLS', fn: vitals.onCLS },
          { name: 'onFCP', fn: vitals.onFCP },
          { name: 'onLCP', fn: vitals.onLCP },
          { name: 'onTTFB', fn: vitals.onTTFB },
          { name: 'onINP', fn: vitals.onINP } // Solo en v5+
        ]
        
        functions.forEach(({ name, fn }) => {
          if (typeof fn === 'function') {
            try {
              fn(sendToAnalytics)
            } catch (error) {
              console.warn(`Error initializing ${name}:`, error)
            }
          }
        })
        
      } catch (error) {
        console.warn('Error loading web-vitals:', error)
      }
    }
    
    loadWebVitals()
  }, [])

  return null
}

// Hook personalizado para optimizaciones
export function usePerformanceOptimizations() {
  useEffect(() => {
    // Precargar recursos críticos
    const preloadCriticalResources = () => {
      const criticalResources = [
        '/fonts/inter-var.woff2',
        '/images/logo.webp'
      ]
      
      criticalResources.forEach(resource => {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.href = resource
        link.as = resource.includes('.woff2') ? 'font' : 'image'
        if (resource.includes('.woff2')) {
          link.type = 'font/woff2'
          link.crossOrigin = 'anonymous'
        }
        document.head.appendChild(link)
      })
    }
    
    // Optimizar imágenes lazy loading
    const optimizeLazyLoading = () => {
      const images = document.querySelectorAll('img[loading="lazy"]')
      
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement
              if (img.dataset.src) {
                img.src = img.dataset.src
                img.removeAttribute('data-src')
                imageObserver.unobserve(img)
              }
            }
          })
        }, {
          rootMargin: '50px 0px'
        })
        
        images.forEach(img => imageObserver.observe(img))
      }
    }
    
    // Ejecutar optimizaciones
    preloadCriticalResources()
    optimizeLazyLoading()
    
    // Optimizar scroll performance
    let ticking = false
    const optimizeScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Lógica de scroll optimizada aquí
          ticking = false
        })
        ticking = true
      }
    }
    
    window.addEventListener('scroll', optimizeScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', optimizeScroll)
    }
  }, [])
}