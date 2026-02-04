import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Traducciones de artículos en inglés a español
const translations: Record<string, {
    title: string;
    excerpt: string;
    content: string;
    category: string;
    tags: string[];
    seo_title: string;
    seo_description: string;
}> = {
    'geo-optimization-guide-2025': {
        title: '¿Qué es GEO? Guía Definitiva de Optimización para Motores Generativos',
        excerpt: 'Olvídate del SEO tradicional. El futuro es GEO. Aprende a optimizar tu contenido para ser citado por Perplexity, Gemini y ChatGPT en 2025.',
        content: `
# Optimización para Motores Generativos (GEO): La Nueva Frontera

En 2025, la forma en que buscamos ha cambiado fundamentalmente. Los usuarios ya no solo hacen clic en enlaces azules—ahora preguntan directamente a los motores de IA.

**La Optimización para Motores Generativos (GEO)** es el arte y la ciencia de optimizar contenido para ser citado, referenciado y priorizado por motores de búsqueda con IA como Perplexity, ChatGPT Search, Claude y Google Gemini.

## Por Qué el SEO Está Evolucionando hacia GEO

El SEO tradicional se enfocaba en palabras clave y backlinks. GEO se enfoca en:
*   **Autoridad y Citabilidad:** ¿Puede la IA confiar en esta fuente?
*   **Datos Estructurados:** ¿Es la información fácil de procesar para un LLM?
*   **Semántica:** ¿El contenido responde a la *intención* detrás de la consulta, no solo coincide con la cadena de texto?

## Cómo Posicionar en Motores de IA

### 1. Sé la Fuente de la Verdad
Los modelos de IA priorizan datos de "verdad comprobada". Publica estadísticas originales, casos de estudio únicos e investigación primaria.

### 2. Estructura para Máquinas
Usa etiquetas H1, H2 y H3 claras. Usa listas, tablas y texto en negrita para definiciones clave. Los LLMs aman la estructura.

### 3. El Enfoque "Respuesta Primero"
No entierres lo importante. Comienza tus artículos con respuestas directas a las preguntas centrales. Esto aumenta la probabilidad de ser seleccionado como fragmento destacado.

> **Consejo Pro:** Perplexity cita fuentes que proporcionan resúmenes concisos y factuales *antes* de profundizar en los detalles.

## El Futuro es Híbrido
El SEO no está muerto, pero está evolucionando. Los ganadores de 2025 serán aquellos que puedan posicionar en Google *y* ser la cita principal en ChatGPT.

**[Prueba nuestro Escritor IA para crear contenido optimizado →](/escritor-ia)**
        `,
        category: 'Futuro de la Búsqueda',
        tags: ['GEO', 'SEO', 'Búsqueda IA', 'Marketing 2025'],
        seo_title: 'GEO vs SEO: Guía Definitiva de Optimización para Motores Generativos (2025)',
        seo_description: 'Descubre la Optimización para Motores Generativos (GEO). Aprende a posicionar en buscadores IA como Perplexity, ChatGPT y Gemini.'
    },
    'rank-in-perplexity-claude-strategy': {
        title: 'Cómo Posicionar en Perplexity y Claude: Nueva Estrategia SEO',
        excerpt: 'Las tácticas SEO tradicionales no funcionan en LLMs. Aquí está el manual para que tu marca sea citada en las mejores respuestas de IA.',
        content: `
# Ganando la Guerra de las Citas

Perplexity y Claude se están convirtiendo en los motores de búsqueda predeterminados para usuarios avanzados. A diferencia de Google, no envían tráfico mediante 10 enlaces—sintetizan respuestas. Ser citado es el nuevo puesto #1.

## Lista de Verificación para Ser "Digno de Cita"

1.  **Acuñación Única:** Crea términos o frameworks que *solo* tú definas. Si una IA quiere explicar tu concepto, *debe* citarte.
2.  **Alta Densidad de Información:** El relleno se ignora. Los LLMs tienen ventanas de contexto limitadas al sintetizar. Capturan los hechos.
3.  **Vistas Contrarias:** Los modelos de IA a menudo están entrenados para ser equilibrados. Ofrecer un contrapunto distinto y bien argumentado puede hacer que te citen en la sección "Perspectivas".

## Optimización para Claude
Claude tiene una ventana de contexto grande y "lee" más profundo. El contenido extenso y altamente matizado funciona bien aquí.

## Optimización para Perplexity
Perplexity es un motor de respuestas en tiempo real. Ama los datos frescos, noticias y estadísticas "más recientes". Mantén tu contenido actualizado.

**[Crea contenido optimizado para IA →](/escritor-ia)**
        `,
        category: 'Estrategia de Marketing',
        tags: ['Perplexity', 'Claude', 'Posicionamiento IA', 'Estrategia Digital'],
        seo_title: 'Cómo Posicionar en Perplexity y Claude: Estrategia 2025',
        seo_description: 'Aprende las estrategias específicas para que tu contenido sea citado por Perplexity y Claude. Las nuevas reglas del SEO con IA.'
    },
    'creating-citable-content': {
        title: 'Creando Contenido "Citable": El Secreto de la Autoridad en IA',
        excerpt: '¿Por qué algunos artículos son referenciados por la IA mientras otros son ignorados? El secreto está en la "Citabilidad".',
        content: `
# El Arte de la Citabilidad

En el mundo académico, las citas son la moneda del éxito. En el mundo de la IA, no es diferente.

## ¿Qué Hace al Contenido Citable?

*   **Afirmaciones Definitivas:** "X es Y." No "X podría ser Y."
*   **Datos Originales:** "Nuestro estudio de 1,000 usuarios mostró..."
*   **Jerarquía Clara:** Encabezados fáciles de procesar.

## El "Efecto Wikipedia"
Escribe como si estuvieras escribiendo para Wikipedia. Neutral, factual y denso. Este estilo favorece los datos de entrenamiento de la mayoría de los LLMs.

**[Genera contenido con estructura profesional →](/escritor-ia)**
        `,
        category: 'Estrategia de Contenido',
        tags: ['Marketing de Contenidos', 'Autoridad', 'Branding'],
        seo_title: 'Cómo Crear Contenido Citable para Autoridad en IA',
        seo_description: 'Aumenta tu autoridad de dominio creando contenido que los motores de IA aman citar. La guía para contenido citable.'
    },
    'semantic-seo-vs-keywords-2025': {
        title: 'Búsqueda Semántica vs Palabras Clave: Escribiendo para Máquinas que Piensan',
        excerpt: 'Las palabras clave están muriendo. La Intención es el Rey. Entiende cómo la búsqueda semántica cambia todo sobre la escritura de contenido.',
        content: `
# Más Allá de la Palabra Clave

SEO Antiguo: "Mejor cafetería Madrid"
SEO/GEO Nuevo: "¿Dónde puedo encontrar un lugar tranquilo para trabajar con buen espresso en el centro de Madrid?"

La segunda consulta requiere *comprensión semántica*.

## Búsqueda Vectorial Explicada
Los motores de búsqueda modernos convierten tu texto en "vectores" (representaciones matemáticas del significado). Si tu artículo es sobre "java" (café) pero usa palabras como "computadora", "código", "compilar", el vector se aleja del café.

## Escribiendo para Semántica
*   **Clusters de Temas:** Cubre un tema exhaustivamente.
*   **Palabras Clave LSI (Naturales):** Usa sinónimos y conceptos relacionados naturalmente.
*   **Contexto:** Proporciona contexto. No solo listes hechos; explica *por qué* y *cómo*.

**[Escribe con inteligencia semántica →](/escritor-ia)**
        `,
        category: 'SEO Técnico',
        tags: ['Búsqueda Semántica', 'Búsqueda Vectorial', 'SEO', 'Palabras Clave'],
        seo_title: 'SEO Semántico vs Palabras Clave: Escribiendo para el Futuro de la Búsqueda',
        seo_description: 'Entiende la búsqueda vectorial y el análisis semántico. Alinea tu contenido con la intención del usuario, no solo con palabras clave.'
    },
    'death-of-10-blue-links': {
        title: 'La Muerte de los 10 Enlaces Azules: Preparándose para Búsqueda 3.0',
        excerpt: 'El tráfico de Google está cayendo. Las búsquedas sin clic están aumentando. Así es cómo sobrevivir a la era de Búsqueda 3.0.',
        content: `
# El Apocalipsis del Cero-Clic

Gartner predice que el volumen de búsqueda en motores tradicionales caerá un 25% para 2026. ¿Por qué? Porque la IA responde las consultas de los usuarios directamente en la página de resultados.

## Estrategia de Supervivencia

1.  **Posee Tu Audiencia:** Construye una lista de email. Mueve usuarios de "tierra alquilada" (Búsqueda) a "tierra propia" (Newsletter/App).
2.  **Marca como Búsqueda:** Haz que los usuarios busquen *específicamente* tu marca ("consejos IA Red Creativa Pro") en lugar de términos genéricos.
3.  **Video y Audio:** La IA aún está poniéndose al día en indexar video/audio. YouTube y Podcasts son refugios seguros... por ahora.

**[Crea contenido que construya tu marca →](/escritor-ia)**
        `,
        category: 'Tendencias de la Industria',
        tags: ['Búsqueda 3.0', 'Supervivencia Marketing', 'Actualizaciones Google'],
        seo_title: 'Búsqueda 3.0: Sobreviviendo a la Muerte de los 10 Enlaces Azules',
        seo_description: 'El tráfico de Google está disminuyendo. Las búsquedas sin clic están aquí. Aprende la estrategia de supervivencia para el internet post-enlace.'
    },
    'stealth-ai-writing-guide': {
        title: 'Escritura IA Stealth: Cómo Escribir Como un Humano (Éticamente)',
        excerpt: 'La detección de IA está en todas partes. Aprende las técnicas para hacer que tu copy asistido por IA suene natural, auténtico e indetectable.',
        content: `
# El Valle Inquietante del Texto

Todos conocemos la "Voz IA". Es demasiado educada, usa palabras como "tapiz" y "panorama" demasiado, y carece de variación en las oraciones.

## El Framework Stealth

1.  **Explosividad:** Los humanos varían la longitud de sus oraciones. Corta. Larga. Muy corta. Mezcla.
2.  **Perplejidad:** Usa metáforas inesperadas. La IA predice la siguiente palabra más probable. Elige la improbable.
3.  **Opinión y Sesgo:** La IA es neutral. Los humanos tienen opiniones. Toma una postura.

## Stealth Ético
El objetivo no es engañar; es conectar. "Stealth" simplemente significa "eliminar la fricción robótica" para que el lector pueda enfocarse en el mensaje.

**[Humaniza tus textos con nuestro Modo Stealth →](/escritor-ia)**
        `,
        category: 'Escritura IA',
        tags: ['Modo Stealth', 'Humanizar IA', 'Copywriting'],
        seo_title: 'Escritura IA Stealth: Guía Completa para Humanizar Textos',
        seo_description: 'Deja de sonar como un robot. Aprende las técnicas de "Explosividad" y "Perplejidad" para hacer textos IA indetectables.'
    },
    'cyborg-writer-methodology': {
        title: 'El Escritor Cyborg: Fusionando Creatividad Humana con Velocidad IA',
        excerpt: 'No dejes que la IA te reemplace. Poténciate. La guía definitiva del flujo de trabajo híbrido "Cyborg".',
        content: `
# Yo, Cyborg

Los mejores escritores de 2025 no son humanos. Y no son IAs. Son Centauros—humanos montando IA.

## El Flujo de Trabajo

1.  **Ideación (IA 80% / Humano 20%):** Usa IA para generar 50 ideas. El humano elige las mejores 3.
2.  **Borrador (IA 60% / Humano 40%):** La IA crea el esqueleto y borrador inicial.
3.  **Edición (IA 10% / Humano 90%):** Aquí es donde ocurre la magia. El humano inyecta alma, voz y ritmo.
4.  **Pulido (IA 50% / Humano 50%):** La IA revisa gramática y fluidez.

Este flujo de trabajo aumenta la producción 5x manteniendo la calidad.

**[Implementa el flujo Cyborg →](/escritor-ia)**
        `,
        category: 'Productividad',
        tags: ['Escritor Cyborg', 'Flujo de Trabajo', 'Productividad'],
        seo_title: 'El Flujo de Trabajo del Escritor Cyborg: Sinergia Humano + IA',
        seo_description: 'Maximiza tu producción de escritura sin perder tu esencia. La Metodología del Escritor Cyborg explicada.'
    },
    'bypassing-ai-detection-2025': {
        title: 'Evitando la Detección de IA: La Verdad Sobre las Marcas de Agua',
        excerpt: '¿Cómo funcionan los detectores detallados? ¿Se pueden vencer? Una inmersión técnica en marcas de agua y coincidencia de patrones.',
        content: `
# La Carrera Armamentista

OpenAI tiene marcas de agua. Google tiene SynthID. Turnitin está escaneando escuelas.

## Cómo Funciona la Detección
La mayoría de los detectores buscan "probabilidad estadística". Si un texto sigue el camino estadístico exacto que un LLM predeciría, se marca como IA.

## Venciendo a la Máquina
*   **Ediciones Manuales:** Cambiar cada 5ta palabra rompe la cadena estadística.
*   **Temperatura:** Aumentar la temperatura de generación (aleatoriedad) ayuda, pero arriesga la calidad.
*   **Conocimiento Personal:** Incluir hechos *no* presentes en los datos de entrenamiento (ej: algo que pasó hoy) es una señal humana fuerte.

**[Humaniza tu contenido automáticamente →](/escritor-ia)**
        `,
        category: 'Tecnología IA',
        tags: ['Detección IA', 'Marcas de Agua', 'Privacidad'],
        seo_title: 'Cómo Funciona la Detección de IA (y Cómo Evitarla)',
        seo_description: 'Una inmersión profunda en marcas de agua IA, análisis de entropía y cómo escribir contenido que pase los verificadores de IA.'
    },
    'prompt-engineering-to-flow-engineering': {
        title: 'De Ingeniería de Prompts a Ingeniería de Flujos',
        excerpt: 'Los prompts individuales son del 2023. El verdadero poder está en encadenar prompts en flujos complejos. Aprende los básicos de la Ingeniería de Flujos.',
        content: `
# Ingeniería de Flujos

La Ingeniería de Prompts es hacer una pregunta. La Ingeniería de Flujos es diseñar una conversación.

## La Cadena de Pensamiento (CoT)
En lugar de "Escribe un artículo", intenta:
1.  "Crea un esquema de un artículo sobre X."
2.  "Critica este esquema por gaps de SEO."
3.  "Refina el esquema."
4.  "Escribe la Sección 1 basada en el esquema refinado."

Desglosar tareas crea "flujos" que producen resultados exponencialmente mejores que prompts "de un solo tiro".

**[Experimenta con flujos avanzados →](/escritor-ia)**
        `,
        category: 'Ingeniería de Prompts',
        tags: ['Ingeniería de Flujos', 'Prompts Avanzados', 'Agentes'],
        seo_title: 'Ingeniería de Flujos: La Evolución de la Ingeniería de Prompts',
        seo_description: 'Ve más allá de los prompts simples. Aprende Ingeniería de Flujos para construir flujos de trabajo y agentes IA complejos.'
    },
    'fixing-ai-hallucinations': {
        title: 'Corrigiendo Alucinaciones de IA en Copywriting Técnico',
        excerpt: 'La IA miente con confianza. En campos técnicos, esto es fatal. Procedimientos para verificar y fundamentar tus modelos de IA.',
        content: `
# Confía pero Verifica

En campos legales, médicos o de programación, una alucinación de IA no es una peculiaridad—es una responsabilidad.

## RAG (Generación Aumentada por Recuperación)
La mejor manera de corregir alucinaciones es forzar a la IA a mirar un documento confiable *antes* de responder. Esto es RAG.

## El Agente "Crítico"
Siempre ejecuta un segundo pase de IA específicamente instruido para "Actuar como verificador de hechos y validar cada afirmación."

**[Genera contenido verificado →](/escritor-ia)**
        `,
        category: 'Escritura Técnica',
        tags: ['Alucinaciones', 'Verificación de Hechos', 'RAG'],
        seo_title: 'Cómo Corregir Alucinaciones de IA en Copywriting',
        seo_description: 'Prevén que la IA mienta. Estrategias para precisión factual en contenido técnico generado por IA.'
    },
    'scaling-content-agency-playbook': {
        title: 'Escalando Contenido Sin Sacrificar Calidad: El Manual de Agencia',
        excerpt: 'Cómo pasamos de 4 artículos al mes a 400, mientras aumentamos el engagement. La guía de agencia para escalar con IA.',
        content: `
# Alto Volumen, Alto Valor

La trampa del escalado con IA es el "spam". Evítalo.

## El Modelo de Junta Editorial
1.  **Investigador IA:** Recopila datos.
2.  **Redactor IA:** Escribe V1.
3.  **Editor Humano:** Pule V1.
4.  **QA IA:** Verifica optimización SEO.

Esta línea de ensamblaje permite a un equipo pequeño producir volumen masivo.

**[Escala tu producción de contenido →](/escritor-ia)**
        `,
        category: 'Crecimiento de Agencia',
        tags: ['Escalado', 'Agencia', 'Operaciones de Contenido'],
        seo_title: 'Escalando Producción de Contenido: El Manual de Agencia IA',
        seo_description: 'Escala tus esfuerzos de marketing de contenidos 10x usando flujos de trabajo IA sin perder calidad.'
    },
    'roi-of-ai-copywriting-2025': {
        title: 'El ROI del Copywriting con IA: Datos Reales de 2025',
        excerpt: '¿Vale la pena la suscripción? Un desglose de ahorros de costos y aumentos de ingresos por la adopción de IA.',
        content: `
# Los Números No Mienten

Analizamos 50 empresas usando herramientas de escritura IA.
*   **Ahorro de Costos:** 60% de reducción en costos de redacción.
*   **Tiempo al Mercado:** 4x más rápido en lanzamientos de campañas.
*   **Conversión:** Plana (la IA sola no vende mejor, solo vende más rápido).

## El Veredicto
El ROI viene de la *velocidad*. Poder probar 10 landing pages en el tiempo que tomaba escribir 1 es el cambio de juego.

**[Acelera tu producción de contenido →](/escritor-ia)**
        `,
        category: 'Inteligencia de Negocios',
        tags: ['ROI', 'Caso de Negocio', 'Datos de Marketing'],
        seo_title: 'El ROI Real del Copywriting con IA en 2025',
        seo_description: 'Análisis basado en datos del retorno de inversión para herramientas de copywriting con IA.'
    },
    'personalization-at-scale': {
        title: 'Personalización a Escala: Usando IA para Campañas Hiperlocales',
        excerpt: 'Escribe 1,000 versiones de tu landing page, una para cada ciudad de tu mercado. La IA lo hace posible.',
        content: `
# El "Segmento de Uno"

Imagina una landing page que menciona el clima en la ciudad del usuario, su equipo deportivo local y la jerga específica de su industria.

## SEO Programático
Usar IA para generar miles de páginas "Ciudad + Servicio" es poderoso, pero arriesgado. Asegúrate de que cada página ayude al usuario (GEO) y no sea solo relleno de palabras clave.

**[Crea contenido personalizado →](/escritor-ia)**
        `,
        category: 'Growth Hacking',
        tags: ['Personalización', 'SEO Programático', 'SEO Local'],
        seo_title: 'Personalización con IA: Marketing Hiperlocal a Escala',
        seo_description: 'Cómo usar IA para crear miles de landing pages y emails personalizados.'
    },
    'ai-for-email-marketing': {
        title: 'IA para Email Marketing: Escribiendo Asuntos que Abren',
        excerpt: '¿Tasas de apertura bajas? La IA puede probar A/B líneas de asunto antes de que envíes. La guía de copy de email con IA.',
        content: `
# La Batalla del Inbox

Las líneas de asunto son el guardián.

## Usando IA para Testing A/B
Pide a la IA: "Genera 10 líneas de asunto para este email. Predice cuál tendrá la mayor tasa de apertura para una audiencia B2B SaaS."
A menudo, la predicción de la IA correlaciona fuertemente con el rendimiento real.

**[Optimiza tus emails con IA →](/escritor-ia)**
        `,
        category: 'Email Marketing',
        tags: ['Email Marketing', 'Líneas de Asunto', 'Testing A/B'],
        seo_title: 'Email Marketing con IA: Aumentando Tasas de Apertura',
        seo_description: 'Domina el arte de líneas de asunto y copy de email generados por IA para impulsar conversiones.'
    },
    'repurposing-content-ai-workflows': {
        title: 'Reutilizando Contenido 10x Más Rápido con Flujos de Trabajo IA',
        excerpt: 'Convierte un video de YouTube en un post de blog, un hilo de Twitter, 5 posts de LinkedIn y un newsletter usando IA.',
        content: `
# La Cascada de Contenido

Deja de crear contenido nuevo. Empieza a reutilizar.

## El Pipeline
1.  **Entrada:** Transcripción de un video o podcast.
2.  **Proceso:** IA resume puntos clave.
3.  **Salida 1:** Post de Blog (Expansión).
4.  **Salida 2:** Hilo de Twitter (Condensación).
5.  **Salida 3:** Tiles de citas (Extracción).

Esto convierte 1 hora de esfuerzo en 1 semana de contenido.

**[Reutiliza contenido automáticamente →](/escritor-ia)**
        `,
        category: 'Estrategia de Contenido',
        tags: ['Reutilización', 'Operaciones de Contenido', 'Redes Sociales'],
        seo_title: 'Cómo Reutilizar Contenido 10x Más Rápido con IA',
        seo_description: 'Convierte una sola pieza de contenido en una campaña omnicanal usando flujos de trabajo de reutilización con IA.'
    },
    'brand-voice-is-your-moat': {
        title: 'Por Qué la "Voz" es Tu Único Foso en la Era IA',
        excerpt: 'Cuando todos tienen acceso a la misma inteligencia, la personalidad se convierte en el diferenciador. Definiendo tu Voz de Marca.',
        content: `
# El Mar de la Igualdad

Si todos usan ChatGPT 5, todos suenan inteligentes. La inteligencia está mercantilizada. La *personalidad* es escasa.

## Definiendo Tu Foso
Tu voz de marca—sarcástica, académica, compasiva, ruda—es lo que hace que los lectores regresen.

## Afinando la IA
No solo digas "escribe un blog". Sube tu guía de estilo de voz de marca a la ventana de contexto. Forza a la IA a adherirse a tu vocabulario específico y restricciones de tono.

**[Define tu voz con IA →](/escritor-ia)**
        `,
        category: 'Branding',
        tags: ['Voz de Marca', 'Estrategia de Marketing', 'Diferenciación'],
        seo_title: 'Voz de Marca: La Última Defensa Contra la Comoditización IA',
        seo_description: 'Aprende por qué una voz de marca distintiva es crítica en la era de generación de contenido con IA.'
    },
    'predictive-copywriting-intent': {
        title: 'Copywriting Predictivo: Usando IA para Adivinar la Intención del Usuario',
        excerpt: 'No esperes a que el usuario te diga lo que quiere. La IA puede analizar comportamiento para servir el copy correcto antes de que pregunten.',
        content: `
# El Minority Report del Marketing

La IA predictiva analiza miles de puntos de datos para adivinar qué va a hacer un usuario.

## Inyección de Contenido Dinámico
Si un usuario está navegando la página de "Precios" pero entra desde un referidor "Estudiante", la IA puede intercambiar el titular para enfatizar "Accesibilidad". Si vienen de "Enterprise", intercambia a "Seguridad".

**[Crea contenido que anticipe →](/escritor-ia)**
        `,
        category: 'Tecnología Avanzada',
        tags: ['Análisis Predictivo', 'Contenido Dinámico', 'UX'],
        seo_title: 'Copywriting Predictivo: Anticipando Necesidades del Usuario',
        seo_description: 'Usando IA predictiva para servir copy dinámico basado en intención en tiempo real.'
    },
    'multilingual-localization-ai': {
        title: 'Magia Multilingüe: Localizando Contenido con Agentes IA',
        excerpt: 'La traducción es 1:1. La localización es cultural. Cómo los agentes IA están haciendo el alcance global accesible para startups.',
        content: `
# Más Allá de Google Translate

Traducción: "Car" (Coche).
Localización: Saber que en México es "Coche" pero en algunos contextos "Carro", y que el gancho de marketing necesita ser diferente.

## Agentes IA para Localización
Agentes especializados pueden reescribir contenido no solo para idioma, sino para *cultura*. Verifican modismos, tabúes culturales y formatos de moneda local automáticamente.

**[Localiza tu contenido →](/escritor-ia)**
        `,
        category: 'Localización',
        tags: ['Localización', 'Traducción', 'Crecimiento Global'],
        seo_title: 'Localización con IA: Yendo Global con Agentes',
        seo_description: 'Escala tu startup globalmente usando localización potenciada por IA y adaptación cultural.'
    },
    'visual-copywriting-generative-ui': {
        title: 'Copywriting Visual: Integrando Texto con UI Generativa',
        excerpt: 'El futuro no es solo texto. Es texto que construye interfaces. El auge de la UI Generativa.',
        content: `
# Palabras que Construyen Mundos

Con herramientas como Vercel v0 y otras, el "copywriting" se está convirtiendo en "prompting de interfaces".

## El Nuevo Conjunto de Habilidades
Los escritores ahora necesitan entender componentes de UI. No solo estás describiendo un botón; estás describiendo el *estado de interacción* de ese botón. La línea entre diseñador y escritor se está difuminando.

**[Crea contenido para la nueva era →](/escritor-ia)**
        `,
        category: 'Diseño y Tecnología',
        tags: ['UI Generativa', 'Sistemas de Diseño', 'Tecnología Futura'],
        seo_title: 'UI Generativa: Cuando el Copywriting Encuentra el Diseño de Interacción',
        seo_description: 'Explora la intersección de texto generativo e interfaces de usuario dinámicas.'
    },
    'ethics-ai-creative-industries': {
        title: 'La Ética de la IA en las Industrias Creativas',
        excerpt: 'Copyright, desplazamiento y alma. Una mirada seria a las responsabilidades éticas de los creadores de IA.',
        content: `
# El Costo Humano

Mientras automatizamos la creatividad, ¿qué perdemos?

## La Responsabilidad
1.  **Transparencia:** Informa a los usuarios cuando están leyendo IA.
2.  **Uso Justo:** No entrenes con datos con copyright sin permiso (si es posible).
3.  **Humano en el Bucle:** Siempre ten una revisión humana para contenido crítico.

## El Futuro
El uso ético de IA será una señal de marca premium. "100% Verificado por Humanos" manejará el mercado de lujo.

**[Crea contenido con ética →](/escritor-ia)**
        `,
        category: 'Ética',
        tags: ['Ética IA', 'Copyright', 'Filosofía'],
        seo_title: 'Ética de IA en Copywriting y Diseño',
        seo_description: 'Navegando el complejo panorama ético de la adopción de IA en campos creativos.'
    }
};

