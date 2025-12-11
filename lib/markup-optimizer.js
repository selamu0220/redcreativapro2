
// Comprehensive markup improvement for better SEO score
export class MarkupOptimizer {
  static optimizePageMarkup(pageData) {
    const optimizations = {
      // Meta tags optimization
      metaTags: this.generateOptimizedMetaTags(pageData),
      
      // Structured data
      structuredData: this.generateStructuredData(pageData),
      
      // Open Graph tags
      openGraph: this.generateOpenGraphTags(pageData),
      
      // Twitter Card tags
      twitterCard: this.generateTwitterCardTags(pageData),
      
      // Additional SEO tags
      additionalTags: this.generateAdditionalSEOTags(pageData)
    };
    
    return optimizations;
  }
  
  static generateOptimizedMetaTags(pageData) {
    return [
      { name: 'description', content: pageData.description },
      { name: 'keywords', content: pageData.keywords?.join(', ') || '' },
      { name: 'author', content: 'Red Creativa' },
      { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
      { name: 'googlebot', content: 'index, follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { httpEquiv: 'Content-Type', content: 'text/html; charset=utf-8' },
      { name: 'language', content: 'Spanish' },
      { name: 'revisit-after', content: '7 days' },
      { name: 'distribution', content: 'global' },
      { name: 'rating', content: 'general' }
    ];
  }
  
  static generateStructuredData(pageData) {
    const baseSchema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": pageData.title,
      "description": pageData.description,
      "url": pageData.url,
      "inLanguage": "es-ES",
      "isPartOf": {
        "@type": "WebSite",
        "@id": "https://redcreativa.pro/#website"
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": pageData.breadcrumbs?.map((crumb, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": crumb.name,
          "item": crumb.url
        })) || []
      }
    };
    
    // Add specific schema based on page type
    if (pageData.type === 'article') {
      return {
        ...baseSchema,
        "@type": "Article",
        "headline": pageData.title,
        "author": {
          "@type": "Person",
          "name": "Red Creativa"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Red Creativa",
          "logo": {
            "@type": "ImageObject",
            "url": "https://redcreativa.pro/logo.png"
          }
        },
        "datePublished": pageData.datePublished,
        "dateModified": pageData.dateModified || pageData.datePublished
      };
    }
    
    return baseSchema;
  }
  
  static generateOpenGraphTags(pageData) {
    return [
      { property: 'og:type', content: pageData.type === 'article' ? 'article' : 'website' },
      { property: 'og:title', content: pageData.title },
      { property: 'og:description', content: pageData.description },
      { property: 'og:url', content: pageData.url },
      { property: 'og:site_name', content: 'Red Creativa' },
      { property: 'og:locale', content: 'es_ES' },
      { property: 'og:image', content: pageData.image || 'https://redcreativa.pro/og-image.jpg' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: pageData.title }
    ];
  }
  
  static generateTwitterCardTags(pageData) {
    return [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@redcreativa' },
      { name: 'twitter:creator', content: '@redcreativa' },
      { name: 'twitter:title', content: pageData.title },
      { name: 'twitter:description', content: pageData.description },
      { name: 'twitter:image', content: pageData.image || 'https://redcreativa.pro/twitter-image.jpg' },
      { name: 'twitter:image:alt', content: pageData.title }
    ];
  }
  
  static generateAdditionalSEOTags(pageData) {
    return [
      { name: 'theme-color', content: '#3B82F6' },
      { name: 'msapplication-TileColor', content: '#3B82F6' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      { name: 'apple-mobile-web-app-title', content: 'Red Creativa' },
      { name: 'application-name', content: 'Red Creativa' },
      { name: 'msapplication-tooltip', content: 'Red Creativa - IA para Escritores' },
      { name: 'msapplication-starturl', content: '/' }
    ];
  }
  
  static validateMarkup(html) {
    const issues = [];
    const warnings = [];
    
    // Check for required meta tags
    const requiredMetas = ['description', 'viewport', 'robots'];
    requiredMetas.forEach(meta => {
      if (!html.includes(`name="${meta}"`) && !html.includes(`name='${meta}'`)) {
        issues.push(`Missing required meta tag: ${meta}`);
      }
    });
    
    // Check for H1
    if (!html.match(/<h1[^>]*>.*?<\/h1>/i)) {
      issues.push('Missing H1 tag');
    }
    
    // Check for multiple H1s
    const h1Matches = html.match(/<h1[^>]*>.*?<\/h1>/gi);
    if (h1Matches && h1Matches.length > 1) {
      warnings.push(`Multiple H1 tags found: ${h1Matches.length}`);
    }
    
    // Check for alt attributes on images
    const imgTags = html.match(/<img[^>]*>/gi) || [];
    imgTags.forEach((img, index) => {
      if (!img.includes('alt=')) {
        warnings.push(`Image ${index + 1} missing alt attribute`);
      }
    });
    
    // Check for structured data
    if (!html.includes('application/ld+json')) {
      warnings.push('No structured data found');
    }
    
    return {
      score: Math.max(0, 100 - (issues.length * 10) - (warnings.length * 5)),
      issues,
      warnings
    };
  }
}
