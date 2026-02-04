export interface Script {
  id: string;
  name: string;
  description: string;
  category: string;
  code: string;
  language: 'javascript' | 'python' | 'bash' | 'powershell';
  tags: string[];
  isPremium: boolean;
  author: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  usage?: string;
  dependencies?: string[];
}

export const mockScripts: Script[] = [
  {
    id: '1',
    name: 'Generador de Meta Descripciones SEO',
    description: 'Script automatizado para generar meta descripciones optimizadas para SEO usando IA.',
    category: 'SEO',
    code: `function generateMetaDescription(content, keywords) {
  // Lógica para generar meta descripción
  const maxLength = 160;
  const summary = content.substring(0, 120);
  return summary + '...';
}`,
    language: 'javascript',
    tags: ['SEO', 'Meta Description', 'Automatización'],
    isPremium: false,
    author: 'Red Creativa Pro',
    version: '1.0.0',
    createdAt: '2025-01-20',
    updatedAt: '2025-01-25',
    usage: 'Úsalo para generar automáticamente meta descripciones optimizadas.',
    dependencies: []
  },
  {
    id: '2',
    name: 'Extractor de Keywords',
    description: 'Extrae automáticamente las palabras clave más relevantes de cualquier texto.',
    category: 'Análisis',
    code: `def extract_keywords(text, num_keywords=10):
    # Lógica para extraer keywords
    words = text.split()
    # Procesamiento de texto
    return keywords[:num_keywords]`,
    language: 'python',
    tags: ['Keywords', 'Análisis', 'NLP'],
    isPremium: true,
    author: 'Red Creativa Pro',
    version: '2.1.0',
    createdAt: '2025-01-15',
    updatedAt: '2025-01-28',
    usage: 'Analiza textos y extrae las palabras clave más importantes.',
    dependencies: ['nltk', 'textblob']
  },
  {
    id: '3',
    name: 'Optimizador de Contenido',
    description: 'Optimiza automáticamente el contenido para mejorar su legibilidad y SEO.',
    category: 'Optimización',
    code: `#!/bin/bash
# Script para optimizar contenido
echo "Optimizando contenido..."
# Lógica de optimización`,
    language: 'bash',
    tags: ['Optimización', 'Contenido', 'SEO'],
    isPremium: true,
    author: 'Red Creativa Pro',
    version: '1.5.0',
    createdAt: '2025-01-10',
    updatedAt: '2025-01-22',
    usage: 'Ejecuta para optimizar automáticamente tu contenido.',
    dependencies: ['curl', 'jq']
  }
];
