export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'template' | 'guide' | 'tool' | 'ebook' | 'video';
  category: string;
  url?: string;
  downloadUrl?: string;
  thumbnail?: string;
  tags: string[];
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}

export const mockResources: Resource[] = [
  {
    id: '1',
    title: 'Plantillas de Email Marketing con IA',
    description: 'Colección de plantillas profesionales para campañas de email marketing optimizadas con IA.',
    type: 'template',
    category: 'Email Marketing',
    downloadUrl: '/resources/email-templates.zip',
    thumbnail: '/resources/email-templates-thumb.jpg',
    tags: ['Email', 'Plantillas', 'Marketing'],
    isPremium: true,
    createdAt: '2025-01-20',
    updatedAt: '2025-01-29'
  },
  {
    id: '2',
    title: 'Guía completa de Prompts para IA',
    description: 'Manual detallado con los mejores prompts para generar contenido de calidad con inteligencia artificial.',
    type: 'guide',
    category: 'Prompts',
    downloadUrl: '/resources/prompts-guide.pdf',
    thumbnail: '/resources/prompts-guide-thumb.jpg',
    tags: ['Prompts', 'IA', 'Guía'],
    isPremium: false,
    createdAt: '2025-01-15',
    updatedAt: '2025-01-25'
  },
  {
    id: '3',
    title: 'Herramienta de Análisis de Contenido',
    description: 'Analiza la efectividad de tu contenido y obtén sugerencias de mejora automáticas.',
    type: 'tool',
    category: 'Análisis',
    url: '/tools/content-analyzer',
    thumbnail: '/resources/content-analyzer-thumb.jpg',
    tags: ['Análisis', 'Contenido', 'Herramienta'],
    isPremium: true,
    createdAt: '2025-01-10',
    updatedAt: '2025-01-20'
  }
];
