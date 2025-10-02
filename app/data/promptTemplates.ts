export interface PromptTemplate {
  id: string
  name: string
  description: string
  content: string
  category: string
  tags: string[]
  variables?: string[]
  isBuiltIn?: boolean
  usageCount?: number
  createdAt?: string
}

export interface TemplateCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

export const templateCategories: TemplateCategory[] = [
  {
    id: 'writing',
    name: 'Escritura',
    description: 'Templates para creación de contenido y escritura',
    icon: 'PenTool',
    color: 'blue'
  },
  {
    id: 'business',
    name: 'Negocios',
    description: 'Templates para análisis de negocio y estrategia',
    icon: 'Briefcase',
    color: 'green'
  },
  {
    id: 'development',
    name: 'Desarrollo',
    description: 'Templates para programación y desarrollo de software',
    icon: 'Code',
    color: 'purple'
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Templates para marketing digital y publicidad',
    icon: 'Megaphone',
    color: 'orange'
  },
  {
    id: 'education',
    name: 'Educación',
    description: 'Templates para enseñanza y aprendizaje',
    icon: 'GraduationCap',
    color: 'indigo'
  },
  {
    id: 'analysis',
    name: 'Análisis',
    description: 'Templates para análisis de datos y investigación',
    icon: 'BarChart3',
    color: 'teal'
  }
]