async function migrateToSpanish() {
    console.log('🌐 Migrating blog posts to Spanish...\n');

    let updatedCount = 0;
    let errorCount = 0;
    let notFoundCount = 0;

    for (const [slug, translation] of Object.entries(translations)) {
        try {
            // Find the article by slug
            const { data: existing, error: findError } = await supabase
                .from('blog_posts')
                .select('id, language')
                .eq('slug', slug)
                .single();

            if (findError || !existing) {
                console.log(`⚠️  Not found: ${slug}`);
                notFoundCount++;
                continue;
            }

            // Update the article
            const { error: updateError } = await supabase
                .from('blog_posts')
                .update({
                    title: translation.title,
                    excerpt: translation.excerpt,
                    content: translation.content,
                    category: translation.category,
                    tags: translation.tags,
                    seo_title: translation.seo_title,
                    seo_description: translation.seo_description,
                    language: 'es'
                })
                .eq('id', existing.id);

            if (updateError) {
                console.error(`❌ Error updating ${slug}:`, updateError.message);
                errorCount++;
            } else {
                console.log(`✅ Updated: ${slug}`);
                updatedCount++;
            }

        } catch (err: any) {
            console.error(`❌ Unexpected error on ${slug}:`, err.message);
            errorCount++;
        }
    }

    console.log('\n--- Migration Summary ---');
    console.log(`✅ Updated: ${updatedCount}`);
    console.log(`⚠️  Not found: ${notFoundCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('Done.');
}

migrateToSpanish();
