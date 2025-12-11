export interface GlossaryTerm {
  id: string
  term: string
  definition: string
  category: string
  related?: string[]
}

export const glossaryTerms: GlossaryTerm[] = [
  {
    id: 'automatizacion',
    term: 'Automatización',
    category: 'productividad',
    definition:
      'Uso de sistemas y herramientas para ejecutar tareas con mínima intervención humana, mejorando eficiencia y consistencia.'
  },
  {
    id: 'prompt',
    term: 'Prompt',
    category: 'creatividad',
    definition:
      'Instrucción o contexto que se proporciona a un modelo de IA para guiar su respuesta o generación.'
  },
  {
    id: 'ctr',
    term: 'CTR (Click-Through Rate)',
    category: 'seo',
    definition:
      'Porcentaje de clics sobre impresiones en resultados de búsqueda o listados. Indicador clave de relevancia y atractivo.'
  },
  {
    id: 'lcp',
    term: 'LCP (Largest Contentful Paint)',
    category: 'seo',
    definition:
      'Métrica de rendimiento que mide el tiempo de renderizado del mayor elemento visible en la ventana.'
  },
  {
    id: 'cls',
    term: 'CLS (Cumulative Layout Shift)',
    category: 'seo',
    definition:
      'Métrica que cuantifica los cambios inesperados de diseño durante la carga de la página.'
  }
]

export function getGlossaryTermById(id: string): GlossaryTerm | undefined {
  return glossaryTerms.find(t => t.id === id)
}