export const promptTemplates: PromptTemplate[] = [
  // Escritura
  {
    id: 'blog-post',
    name: 'Artículo de Blog',
    description: 'Genera un artículo de blog completo sobre cualquier tema',
    content: 'Escribe un artículo de blog completo sobre "{{topic}}". El artículo debe:\n\n1. Tener un título atractivo\n2. Una introducción que enganche al lector\n3. {{sections}} secciones principales con subtítulos\n4. Ejemplos prácticos y casos de uso\n5. Una conclusión que resuma los puntos clave\n6. Un llamado a la acción\n\nTono: {{tone}}\nAudiencia objetivo: {{audience}}\nLongitud aproximada: {{length}} palabras',
    category: 'writing',
    tags: ['blog', 'contenido', 'SEO'],
    variables: ['topic', 'sections', 'tone', 'audience', 'length']
  },
  {
    id: 'email-marketing',
    name: 'Email de Marketing',
    description: 'Crea emails de marketing efectivos',
    content: 'Crea un email de marketing para {{product_service}} dirigido a {{target_audience}}.\n\nObjetivo: {{objective}}\n\nEl email debe incluir:\n- Asunto atractivo\n- Saludo personalizado\n- Propuesta de valor clara\n- Llamado a la acción específico\n- Tono {{tone}}\n\nLongitud: {{length}}',
    category: 'marketing',
    tags: ['email', 'marketing', 'conversión'],
    variables: ['product_service', 'target_audience', 'objective', 'tone', 'length']
  },
  {
    id: 'social-media-post',
    name: 'Post para Redes Sociales',
    description: 'Genera contenido optimizado para redes sociales',
    content: 'Crea un post para {{platform}} sobre {{topic}}.\n\nCaracterísticas:\n- Plataforma: {{platform}}\n- Audiencia: {{audience}}\n- Tono: {{tone}}\n- Incluir hashtags relevantes\n- Llamado a la acción\n{{emoji_style}}\n\nObjetivo: {{objective}}',
    category: 'marketing',
    tags: ['redes sociales', 'contenido', 'engagement'],
    variables: ['platform', 'topic', 'audience', 'tone', 'emoji_style', 'objective']
  },

  // Negocios
  {
    id: 'business-plan',
    name: 'Plan de Negocios',
    description: 'Estructura un plan de negocios completo',
    content: 'Crea un plan de negocios para {{business_name}}, una empresa de {{industry}}.\n\nIncluye las siguientes secciones:\n\n1. **Resumen Ejecutivo**\n2. **Descripción de la Empresa**\n3. **Análisis de Mercado**\n4. **Organización y Gestión**\n5. **Productos o Servicios**\n6. **Marketing y Ventas**\n7. **Proyecciones Financieras**\n8. **Solicitud de Financiamiento**\n\nMercado objetivo: {{target_market}}\nInversión inicial: {{initial_investment}}',
    category: 'business',
    tags: ['plan de negocios', 'estrategia', 'startup'],
    variables: ['business_name', 'industry', 'target_market', 'initial_investment']
  },
  {
    id: 'swot-analysis',
    name: 'Análisis FODA',
    description: 'Realiza un análisis FODA completo',
    content: 'Realiza un análisis FODA (Fortalezas, Oportunidades, Debilidades, Amenazas) para {{company_project}}.\n\nContexto: {{context}}\nIndustria: {{industry}}\nMercado objetivo: {{target_market}}\n\nProporciona:\n- 5 fortalezas principales\n- 5 oportunidades clave\n- 5 debilidades a mejorar\n- 5 amenazas potenciales\n\nIncluye recomendaciones estratégicas basadas en el análisis.',
    category: 'business',
    tags: ['análisis', 'estrategia', 'FODA'],
    variables: ['company_project', 'context', 'industry', 'target_market']
  },

  // Desarrollo
  {
    id: 'code-review',
    name: 'Revisión de Código',
    description: 'Analiza y mejora código existente',
    content: 'Revisa el siguiente código {{language}} y proporciona feedback detallado:\n\n```{{language}}\n{{code}}\n```\n\nAnaliza:\n1. **Legibilidad y estilo**\n2. **Rendimiento**\n3. **Seguridad**\n4. **Mejores prácticas**\n5. **Posibles bugs**\n6. **Sugerencias de refactoring**\n\nProporciona ejemplos de código mejorado donde sea necesario.',
    category: 'development',
    tags: ['código', 'revisión', 'mejores prácticas'],
    variables: ['language', 'code']
  },
  {
    id: 'api-documentation',
    name: 'Documentación de API',
    description: 'Genera documentación completa para APIs',
    content: 'Crea documentación completa para la API {{api_name}}.\n\nDetalles de la API:\n- Propósito: {{purpose}}\n- Tecnología: {{technology}}\n- Endpoints principales: {{endpoints}}\n\nLa documentación debe incluir:\n1. **Introducción y propósito**\n2. **Autenticación**\n3. **Endpoints disponibles**\n4. **Parámetros de entrada**\n5. **Respuestas de ejemplo**\n6. **Códigos de error**\n7. **Ejemplos de uso**\n8. **Rate limiting**',
    category: 'development',
    tags: ['API', 'documentación', 'desarrollo'],
    variables: ['api_name', 'purpose', 'technology', 'endpoints']
  },

  // Educación
  {
    id: 'lesson-plan',
    name: 'Plan de Lección',
    description: 'Crea un plan de lección estructurado',
    content: 'Crea un plan de lección para enseñar {{topic}} a {{audience}}.\n\nDetalles:\n- Duración: {{duration}}\n- Nivel: {{level}}\n- Objetivos de aprendizaje: {{objectives}}\n\nEl plan debe incluir:\n1. **Objetivos específicos**\n2. **Materiales necesarios**\n3. **Introducción ({{intro_time}} min)**\n4. **Desarrollo del contenido ({{main_time}} min)**\n5. **Actividades prácticas ({{activity_time}} min)**\n6. **Evaluación y cierre ({{closing_time}} min)**\n7. **Recursos adicionales**\n8. **Tarea o seguimiento**',
    category: 'education',
    tags: ['educación', 'enseñanza', 'planificación'],
    variables: ['topic', 'audience', 'duration', 'level', 'objectives', 'intro_time', 'main_time', 'activity_time', 'closing_time']
  },

  // Análisis
  {
    id: 'data-analysis',
    name: 'Análisis de Datos',
    description: 'Analiza conjuntos de datos y extrae insights',
    content: 'Analiza los siguientes datos sobre {{data_topic}}:\n\n{{data_description}}\n\nRealiza:\n1. **Análisis descriptivo**\n   - Estadísticas básicas\n   - Tendencias principales\n   - Patrones identificados\n\n2. **Insights clave**\n   - Hallazgos más importantes\n   - Correlaciones relevantes\n   - Anomalías o outliers\n\n3. **Recomendaciones**\n   - Acciones sugeridas\n   - Áreas de oportunidad\n   - Próximos pasos\n\nFormato de salida: {{output_format}}',
    category: 'analysis',
    tags: ['datos', 'análisis', 'insights'],
    variables: ['data_topic', 'data_description', 'output_format']
  },
  {
    id: 'competitor-analysis',
    name: 'Análisis de Competencia',
    description: 'Analiza la competencia en tu mercado',
    content: 'Realiza un análisis de competencia para {{company}} en el mercado de {{market}}.\n\nCompetidores a analizar: {{competitors}}\n\nAnaliza para cada competidor:\n1. **Perfil de la empresa**\n2. **Productos/servicios principales**\n3. **Estrategia de precios**\n4. **Presencia digital y marketing**\n5. **Fortalezas y debilidades**\n6. **Cuota de mercado estimada**\n\nConcluye con:\n- Posicionamiento competitivo\n- Oportunidades identificadas\n- Estrategias recomendadas\n- Diferenciación propuesta',
    category: 'analysis',
    tags: ['competencia', 'mercado', 'estrategia'],
    variables: ['company', 'market', 'competitors']
  }
]

export const getTemplatesByCategory = (categoryId: string): PromptTemplate[] => {
  return promptTemplates.filter(template => template.category === categoryId)
}

export const getTemplateById = (templateId: string): PromptTemplate | undefined => {
  return promptTemplates.find(template => template.id === templateId)
}

export const searchTemplates = (query: string): PromptTemplate[] => {
  const lowercaseQuery = query.toLowerCase()
  return promptTemplates.filter(template => 
    (template.name || '').toLowerCase().includes(lowercaseQuery) ||
    (template.description || '').toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => (tag || '').toLowerCase().includes(lowercaseQuery))
  )
}