// SEO-Specific Prompt Templates - 50+ prompts organizados por categoría
export interface SEOPrompt {
    id: string;
    name: string;
    description: string;
    category: SEOPromptCategory;
    prompt: string;
    variables?: string[];
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export type SEOPromptCategory =
    | 'on-page'
    | 'meta-tags'
    | 'headings'
    | 'content-structure'
    | 'keyword-optimization'
    | 'local-seo'
    | 'technical'
    | 'link-building'
    | 'ecommerce'
    | 'blog';

export const SEO_PROMPT_CATEGORIES: Record<SEOPromptCategory, { label: string; icon: string; color: string }> = {
    'on-page': { label: 'SEO On-Page', icon: '📄', color: 'bg-blue-500' },
    'meta-tags': { label: 'Meta Tags', icon: '🏷️', color: 'bg-purple-500' },
    'headings': { label: 'Encabezados', icon: '📝', color: 'bg-green-500' },
    'content-structure': { label: 'Estructura', icon: '🏗️', color: 'bg-amber-500' },
    'keyword-optimization': { label: 'Keywords', icon: '🔑', color: 'bg-red-500' },
    'local-seo': { label: 'SEO Local', icon: '📍', color: 'bg-teal-500' },
    'technical': { label: 'Técnico', icon: '⚙️', color: 'bg-zinc-500' },
    'link-building': { label: 'Link Building', icon: '🔗', color: 'bg-indigo-500' },
    'ecommerce': { label: 'E-commerce', icon: '🛒', color: 'bg-orange-500' },
    'blog': { label: 'Blog', icon: '✍️', color: 'bg-pink-500' }
};

export const SEO_PROMPTS: SEOPrompt[] = [
    // ============ META TAGS (10 prompts) ============
    {
        id: 'meta-title-product',
        name: 'Meta Title para Producto',
        description: 'Genera un título SEO optimizado para una página de producto',
        category: 'meta-tags',
        prompt: `Genera 5 opciones de meta title para una página de producto con estas características:
- Producto: {{producto}}
- Palabra clave principal: {{keyword}}
- Beneficio principal: {{beneficio}}

Requisitos:
- Máximo 60 caracteres
- Incluir la palabra clave al inicio
- Usar números o power words cuando sea posible
- Generar urgencia o curiosidad

Formato de respuesta:
1. [título] (XX caracteres)
2. ...`,
        variables: ['producto', 'keyword', 'beneficio'],
        tags: ['meta', 'producto', 'título'],
        difficulty: 'beginner'
    },
    {
        id: 'meta-description-service',
        name: 'Meta Description para Servicio',
        description: 'Crea descripciones atractivas para páginas de servicios',
        category: 'meta-tags',
        prompt: `Escribe 3 meta descriptions para una página de servicio:
- Servicio: {{servicio}}
- Beneficio principal: {{beneficio}}
- CTA deseado: {{cta}}

Requisitos:
- 150-160 caracteres exactos
- Incluir beneficio claro
- Llamada a la acción
- Generar click-through

Ejemplo de estructura: [Beneficio] + [Servicio] + [CTA]`,
        variables: ['servicio', 'beneficio', 'cta'],
        tags: ['meta', 'servicio', 'descripción'],
        difficulty: 'beginner'
    },
    {
        id: 'meta-og-tags',
        name: 'Open Graph Tags Completos',
        description: 'Genera todos los OG tags para compartir en redes sociales',
        category: 'meta-tags',
        prompt: `Genera el código HTML completo de Open Graph tags para:
- Página: {{tipo_pagina}}
- Título principal: {{titulo}}
- Descripción: {{descripcion}}
- URL: {{url}}

Incluye:
- og:title (máx 60 chars)
- og:description (máx 200 chars)  
- og:type
- og:url
- og:site_name
- twitter:card
- twitter:title
- twitter:description

Formato: código HTML listo para copiar`,
        variables: ['tipo_pagina', 'titulo', 'descripcion', 'url'],
        tags: ['og', 'twitter', 'social'],
        difficulty: 'intermediate'
    },
    {
        id: 'meta-title-blog',
        name: 'Títulos SEO para Blog',
        description: '10 variaciones de títulos optimizados para artículos de blog',
        category: 'meta-tags',
        prompt: `Genera 10 títulos SEO para un artículo de blog sobre:
- Tema: {{tema}}
- Keyword principal: {{keyword}}
- Intención de búsqueda: {{intencion}}

Variaciones a incluir:
- Con número (lista)
- Con pregunta
- Con "cómo"
- Con año actual
- Con power words (definitivo, secreto, fácil)
- Con beneficio directo

Máximo 60 caracteres cada uno.`,
        variables: ['tema', 'keyword', 'intencion'],
        tags: ['blog', 'títulos', 'variaciones'],
        difficulty: 'beginner'
    },
    {
        id: 'meta-local-business',
        name: 'Meta Tags para Negocio Local',
        description: 'Optimiza meta tags con enfoque local y geográfico',
        category: 'meta-tags',
        prompt: `Genera meta title y description para un negocio local:
- Negocio: {{negocio}}
- Ciudad/Zona: {{ubicacion}}
- Servicio principal: {{servicio}}
- Diferenciador: {{diferenciador}}

Requisitos:
- Incluir ubicación de forma natural
- Meta title: máx 60 chars
- Meta description: 150-160 chars
- Incluir CTA local ("Visítanos", "Llámanos")

Genera 3 combinaciones diferentes.`,
        variables: ['negocio', 'ubicacion', 'servicio', 'diferenciador'],
        tags: ['local', 'negocio', 'geo'],
        difficulty: 'beginner'
    },

    // ============ HEADINGS (8 prompts) ============
    {
        id: 'heading-h1-optimization',
        name: 'H1 Optimizado',
        description: 'Genera H1 perfectos para diferentes tipos de páginas',
        category: 'headings',
        prompt: `Crea 5 opciones de H1 para:
- Tipo de página: {{tipo_pagina}}
- Keyword principal: {{keyword}}
- Propuesta de valor: {{propuesta}}

Reglas SEO para H1:
- Único por página
- Keyword cerca del inicio
- Descriptivo pero conciso
- Diferente al meta title
- Máximo 70 caracteres

Indica cuál recomendarías y por qué.`,
        variables: ['tipo_pagina', 'keyword', 'propuesta'],
        tags: ['h1', 'encabezado', 'principal'],
        difficulty: 'beginner'
    },
    {
        id: 'heading-hierarchy',
        name: 'Jerarquía de Encabezados',
        description: 'Estructura completa H1-H6 para un artículo',
        category: 'headings',
        prompt: `Diseña la estructura de encabezados para un artículo sobre:
- Tema: {{tema}}
- Keyword principal: {{keyword}}
- Keywords secundarias: {{keywords_secundarias}}
- Extensión objetivo: {{palabras}} palabras

Genera:
- 1 H1 (con keyword principal)
- 4-6 H2 (secciones principales)
- 2-3 H3 bajo cada H2 relevante
- Incluye keywords de forma natural

Formato:
H1: ...
  H2: ...
    H3: ...
    H3: ...
  H2: ...`,
        variables: ['tema', 'keyword', 'keywords_secundarias', 'palabras'],
        tags: ['estructura', 'jerarquía', 'outline'],
        difficulty: 'intermediate'
    },
    {
        id: 'heading-faq-section',
        name: 'Encabezados FAQ',
        description: 'Genera preguntas H3 para sección de FAQ',
        category: 'headings',
        prompt: `Crea 10 preguntas frecuentes (H3) sobre:
- Tema: {{tema}}
- Keyword: {{keyword}}
- Audiencia: {{audiencia}}

Requisitos:
- Empezar con: Qué, Cómo, Cuándo, Por qué, Cuál, Dónde
- Incluir keyword cuando sea natural
- Preguntas que la gente realmente busca
- Mezclar preguntas básicas y avanzadas

Formato:
<h3>¿Pregunta?</h3>
<p>[espacio para respuesta]</p>`,
        variables: ['tema', 'keyword', 'audiencia'],
        tags: ['faq', 'preguntas', 'schema'],
        difficulty: 'beginner'
    },

    // ============ CONTENT STRUCTURE (10 prompts) ============
    {
        id: 'structure-pillar-page',
        name: 'Estructura Pillar Page',
        description: 'Outline completo para página pilar de 3000+ palabras',
        category: 'content-structure',
        prompt: `Diseña la estructura de una Pillar Page sobre:
- Tema central: {{tema}}
- Keyword principal: {{keyword}}
- Cluster topics: {{clusters}}

Genera outline con:
1. Introducción enganchadora (150 palabras)
2. Tabla de contenidos
3. 6-8 secciones principales (H2)
4. 2-4 subsecciones por H2 (H3)
5. Sección de FAQ (5 preguntas)
6. Conclusión con CTA
7. Enlaces internos sugeridos

Incluye estimación de palabras por sección.`,
        variables: ['tema', 'keyword', 'clusters'],
        tags: ['pillar', 'estructura', 'largo'],
        difficulty: 'advanced'
    },
    {
        id: 'structure-comparison',
        name: 'Artículo Comparativo',
        description: 'Estructura para "X vs Y" o "Mejores X"',
        category: 'content-structure',
        prompt: `Crea estructura para artículo comparativo:
- Tipo: {{tipo}} (X vs Y / Top 10 / Mejores)
- Elementos a comparar: {{elementos}}
- Criterios de evaluación: {{criterios}}

Estructura sugerida:
1. Intro con resumen rápido
2. Tabla comparativa
3. Análisis individual de cada opción
4. Pros y contras
5. ¿Cuál elegir según caso de uso?
6. Veredicto final

Incluye schema markup sugerido (Review/Product).`,
        variables: ['tipo', 'elementos', 'criterios'],
        tags: ['comparativa', 'versus', 'review'],
        difficulty: 'intermediate'
    },
    {
        id: 'structure-how-to',
        name: 'Guía Paso a Paso',
        description: 'Estructura de tutorial con schema HowTo',
        category: 'content-structure',
        prompt: `Diseña una guía "Cómo hacer {{accion}}":
- Acción: {{accion}}
- Nivel de dificultad: {{nivel}}
- Tiempo estimado: {{tiempo}}
- Herramientas necesarias: {{herramientas}}

Incluye:
1. Resumen rápido (qué aprenderán)
2. Materiales/requisitos previos
3. Pasos numerados (8-12 pasos)
4. Tips pro en cada paso
5. Errores comunes a evitar
6. FAQ
7. Schema HowTo en JSON-LD

Formato de paso:
Paso X: [Título del paso]
- Instrucción detallada
- Tip: ...
- ⚠️ Evitar: ...`,
        variables: ['accion', 'nivel', 'tiempo', 'herramientas'],
        tags: ['tutorial', 'howto', 'pasos'],
        difficulty: 'intermediate'
    },

    // ============ KEYWORD OPTIMIZATION (8 prompts) ============
    {
        id: 'keyword-lsi-generation',
        name: 'Keywords LSI y Relacionadas',
        description: 'Genera términos LSI para enriquecer contenido',
        category: 'keyword-optimization',
        prompt: `Genera keywords LSI y relacionadas para:
- Keyword principal: {{keyword}}
- Industria: {{industria}}
- Intención: {{intencion}}

Proporciona:
1. 10 sinónimos y variaciones
2. 10 términos LSI (semánticamente relacionados)
3. 5 long-tail keywords
4. 5 preguntas relacionadas (People Also Ask)
5. 3 keywords de cola larga comerciales

Agrupa por intención: informacional, navegacional, transaccional.`,
        variables: ['keyword', 'industria', 'intencion'],
        tags: ['lsi', 'variaciones', 'semántica'],
        difficulty: 'intermediate'
    },
    {
        id: 'keyword-density-rewrite',
        name: 'Optimizar Densidad de Keyword',
        description: 'Reescribe texto para optimizar keyword sin stuffing',
        category: 'keyword-optimization',
        prompt: `Optimiza este texto para la keyword "{{keyword}}":

TEXTO ORIGINAL:
{{texto}}

Requisitos:
- Densidad objetivo: 1-2%
- Usar keyword en: primer párrafo, un H2, conclusión
- Incluir 3-4 variaciones/sinónimos
- Mantener naturalidad (no keyword stuffing)
- Preservar el mensaje original

Devuelve:
1. Texto optimizado
2. Conteo de keyword y variaciones
3. % de densidad final`,
        variables: ['keyword', 'texto'],
        tags: ['densidad', 'optimización', 'reescribir'],
        difficulty: 'intermediate'
    },
    {
        id: 'keyword-intent-mapping',
        name: 'Mapeo de Intención de Búsqueda',
        description: 'Clasifica keywords por intención y sugiere contenido',
        category: 'keyword-optimization',
        prompt: `Analiza estas keywords y clasifícalas por intención:

Keywords: {{keywords}}

Para cada una indica:
1. Intención: Informacional / Navegacional / Comercial / Transaccional
2. Etapa del funnel: TOFU / MOFU / BOFU
3. Tipo de contenido ideal
4. Formato sugerido (blog, landing, producto, etc.)
5. CTA apropiado

Formato tabla:
| Keyword | Intención | Funnel | Contenido | CTA |`,
        variables: ['keywords'],
        tags: ['intención', 'funnel', 'mapeo'],
        difficulty: 'advanced'
    },

    // ============ LOCAL SEO (6 prompts) ============
    {
        id: 'local-gmb-description',
        name: 'Descripción Google My Business',
        description: 'Optimiza la descripción de tu ficha de Google',
        category: 'local-seo',
        prompt: `Escribe una descripción optimizada para Google My Business:
- Negocio: {{negocio}}
- Categoría: {{categoria}}
- Ubicación: {{ubicacion}}
- Servicios principales: {{servicios}}
- Diferenciadores: {{diferenciadores}}

Requisitos:
- Máximo 750 caracteres
- Incluir ubicación y servicios
- Palabras clave locales
- Llamada a la acción
- Tono profesional pero cercano

Genera 2 versiones: formal y casual.`,
        variables: ['negocio', 'categoria', 'ubicacion', 'servicios', 'diferenciadores'],
        tags: ['gmb', 'local', 'descripción'],
        difficulty: 'beginner'
    },
    {
        id: 'local-service-areas',
        name: 'Páginas de Área de Servicio',
        description: 'Estructura para páginas de ciudades/zonas',
        category: 'local-seo',
        prompt: `Crea outline para página de área de servicio:
- Servicio: {{servicio}}
- Ciudad/Zona: {{ciudad}}
- Barrios/Zonas dentro: {{zonas}}

Estructura:
1. H1 con servicio + ciudad
2. Intro mencionando la zona
3. Servicios específicos en esa área
4. Por qué elegirnos (mencionar presencia local)
5. Áreas cercanas que atendemos
6. Testimonios locales (espacio)
7. CTA con teléfono local
8. Schema LocalBusiness

Incluye internal linking a otras páginas de ciudad.`,
        variables: ['servicio', 'ciudad', 'zonas'],
        tags: ['local', 'ciudades', 'áreas'],
        difficulty: 'intermediate'
    },
    {
        id: 'local-reviews-response',
        name: 'Respuestas a Reseñas',
        description: 'Templates para responder reseñas positivas y negativas',
        category: 'local-seo',
        prompt: `Genera templates de respuesta a reseñas:
- Negocio: {{negocio}}
- Tono de marca: {{tono}}

Crea 3 respuestas para cada tipo:

RESEÑAS 5 ESTRELLAS:
- Respuesta corta
- Respuesta con invitación a volver
- Respuesta destacando el servicio mencionado

RESEÑAS 3-4 ESTRELLAS:
- Agradecer y pedir feedback
- Ofrecer mejora

RESEÑAS 1-2 ESTRELLAS:
- Respuesta empática
- Ofrecer solución offline
- Reconocer error (si aplica)

Todas deben incluir nombre del negocio y ser personalizables.`,
        variables: ['negocio', 'tono'],
        tags: ['reviews', 'respuestas', 'reputación'],
        difficulty: 'beginner'
    },

    // ============ TECHNICAL SEO (5 prompts) ============
    {
        id: 'technical-schema-article',
        name: 'Schema Article/BlogPosting',
        description: 'JSON-LD para artículos de blog',
        category: 'technical',
        prompt: `Genera el Schema markup JSON-LD para un artículo:
- Título: {{titulo}}
- Descripción: {{descripcion}}
- Autor: {{autor}}
- Fecha publicación: {{fecha}}
- URL: {{url}}
- Imagen destacada: {{imagen}}

Incluye:
- @type: BlogPosting o Article
- headline, description, author
- datePublished, dateModified
- image, publisher
- mainEntityOfPage

Código listo para insertar en <head>.`,
        variables: ['titulo', 'descripcion', 'autor', 'fecha', 'url', 'imagen'],
        tags: ['schema', 'json-ld', 'article'],
        difficulty: 'intermediate'
    },
    {
        id: 'technical-schema-faq',
        name: 'Schema FAQPage',
        description: 'JSON-LD para sección de preguntas frecuentes',
        category: 'technical',
        prompt: `Genera Schema FAQPage para estas preguntas:

{{preguntas_respuestas}}

Formato de entrada esperado:
P: ¿Pregunta 1?
R: Respuesta 1

P: ¿Pregunta 2?
R: Respuesta 2

Genera JSON-LD completo con:
- @context
- @type: FAQPage
- mainEntity array con Question/Answer

El código debe ser válido y listo para usar.`,
        variables: ['preguntas_respuestas'],
        tags: ['schema', 'faq', 'rich-snippets'],
        difficulty: 'intermediate'
    },
    {
        id: 'technical-robots-meta',
        name: 'Directivas Robots Meta',
        description: 'Genera meta robots apropiados para cada tipo de página',
        category: 'technical',
        prompt: `Recomienda las directivas de meta robots para:
- Tipo de página: {{tipo_pagina}}
- ¿Contiene contenido duplicado?: {{duplicado}}
- ¿Es página de paginación?: {{paginacion}}
- ¿Tiene valor SEO?: {{valor_seo}}

Opciones a considerar:
- index/noindex
- follow/nofollow
- max-snippet
- max-image-preview
- max-video-preview

Proporciona:
1. Meta tag recomendado
2. Justificación
3. Alternativas si aplica`,
        variables: ['tipo_pagina', 'duplicado', 'paginacion', 'valor_seo'],
        tags: ['robots', 'meta', 'indexación'],
        difficulty: 'advanced'
    },

    // ============ LINK BUILDING (4 prompts) ============
    {
        id: 'linkbuilding-outreach-email',
        name: 'Email de Outreach',
        description: 'Templates de email para conseguir backlinks',
        category: 'link-building',
        prompt: `Escribe un email de outreach para conseguir un backlink:
- Mi sitio/contenido: {{mi_contenido}}
- Sitio objetivo: {{sitio_objetivo}}
- Página donde quiero el enlace: {{pagina_target}}
- Valor que ofrezco: {{valor}}

Genera 3 versiones:
1. Guest post pitch
2. Recurso para enlazar
3. Broken link building

Requisitos:
- Subject line atractivo
- Personalizado (no spam)
- Propuesta de valor clara
- CTA específico
- Máximo 150 palabras`,
        variables: ['mi_contenido', 'sitio_objetivo', 'pagina_target', 'valor'],
        tags: ['outreach', 'email', 'backlinks'],
        difficulty: 'intermediate'
    },
    {
        id: 'linkbuilding-anchor-text',
        name: 'Variaciones de Anchor Text',
        description: 'Genera anchor texts variados para link building natural',
        category: 'link-building',
        prompt: `Genera variaciones de anchor text para:
- URL objetivo: {{url}}
- Keyword principal: {{keyword}}
- Tema del contenido: {{tema}}

Proporciona 20 anchor texts distribuidos:
- 3 exact match (keyword exacta)
- 5 partial match (keyword + palabras)
- 5 branded (nombre de marca)
- 4 genéricos (clic aquí, este sitio, etc.)
- 3 URL desnuda o variación

Incluye % recomendado de cada tipo para perfil natural.`,
        variables: ['url', 'keyword', 'tema'],
        tags: ['anchor', 'enlaces', 'variación'],
        difficulty: 'advanced'
    },

    // ============ E-COMMERCE (5 prompts) ============
    {
        id: 'ecommerce-product-description',
        name: 'Descripción de Producto SEO',
        description: 'Descripción optimizada para página de producto',
        category: 'ecommerce',
        prompt: `Escribe una descripción de producto optimizada para SEO:
- Producto: {{producto}}
- Keyword principal: {{keyword}}
- Características: {{caracteristicas}}
- Beneficios: {{beneficios}}
- Público objetivo: {{audiencia}}

Estructura:
1. Párrafo intro con keyword (50 palabras)
2. Beneficios principales (bullet points)
3. Características técnicas
4. Casos de uso
5. CTA de compra

Extensión: 200-300 palabras
Incluir keyword 2-3 veces de forma natural.`,
        variables: ['producto', 'keyword', 'caracteristicas', 'beneficios', 'audiencia'],
        tags: ['producto', 'ecommerce', 'descripción'],
        difficulty: 'beginner'
    },
    {
        id: 'ecommerce-category-intro',
        name: 'Texto de Categoría',
        description: 'Intro SEO para páginas de categoría de productos',
        category: 'ecommerce',
        prompt: `Escribe el texto introductorio para una categoría:
- Categoría: {{categoria}}
- Keyword: {{keyword}}
- Productos incluidos: {{productos}}
- Marca/Tienda: {{marca}}

Requisitos:
- 150-200 palabras
- Keyword en H1 y primer párrafo
- Mencionar tipos de productos disponibles
- Incluir beneficios de comprar esta categoría
- Tono acorde a la marca

Genera versión corta (100 palabras) y larga (200 palabras).`,
        variables: ['categoria', 'keyword', 'productos', 'marca'],
        tags: ['categoría', 'ecommerce', 'intro'],
        difficulty: 'beginner'
    },
    {
        id: 'ecommerce-schema-product',
        name: 'Schema Product con Reviews',
        description: 'JSON-LD completo para producto con valoraciones',
        category: 'ecommerce',
        prompt: `Genera Schema Product completo:
- Nombre: {{nombre}}
- Descripción: {{descripcion}}
- Precio: {{precio}} {{moneda}}
- SKU: {{sku}}
- Marca: {{marca}}
- Rating promedio: {{rating}}
- Número de reviews: {{reviews}}
- Disponibilidad: {{disponibilidad}}
- URL: {{url}}
- Imagen: {{imagen}}

Incluir:
- offers con precio y disponibilidad
- aggregateRating
- brand
- review (ejemplo)

JSON-LD válido y completo.`,
        variables: ['nombre', 'descripcion', 'precio', 'moneda', 'sku', 'marca', 'rating', 'reviews', 'disponibilidad', 'url', 'imagen'],
        tags: ['schema', 'producto', 'rich-snippets'],
        difficulty: 'advanced'
    },

    // ============ BLOG (6 prompts) ============
    {
        id: 'blog-intro-hook',
        name: 'Introducción Enganchadora',
        description: 'Primeros párrafos que retienen al lector',
        category: 'blog',
        prompt: `Escribe 3 introducciones diferentes para un artículo sobre:
- Tema: {{tema}}
- Keyword: {{keyword}}
- Dolor/Problema del lector: {{problema}}

Estilos:
1. ESTADÍSTICA IMPACTANTE: Empezar con dato sorprendente
2. PREGUNTA PROVOCADORA: Cuestionar creencia común
3. HISTORIA/ANÉCDOTA: Mini historia relatable

Requisitos:
- 80-120 palabras cada una
- Incluir keyword en primeras 100 palabras
- Prometer valor específico
- Generar curiosidad para seguir leyendo`,
        variables: ['tema', 'keyword', 'problema'],
        tags: ['intro', 'engagement', 'hook'],
        difficulty: 'intermediate'
    },
    {
        id: 'blog-conclusion-cta',
        name: 'Conclusión con CTA',
        description: 'Cierre de artículo que convierte',
        category: 'blog',
        prompt: `Escribe la conclusión para un artículo sobre:
- Tema: {{tema}}
- Puntos principales cubiertos: {{puntos}}
- CTA objetivo: {{cta}}
- Enlace relacionado a promocionar: {{enlace}}

Estructura:
1. Resumen de puntos clave (2-3 oraciones)
2. Beneficio de aplicar lo aprendido
3. Próximo paso claro (CTA)
4. Pregunta para comentarios

Extensión: 100-150 palabras
Incluir keyword una vez más.`,
        variables: ['tema', 'puntos', 'cta', 'enlace'],
        tags: ['conclusión', 'cta', 'conversión'],
        difficulty: 'beginner'
    },
    {
        id: 'blog-internal-linking',
        name: 'Sugerencias de Internal Linking',
        description: 'Genera anchor texts y contextos para enlaces internos',
        category: 'blog',
        prompt: `Sugiere oportunidades de internal linking para:
- Artículo actual: {{articulo_actual}}
- Artículos/páginas disponibles para enlazar: {{paginas_disponibles}}

Para cada enlace sugerido proporciona:
1. Página destino
2. Anchor text recomendado
3. Frase de contexto completa donde insertar
4. Posición sugerida en el artículo (intro, desarrollo, conclusión)

Objetivo: Crear 5-8 enlaces internos naturales que mejoren la estructura del sitio y la experiencia del usuario.`,
        variables: ['articulo_actual', 'paginas_disponibles'],
        tags: ['internal-linking', 'estructura', 'silo'],
        difficulty: 'intermediate'
    },
    {
        id: 'blog-update-refresh',
        name: 'Actualizar Contenido Antiguo',
        description: 'Checklist y sugerencias para refrescar artículos',
        category: 'blog',
        prompt: `Analiza este contenido antiguo y sugiere actualizaciones:

CONTENIDO:
{{contenido}}

FECHA ORIGINAL: {{fecha}}
KEYWORD OBJETIVO: {{keyword}}

Proporciona:
1. ¿La información sigue vigente? (Sí/No + detalles)
2. Estadísticas/datos a actualizar
3. Secciones a expandir
4. Secciones a eliminar o reducir
5. Nuevas keywords a incluir
6. Links rotos potenciales
7. Oportunidades de nuevo contenido (H2 adicionales)
8. Meta tags actualizados

Prioriza cambios por impacto SEO.`,
        variables: ['contenido', 'fecha', 'keyword'],
        tags: ['actualización', 'refresh', 'evergreen'],
        difficulty: 'advanced'
    },
    {
        id: 'blog-featured-snippet',
        name: 'Optimizar para Featured Snippet',
        description: 'Formatea contenido para capturar posición 0',
        category: 'blog',
        prompt: `Optimiza este contenido para capturar el featured snippet:
- Pregunta/Query: {{query}}
- Tipo de snippet objetivo: {{tipo}} (párrafo/lista/tabla)
- Contenido actual: {{contenido}}

Genera:
1. Respuesta directa (40-50 palabras) justo debajo del H2
2. Lista formateada si aplica
3. Tabla comparativa si aplica
4. Formato de pregunta-respuesta

Reglas:
- Responder la pregunta inmediatamente
- Usar la pregunta exacta como H2 o H3
- Formato claro y escaneable
- Incluir la keyword en la respuesta`,
        variables: ['query', 'tipo', 'contenido'],
        tags: ['snippet', 'posición-0', 'SERP'],
        difficulty: 'advanced'
    },
    {
        id: 'blog-content-brief',
        name: 'Content Brief Completo',
        description: 'Brief detallado para redactores SEO',
        category: 'blog',
        prompt: `Crea un content brief profesional:
- Keyword principal: {{keyword}}
- Keywords secundarias: {{secundarias}}
- Competidores a analizar: {{competidores}}
- Objetivo del contenido: {{objetivo}}

El brief debe incluir:
1. RESUMEN EJECUTIVO
2. ANÁLISIS DE SERP
   - Qué rankea actualmente
   - Gaps de contenido
3. ESTRUCTURA RECOMENDADA (outline)
4. REQUISITOS
   - Extensión mínima
   - Formato
   - Tono
5. KEYWORDS A INCLUIR
   - Principal (densidad)
   - Secundarias
   - LSI
6. INTERNAL LINKS SUGERIDOS
7. REFERENCIAS/FUENTES
8. CRITERIOS DE ÉXITO`,
        variables: ['keyword', 'secundarias', 'competidores', 'objetivo'],
        tags: ['brief', 'planificación', 'redacción'],
        difficulty: 'advanced'
    }
];

// Helper function to get prompts by category
export function getPromptsByCategory(category: SEOPromptCategory): SEOPrompt[] {
    return SEO_PROMPTS.filter(p => p.category === category);
}

// Helper function to search prompts
export function searchPrompts(query: string): SEOPrompt[] {
    const lowerQuery = query.toLowerCase();
    return SEO_PROMPTS.filter(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.tags.some(t => t.toLowerCase().includes(lowerQuery))
    );
}

// Get prompt by ID
export function getPromptById(id: string): SEOPrompt | undefined {
    return SEO_PROMPTS.find(p => p.id === id);
}
