
// Hreflang configuration for redcreativa.pro
export const hreflangConfig = {
  defaultLanguage: 'es',
  supportedLanguages: ['es', 'en'],
  baseUrl: 'https://redcreativa.pro',
  
  generateHreflangTags(currentPath, currentLang = 'es') {
    const tags = [];
    
    // Self-referencing canonical
    tags.push({
      rel: 'canonical',
      href: `${this.baseUrl}${currentPath}`
    });
    
    // Hreflang for Spanish (default)
    tags.push({
      rel: 'alternate',
      hreflang: 'es',
      href: `${this.baseUrl}${currentPath}`
    });
    
    // Hreflang for English (if available)
    if (this.hasEnglishVersion(currentPath)) {
      tags.push({
        rel: 'alternate',
        hreflang: 'en', 
        href: `${this.baseUrl}/en${currentPath}`
      });
    }
    
    // x-default for international targeting
    tags.push({
      rel: 'alternate',
      hreflang: 'x-default',
      href: `${this.baseUrl}${currentPath}`
    });
    
    return tags;
  },
  
  hasEnglishVersion(path) {
    // Define which pages have English versions
    const englishPages = ['/blog', '/escritor-ia', '/correos-ia'];
    return englishPages.some(page => path.startsWith(page));
  },
  
  validateHreflang(tags) {
    const errors = [];
    
    // Check for self-referencing canonical
    const canonical = tags.find(tag => tag.rel === 'canonical');
    if (!canonical) {
      errors.push('Missing canonical link');
    }
    
    // Check for x-default
    const xDefault = tags.find(tag => tag.hreflang === 'x-default');
    if (!xDefault) {
      errors.push('Missing x-default hreflang');
    }
    
    // Check for duplicate hreflang values
    const hreflangValues = tags
      .filter(tag => tag.hreflang)
      .map(tag => tag.hreflang);
    const duplicates = hreflangValues.filter((item, index) => hreflangValues.indexOf(item) !== index);
    
    if (duplicates.length > 0) {
      errors.push(`Duplicate hreflang values: ${duplicates.join(', ')}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};
