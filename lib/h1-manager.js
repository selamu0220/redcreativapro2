
// H1 validation and automatic generation
export class H1Manager {
  static validateH1(content) {
    const h1Regex = /<h1[^>]*>(.*?)<\/h1>/gi;
    const matches = content.match(h1Regex);
    
    return {
      hasH1: matches && matches.length > 0,
      h1Count: matches ? matches.length : 0,
      h1Text: matches ? matches[0].replace(/<[^>]*>/g, '') : null,
      isMultipleH1: matches && matches.length > 1
    };
  }
  
  static generateH1FromTitle(title, category = '') {
    // Generate SEO-optimized H1 based on title and category
    let h1Text = title;
    
    // Add category context if provided
    if (category) {
      const categoryMap = {
        'ia': 'Inteligencia Artificial',
        'chatgpt': 'ChatGPT',
        'escritura': 'Escritura',
        'seo': 'SEO',
        'herramientas': 'Herramientas'
      };
      
      const categoryName = categoryMap[category.toLowerCase()] || category;
      h1Text = `${title} - ${categoryName}`;
    }
    
    return `<h1>${h1Text}</h1>`;
  }
  
  static fixMissingH1(htmlContent, pageTitle, category = '') {
    const validation = this.validateH1(htmlContent);
    
    if (!validation.hasH1) {
      const h1Tag = this.generateH1FromTitle(pageTitle, category);
      
      // Insert H1 after opening body tag or at the beginning of main content
      const bodyMatch = htmlContent.match(/<body[^>]*>/i);
      if (bodyMatch) {
        const insertIndex = bodyMatch.index + bodyMatch[0].length;
        return htmlContent.slice(0, insertIndex) + '\n' + h1Tag + '\n' + htmlContent.slice(insertIndex);
      }
      
      // Fallback: prepend to content
      return h1Tag + '\n' + htmlContent;
    }
    
    if (validation.isMultipleH1) {
      // Convert additional H1s to H2s
      let fixedContent = htmlContent;
      const h1Matches = htmlContent.match(/<h1[^>]*>.*?<\/h1>/gi);
      
      if (h1Matches && h1Matches.length > 1) {
        // Keep first H1, convert others to H2
        for (let i = 1; i < h1Matches.length; i++) {
          const h2Version = h1Matches[i].replace(/h1/gi, 'h2');
          fixedContent = fixedContent.replace(h1Matches[i], h2Version);
        }
      }
      
      return fixedContent;
    }
    
    return htmlContent;
  }
  
  static generatePageH1Config() {
    return {
      '/': 'Red Creativa - Plataforma de IA para Escritores',
      '/escritor-ia': 'Escritor con Inteligencia Artificial - Red Creativa',
      '/correos-ia': 'Generador de Correos con IA - Red Creativa', 
      '/dashboard': 'Dashboard - Panel de Control',
      '/blog': 'Blog - Artículos sobre IA y Escritura',
      '/contacto': 'Contacto - Red Creativa',
      '/centro-ayuda': 'Centro de Ayuda - Soporte y Documentación',
      '/preguntas-frecuentes': 'Preguntas Frecuentes - FAQ',
      '/planes': 'Planes y Precios - Red Creativa',
      '/seo-dashboard': 'Dashboard SEO - Optimización y Análisis'
    };
  }
}
