
// Fix for structured data validation errors
export function generateValidStructuredData(pageData) {
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Red Creativa",
    "url": "https://redcreativa.pro",
    "description": "Plataforma de inteligencia artificial para escritores y creadores de contenido",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://redcreativa.pro/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Red Creativa",
      "logo": {
        "@type": "ImageObject",
        "url": "https://redcreativa.pro/logo.png",
        "width": 600,
        "height": 60
      }
    }
  };

  // Add page-specific schema
  if (pageData.type === 'article') {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": pageData.title,
      "description": pageData.description,
      "author": {
        "@type": "Person",
        "name": "Red Creativa"
      },
      "publisher": baseSchema.publisher,
      "datePublished": pageData.datePublished,
      "dateModified": pageData.dateModified || pageData.datePublished,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": pageData.url
      },
      "image": pageData.image ? {
        "@type": "ImageObject",
        "url": pageData.image,
        "width": 1200,
        "height": 630
      } : undefined
    };
  }

  return baseSchema;
}
