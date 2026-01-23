/**
 * Script de Generación de Pack de Contenido
 * 
 * Crea 5 artículos de alta calidad adicionales para poblar el blog.
 * Ejecutar: node scripts/seed-content-pack.js
 */

const { Client, Databases } = require('node-appwrite');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'main-db';
const COLLECTION_ID = process.env.APPWRITE_BLOG_COLLECTION_ID || 'blog_posts';

const articles = [
    {
        slug: 'periodismo-ia-etica-limites',
        title: 'Periodismo e IA: ¿Dónde trazamos la línea ética en 2025?',
        excerpt: 'Un análisis profundo sobre el uso responsable de herramientas generativas en redacciones modernas. Transparencia, fact-checking y el nuevo rol del editor humano ante la avalancha de contenido sintético.',
        content: `
<h2>La Crisis de Confianza y la Oportunidad de la IA</h2>
<p>En un mundo inundado de "deepfakes", alucinaciones algorítmicas y noticias sintéticas generadas en granjas de contenido, la credibilidad se ha convertido en la moneda más valiosa del mercado periodístico. Paradójicamente, la Inteligencia Artificial puede ser la herramienta que salve al periodismo de investigación de su extinción económica, liberando a los reporteros de tareas mecánicas y repetitivas para enfocarse en lo estrictamente humano: la empatía, el contexto y la verdad sobre el terreno.</p>
<p>La pregunta ya no es si debemos usar IA en la redacción, sino cómo hacerlo sin vender nuestra alma deontológica. Las audiencias no rechazan la tecnología; rechazan el engaño.</p>

<h3>El Nuevo Código Deontológico para Redacciones Híbridas</h3>
<p>Las organizaciones de noticias líderes como The New York Times, The Guardian y Associated Press ya han establecido directrices claras que probablemente se convertirán en el estándar de la industria:</p>
<ul>
    <li><strong>La IA asiste, no firma:</strong> Usamos LLMs para procesar grandes volúmenes de datos, transcribir entrevistas, sugerir titulares y resumir informes técnicos, pero nunca para redactar la historia final sin una supervisión humana exhaustiva.</li>
    <li><strong>Transparencia Radical:</strong> Si una imagen, gráfico o segmento de texto ha sido generado sintéticamente, el lector debe saberlo. Las etiquetas de "IA Assist" serán tan comunes como las de "Opinión" o "Publicidad".</li>
    <li><strong>Responsabilidad Final:</strong> No importa si el error lo cometió el algoritmo; la responsabilidad editorial recae 100% en el editor humano que pulsó "publicar".</li>
</ul>

<h3>Peligros Reales: Alucinaciones, Sesgos y la Cámara de Eco</h3>
<p>Un modelo de lenguaje no "sabe" cosas; predice palabras basándose en probabilidades estadísticas. Entender esta distinción técnica es vital para cualquier periodista moderno. Cuando le pides a ChatGPT que te resuma un evento histórico, no está consultando una enciclopedia; está generando una secuencia de texto que <em>parece</em> plausible.</p>
<p>Esto introduce el peligro de las "alucinaciones" persuasivas: mentiras que suenan totalmente creíbles. El periodista del 2025 debe actuar como un verificador implacable, un fiscal que interroga a la máquina y contrasta cada dato con fuentes primarias.</p>

<h2>Herramientas de Verificación: Usando IA para fiscalizar a la IA</h2>
<p>Irónicamente, la mejor defensa contra la desinformación masiva es la propia IA. Herramientas de detección de manipulación de imágenes, análisis forense de audio y verificación de hechos automatizada contra bases de datos fiables son ahora parte del stack tecnológico indispensable de cualquier sala de prensa.</p>
<p>El futuro del periodismo no es "Humano vs Máquina", sino "Humano Aumentado por Máquina" sirviendo a una audiencia que valora, más que nunca, la curación experta y la verdad verificada.</p>
        `,
        category: 'Periodismo',
        readTime: '8 min',
        premiumData: {
            promptsSection: [
                {
                    title: "El Verificador de Datos",
                    prompt: "Actúa como un fact-checker senior de una agencia de noticias internacional. Analiza el siguiente texto y resalta cualquier afirmación estadística, fecha, nombre propio o cita que necesite verificación externa. Clasifica el riesgo de inexactitud de 1 a 5 para cada afirmación y sugiere la fuente primaria ideal para contrastar.",
                    description: "Prompt de seguridad obligatorio antes de publicar cualquier contenido generado o asistido."
                }
            ],
            process: [
                { title: "Recopilación", description: "Uso de IA para escanear y resumir miles de documentos públicos y filtraciones.", icon: "Database" },
                { title: "Verificación", description: "Cruce de datos generados con fuentes primarias humanas y bases de datos oficiales.", icon: "ShieldCheck" },
                { title: "Narrativa", description: "Escritura final con voz editorial propia, inyectando matices culturales que la IA desconoce.", icon: "PenTool" }
            ]
        }
    },
    {
        slug: 'titulares-virales-gpt4',
        title: 'Cómo escribir titulares que nadie pueda ignorar usando GPT-4',
        excerpt: 'Olvida el clickbait barato de 2015. Aprende la ciencia detrás de los "ganchos" virales modernos y cómo entrenar a la IA para replicar los patrones de éxito de los medios digitales más leídos del mundo.',
        content: `
<h2>La Psicología del Click en la Era de la Atención Fragmentada</h2>
<p>Un buen titular hoy en día tiene que hacer un trabajo titánico: detener el scroll infinito de un usuario saturado de dopamina. Ya no basta con prometer; tienes que intrigar, desafiar o validar una creencia en menos de 3 segundos.</p>
<p>La Inteligencia Artificial es excepcionalmente buena detectando patrones en grandes conjuntos de datos. Si alimentas a un LLM con los 1000 titulares más virales del último año, empezará a entender la estructura subyacente de la viralidad mejor que cualquier editor humano intuitivo.</p>

<h3>Ingeniería de Prompts para Titulares de Alto Impacto</h3>
<p>El error de novato es pedir: "Dame 10 títulos para este post". El resultado será soso y genérico. Para obtener oro, necesitas pedir especificidad estructural.</p>
<p>Prueba con: "Dame 10 títulos usando la técnica de 'Vacío de Curiosidad' de Upworthy, 10 usando la técnica de 'Beneficio Directo y Específico' de los direct response copywriters, y 5 usando la técnica de 'Negatividad/Miedo' (sin ser amarillista)".</p>

<h2>Anatomía de un Título Perfecto: Lo que dicen los datos</h2>
<p>Analizando millones de interacciones, vemos patrones claros que la IA puede replicar:</p>
<ul>
    <li><strong>Números específicos y raros:</strong> "7 estrategias" funciona, pero "13.5% de incremento" o "22 tácticas olvidadas" funciona mejor. La especificidad denota verdad.</li>
    <li><strong>Adjetivos de alto voltaje:</strong> Palabras como "Esenciales", "Definitivos", "Peligrosos", "Contra-intuitivos" activan regiones emocionales del cerebro.</li>
    <li><strong>Promesa clara de transformación:</strong> El lector debe saber exactamente qué superpoder obtendrá al terminar de leer.</li>
    <li><strong>El elemento "Sin":</strong> Promete el beneficio eliminando la objeción principal. "Cómo perder peso (sin dejar de comer pizza)".</li>
</ul>

<h3>El Test A/B Infinito</h3>
<p>Antes, probabas 2 titulares. Ahora puedes pedirle a la IA que genere 50, seleccionar los 5 mejores, y usar herramientas de predicción de CTR (o campañas reales de bajo coste) para elegir el ganador científico.</p>
<p>Recuerda: El titular es el 80% del éxito de tu contenido. Si nadie hace clic, no importa lo genial que sea tu artículo. Usa la IA para asegurar esa puerta de entrada.</p>
        `,
        category: 'Marketing',
        readTime: '6 min',
        premiumData: {
            promptsSection: [
                {
                    title: "Matriz de Variaciones Virales",
                    prompt: "Genera 5 variantes de titular para este artículo siguiendo estos frameworks probados: 1) El Misterio ('Lo que nadie te cuenta sobre...'), 2) La Negación ('Por qué estás haciendo X mal'), 3) El How-to Específico ('Cómo conseguir X en Y tiempo sin Z'), 4) La Lista Curada ('X herramientas para Y'), 5) La Pregunta Directa ('¿Estás cometiendo este error?').",
                    description: "Cubre todos los ángulos psicológicos para maximizar el CTR."
                }
            ]
        }
    },
    {
        slug: 'seo-semantico-2025',
        title: 'SEO Semántico: Dominando las Entidades con IA más allá de las Keywords',
        excerpt: 'Las palabras clave murieron hace años. Google ahora piensa en conceptos, relaciones y entidades. Descubre cómo usar la IA para estructurar tu contenido de forma que los algoritmos entiendan tu autoridad temática.',
        content: `
<h2>Del Keyword Stuffing al Topic Cluster: La Evolución Necesaria</h2>
<p>Durante años, el SEO consistió en repetir "zapatillas baratas" tantas veces como fuera posible. Hoy, eso es una sentencia de muerte. Google ha evolucionado hacia un motor de comprensión semántica. Quiere saber que eres una autoridad en "Calzado Deportivo", y para eso espera ver un ecosistema de contenido interconectado que cubra todos los ángulos posibles.</p>

<h3>Cómo ayuda la IA a construir Autoridad Temática</h3>
<p>Aquí es donde los LLMs brillan. Pueden actuar como ontólogos expertos. Puedes preguntar: "Si quiero ser la máxima autoridad en 'Café de Especialidad', ¿qué 50 subtemas semánticos, entidades relacionadas y preguntas frecuentes debo cubrir obligatoriamente en mi mapa de contenidos?".</p>
<p>La IA te dará un mapa de sitio virtualmente perfecto en segundos, ahorrándote semanas de investigación de palabras clave manual.</p>

<h2>Estructurando Datos con Schema: El Lenguaje de las Máquinas</h2>
<p>El marcado Schema (JSON-LD) es el lenguaje nativo de los buscadores. Es como entregarle a Google tu contenido en bandeja de plata, perfectamente etiquetado y clasificado. Tradicionalmente, esto requería conocimientos técnicos de programación.</p>

<h3>Automatización del Marcado Técnico</h3>
<p>Hoy, puedes pasarle tu artículo a la IA y decirle: "Genera el código JSON-LD para un artículo de tipo 'TechArticle', incluyendo FAQ, valoración de autor y ruta de navegación". Copias, pegas y validas.</p>
<p>Esto te permite ganar fragmentos destacados (Rich Snippets) con un esfuerzo mínimo, ocupando más espacio visual en las SERPs y aumentando drásticamente tu CTR orgánico.</p>

<h2>La Importancia de la Ventana de Contexto</h2>
<p>Para hacer SEO semántico real con IA, necesitas modelos con ventanas de contexto grandes (como Claude 3 u GPT-4 Turbo). Esto te permite alimentar al modelo con tus 10 mejores artículos anteriores y decirle: "Escribe el siguiente artículo detectando los huecos temáticos que no he cubierto aún". Eso es estrategia pura.</p>
        `,
        category: 'SEO',
        readTime: '10 min',
        premiumData: {
            resourcesSection: [
                { title: "Guía Oficial de Schema.org", url: "https://schema.org", description: "La documentación definitiva para estructurar datos." },
                { title: "Validador de Resultados Ricos", url: "https://search.google.com/test/rich-results", description: "Herramienta oficial de Google para probar tu código JSON-LD." }
            ]
        }
    },
    {
        slug: 'productividad-autores-ia',
        title: 'De 1 a 10 Posts semanales: Workflow de Productividad Extrema para Creadores Solitarios',
        excerpt: 'Caso de estudio real: Cómo pasé de sufrir para escribir un post a gestionar un calendario editorial de 50 piezas mensuales sin quemarme, sin equipo y manteniendo la calidad alta.',
        content: `
<h2>El Cuello de Botella Eres Tú (y eso es bueno)</h2>
<p>Si intentas escribir cada palabra, investigar cada dato y editar cada frase tú mismo, tienes un techo de cristal muy bajo. Tu rol debe evolucionar de "artesano redactor" a "editor jefe ejecutivo". La IA es tu equipo de 20 redactores junior incansables.</p>
<p>Tu trabajo ya no es poner ladrillos; es diseñar los planos y verificar que la pared esté recta. Esta transición mental es lo más difícil para los escritores puristas, pero es la clave de la escala.</p>

<h3>El Sistema de Bloques Modulares</h3>
<p>No intentes escribir un artículo de principio a fin linealmente. Es ineficiente. Rompe el proceso en fases estancas y usa la herramienta adecuada para cada una:</p>
<ul>
    <li><strong>Fase 1: Ideación Masiva.</strong> Usa la IA para generar 50 ideas basadas en tendencias actuales. Selecciona 10.</li>
    <li><strong>Fase 2: Esquematización (Outlining).</strong> Pide a la IA que genere la estructura lógica (H2, H3) de los 10 artículos. Revisa y corrige el flujo lógico.</li>
    <li><strong>Fase 3: El "Vómito" de Primer Borrador.</strong> Dicta tus ideas por voz o pide a la IA que desarrolle los puntos del esquema. No edites nada aún.</li>
    <li><strong>Fase 4: Edición Quirúrgica.</strong> Aquí entra tu talento humano. Pule el estilo, añade humor, corta la grasa.</li>
</ul>

<h2>Automatización con n8n y Zapier: La Fábrica de Contenido</h2>
<p>El siguiente nivel es la automatización "No-Code". Imagina este flujo:</p>
<ol>
    <li>Guardas una noticia interesante en un canal de Slack o Telegram.</li>
    <li>Zapier envía esa noticia a OpenAI con un prompt de sistema.</li>
    <li>OpenAI redacta un resumen, 3 ideas de tweets y un posible post de LinkedIn.</li>
    <li>El resultado aparece automáticamente en tu Notion "Borradores", listo para tu revisión matutina.</li>
</ol>
<p>Esto no es ciencia ficción; es cómo operan los creadores de contenido más prolíficos hoy en día. Elimina la fricción de la página en blanco y te pone en modo "corrección", que es cognitivamente mucho más barato que el modo "creación".</p>
        `,
        category: 'Productividad',
        readTime: '7 min',
        premiumData: {
            process: [
                { title: "Captura sin Fricción", description: "Guardar ideas en Notion/Slack en cuanto aparecen, sin juzgarlas.", icon: "Save" },
                { title: "Expansión Asistida", description: "IA genera esquema detallado de puntos clave para evitar el bloqueo.", icon: "Maximize" },
                { title: "Producción en Batch", description: "Dedicar un día solo a editar borradores generados, no a escribir desde cero.", icon: "Mic" }
            ]
        }
    },
    {
        slug: 'futuro-redaccion-humana',
        title: 'El Futuro de la Redacción Humana es... Más Humano',
        excerpt: 'En un mar de contenido sintético perfecto y aburrido, la imperfección, la vulnerabilidad y la experiencia personal subjetiva son los nuevos diferenciadores premium por los que la gente pagará.',
        content: `
<h2>La Paradoja de la Perfección Sintética</h2>
<p>La IA escribe textos gramaticalmente impecables, lógicamente estructurados y con un vocabulario vasto. Y precisamente por eso, a menudo se sienten estériles. Le falta el "grano", la textura de la voz humana real, con sus dudas, sus giros idiomáticos locales y sus saltos lógicos emocionales.</p>
<p>Cuando todo el mundo puede generar contenido de nivel "B+" instantáneamente, el contenido "B+" pierde todo su valor. El mercado se bifurca: contenido utilitario masivo (noticias del tiempo, resúmenes financieros) dominado por IA, y contenido de conexión profunda (ensayos, opiniones, humor) dominado por humanos.</p>

<h3>La Marca Personal como Foso Defensivo</h3>
<p>Nadie puede copiar tu historia de vida. ChatGPT no tuvo tu infancia, ChatGPT no fracasó en tu primer negocio, ChatGPT no sintió la vergüenza de equivocarse en público. Esas experiencias son tus activos más valiosos.</p>
<p>Inyecta tus vivencias en cada pieza de contenido. "Cómo se hace X" es una commodity. "Cómo aprendí yo a hacer X y qué me costó" es una historia única. El futuro pertenece a los narradores que se atreven a ser vulnerables.</p>

<h2>La "Prueba de Turing" Inversa</h2>
<p>Irónicamente, pronto tendremos que demostrar que somos humanos cometiendo "errores" deliberados, usando jerga muy específica o expresando opiniones políticamente incorrectas o matizadas que los modelos de IA están entrenados para evitar por seguridad.</p>
<h3>Conclusión: Abraza tu Humanidad</h3>
<p>No intentes competir con la máquina en velocidad, volumen o precisión enciclopédica. Perderás. Compite en profundidad, en intuición, en provocación y en conexión emocional. Usa la IA para quitarte el trabajo pesado, para que tengas más energía para poner el corazón.</p>
        `,
        category: 'Opinión',
        readTime: '5 min',
        premiumData: null
    }
];

async function seedPack() {
    console.log('🚀 Sembrando Pack de Contenido Premium...');

    for (const article of articles) {
        try {
            const data = {
                ...article,
                premiumData: article.premiumData ? JSON.stringify(article.premiumData) : null,
                publishedAt: new Date().toISOString(),
                views: Math.floor(Math.random() * 5000) + 500,
                likes: Math.floor(Math.random() * 500) + 50,
                featured: Math.random() > 0.8,
                trending: Math.random() > 0.7,
                author: 'Red Creativa Team'
            };

            // Check update or create
            try {
                await databases.getDocument(DATABASE_ID, COLLECTION_ID, article.slug);
                console.log(`🔄 Actualizando: ${article.title}`);
                await databases.updateDocument(DATABASE_ID, COLLECTION_ID, article.slug, data);
            } catch (e) {
                if (e.code === 404) {
                    console.log(`➕ Creando: ${article.title}`);
                    await databases.createDocument(DATABASE_ID, COLLECTION_ID, article.slug, data);
                } else {
                    console.error(`❌ Error con ${article.title}:`, e.message);
                }
            }
        } catch (err) {
            console.error(err);
        }
    }
    console.log('✅ Pack sembrado con éxito.');
}

seedPack();
