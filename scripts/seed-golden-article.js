/**
 * Script de Inyección: Artículo Golden Standard
 * 
 * Crea un artículo de demostración de ALTA CALIDAD con todos los campos llenos.
 * Sirve como referencia de diseño y estructura.
 * 
 * Ejecutar: node scripts/seed-golden-article.js
 */

const { Client, Databases } = require('node-appwrite');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Configuration
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'main-db';
const COLLECTION_ID = process.env.APPWRITE_BLOG_COLLECTION_ID || 'blog_posts';

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);

const goldenArticle = {
    slug: 'guia-definitiva-copywriting-ia-2025',
    title: 'La Guía Definitiva de Copywriting con IA para 2025: Estrategias que Convierten',
    excerpt: 'Descubre cómo fusionar la creatividad humana con la velocidad de la IA para triplicar tu producción de contenidos sin perder calidad. Incluye prompts probados y workflows paso a paso.',
    content: `
<h2>El Fin del "Bloqueo del Escritor" tal como lo conocemos</h2>
<p>La inteligencia artificial no ha venido a reemplazar a los copywriters, sino a darles superpoderes. En 2025, la diferencia entre un redactor promedio y uno de élite no es su vocabulario, sino su capacidad para orquestar herramientas de IA. Mientras los redactores tradicionales luchan por sacar 1.000 palabras al día, los "AI-Writers" están produciendo estrategias completas de contenido, landing pages y secuencias de email en una fracción del tiempo, permitiéndoles centrarse en lo que realmente importa: la estrategia, la empatía y la conexión humana.</p>

<p>Imagina tener a tu disposición un equipo de investigación incansable, un editor gramatical perfecto y un generador de ideas infinitas. Eso es lo que ofrece la IA hoy en día. No se trata de pulsar un botón y listo; se trata de dirigir una orquesta sinfónica de algoritmos para crear una pieza maestra que resone con tu audiencia.</p>

<h3>¿Por qué la mayoría falla al usar IA?</h3>
<p>El error número uno es tratar a la IA como un oráculo mágico. Le piden "escríbeme un artículo sobre zapatos" y obtienen texto genérico, aburrido y lleno de alucinaciones. El secreto está en el contexto, la iteración y, sobre todo, en la <strong>ingeniería de prompts</strong>.</p>
<p>Un buen prompt no es una orden; es una conversación. Debes establecer el rol, el tono, el formato, las restricciones y el objetivo. Sin estos parámetros, la IA revertirá al promedio estadístico de internet: mediocre.</p>

<h3>La Fórmula H.I.H (Humano-IA-Humano)</h3>
<p>Para obtener resultados que enganchen y conviertan, debes seguir este flujo de trabajo circular:</p>
<ul>
    <li><strong>Humano (Estrategia):</strong> Define el ángulo, la voz, el avatar del cliente y el objetivo emocional. ¿Qué quieres que sienta el lector? ¿Qué acción debe tomar?</li>
    <li><strong>IA (Expansión & Borrador):</strong> Genera borradores, variaciones de títulos, estructuras de argumentos y contraargumentos. Usa la IA para romper el folio en blanco y explorar laterales creativos que no se te hubieran ocurrido.</li>
    <li><strong>Humano (Pulido & Verdad):</strong> Edita despiadadamente. Añade anécdotas personales, verifica datos, inyecta humor y sarcasmo (algo que la IA aún no domina). Asegúrate de que el texto tenga "alma".</li>
</ul>

<h2>Herramientas Esenciales para 2025</h2>
<p>Más allá de ChatGPT, el ecosistema ha explotado y especializado. Conocer la herramienta adecuada para cada tarea es vital:</p>
<ul>
    <li><strong>Claude 3.5 Opus:</strong> Indiscutible para razonamiento complejo, matices lingüísticos y escritura larga que no suena robótica.</li>
    <li><strong>Jasper & Copy.ai:</strong> Excelentes para mantener la voz de marca consistente a través de diferentes canales y formatos.</li>
    <li><strong>Perplexity:</strong> El rey de la investigación en tiempo real. Cita fuentes, verifica hechos y te da la base sólida que necesitas.</li>
    <li><strong>Midjourney v7:</strong> Para el apoyo visual. Un buen copy necesita entrar por los ojos.</li>
</ul>

<h3>Ética y Originalidad en la Era Sintética</h3>
<p>Google ya no penaliza el contenido por ser generado por IA, sino por ser de <em>baja calidad</em>. La actualización "Helpful Content" fue clara: si ayudas al usuario, no importa quién (o qué) lo escribió. Sin embargo, la transparencia es clave.</p>
<p>La originalidad hoy no significa inventar la rueda, sino curar y sintetizar la información de manera única. Tu perspectiva, tus experiencias vividas y tu juicio crítico son insustituibles. La IA es el pincel; tú eres el artista.</p>

<h2>Estrategias Avanzadas de Copywriting</h2>
<p>Vamos a profundizar en técnicas específicas que puedes aplicar hoy mismo:</p>

<h4>1. La Técnica del "Abogado del Diablo"</h4>
<p>Pide a la IA que critique tu propio producto o argumento. "Actúa como un cliente escéptico y encuentra 5 agujeros en mi oferta". Esto te permitirá blindar tu copy contra objeciones antes de que surjan.</p>

<h4>2. Variaciones de Tonalidad</h4>
<p>No te conformes con el primer tono. Pide: "Reescribe este párrafo con un tono sarcástico", "ahora con un tono empático", "ahora con autoridad académica". Elige la versión que mejor resuene o mezcla lo mejor de cada una.</p>

<h4>3. Micro-Copy de Conversión</h4>
<p>Usa la IA para generar 50 variaciones de tu CTA (Call to Action). A veces, cambiar "Suscríbete" por "Únete a la élite" puede aumentar la conversión un 20%. La IA es perfecta para este volumen de pruebas A/B.</p>

<p>En conclusión, 2025 es el año del redactor aumentado. No temas a la máquina; domínala. Tu carrera no terminará por la IA, pero podría ser superada por alguien que use la IA mejor que tú.</p>
    `,
    category: 'Estrategia de Contenidos',
    author: 'Selamu',
    readTime: '12 min',
    tags: JSON.stringify(['Copywriting', 'Inteligencia Artificial', 'Marketing Digital', 'Productividad']),
    featured: true,
    trending: true,
    views: 1542,
    publishedAt: new Date().toISOString(),
    likes: 342,
    seoTitle: 'Guía Copywriting IA 2025: Estrategias Avanzadas',
    seoDescription: 'Aprende a usar la IA para escribir copy que vende. Guía completa con prompts, estrategias y herramientas para 2025.',

    // CAMPOS PREMIUM CONSOLIDADOS
    premiumData: JSON.stringify({
        process: [
            {
                title: "Investigación Profunda",
                description: "Usa Perplexity o Bing Chat para recopilar datos actuales y estadísticas recientes. No confíes en la memoria de entrenamiento estática del modelo.",
                icon: "Search"
            },
            {
                title: "Ingeniería de Prompts",
                description: "Diseña un prompt estructurado definiendo: Rol, Tarea, Contexto, Restricciones y Formato de Salida.",
                icon: "Terminal"
            },
            {
                title: "Edición Humana",
                description: "Revisa el tono. La IA tiende a ser demasiado formal o exageradamente entusiasta. Inyecta tu personalidad.",
                icon: "PenTool"
            },
            {
                title: "Optimización SEO",
                description: "Usa herramientas como SurferSEO o NeuronWriter para asegurar que cubres las entidades semánticas necesarias.",
                icon: "BarChart"
            }
        ],
        promptsSection: [
            {
                title: "El Generador de Ángulos Únicos",
                prompt: "Actúa como un estratega de marketing senior. Analiza el tema '{TEMA}'. Dame 5 ángulos contra-intuitivos o polémicos para abordar este tema que desafíen la sabiduría convencional.",
                description: "Ideal para destacar en nichos saturados donde todos dicen lo mismo."
            },
            {
                title: "El Crítico Feroz",
                prompt: "Critica este borrador como si fueras un editor jefe de una revista de prestigio. Sé duro. Señala redundancias, clichés y frases pasivas. Propón mejoras concretas.",
                description: "Úsalo para pulir tu primer borrador y elevar la calidad de la escritura."
            }
        ],
        resourcesSection: [
            {
                title: "Plantilla de Prompt Maestro",
                description: "Nuestro framework probado para conseguir resultados consistentes.",
                url: "#",
                type: "PDF"
            },
            {
                title: "Lista de Verificación SEO",
                description: "Asegura que tu contenido rankee antes de publicar.",
                url: "#",
                type: "Notion"
            }
        ],
        faqJsonLd: {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [{
                "@type": "Question",
                "name": "¿Google penaliza el contenido por IA?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No, Google ha aclarado que premia el contenido de alta calidad, independientemente de cómo se produzca. Sin embargo, el contenido generado automáticamente sin revisión humana suele ser de baja calidad."
                }
            }, {
                "@type": "Question",
                "name": "¿Qué herramienta de IA es mejor para escribir?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Depende del caso de uso. Claude 3 Opus es excelente para matices y escritura larga. GPT-4 es versátil. Jasper es genial para equipos de marketing."
                }
            }]
        }
    })
};


async function seedGoldenArticle() {
    console.log('✨ Sembrando Artículo Golden Standard...');

    try {
        // Check if exists first to update instead of error
        try {
            await databases.getDocument(DATABASE_ID, COLLECTION_ID, goldenArticle.slug);
            console.log('🔄 El artículo ya existe. Actualizando...');
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                goldenArticle.slug,
                goldenArticle
            );
        } catch (e) {
            if (e.code === 404) {
                console.log('➕ Creando nuevo artículo...');
                await databases.createDocument(
                    DATABASE_ID,
                    COLLECTION_ID,
                    goldenArticle.slug,
                    goldenArticle
                );
            } else {
                throw e;
            }
        }

        console.log('✅ ¡Éxito! Artículo Golden Standard creado/actualizado.');
        console.log(`🔗 Slug: ${goldenArticle.slug}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

seedGoldenArticle();
