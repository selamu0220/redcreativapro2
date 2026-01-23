import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import { generateText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

// Cargar env vars
dotenv.config({ path: '.env.local' });

// ------------------------------------------------------------------
// CONFIGURACIÓN
// ------------------------------------------------------------------

const BLOG_DATA_PATH = path.join(process.cwd(), 'lib', 'blog-data.ts');
const MODEL_ID = 'deepseek/deepseek-chat'; // Modelo económico y potente para lógica compleja

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

// ------------------------------------------------------------------
// DATA: GOLDEN KEYWORDS (Sniper Strategy)
// ------------------------------------------------------------------

const GOLDEN_TOPICS = [
    // Next.js / React Hard Tech
    "Server Actions vs API Routes: Cuándo usar cuál en Next.js 15",
    "Optimización de imágenes en Next.js: `next/image` vs Cloudinary",
    "Reducir Bundle Size en React: Tree Shaking y Code Splitting avanzado",
    "Manejo de estados complejos: Zustand vs Context API benchmarks",
    "React Server Components: Patrones de diseño para evitar 'Client Waterfalls'",

    // Automatización & No-Code (n8n / Make) - High Intent
    "Manejo de errores en n8n: Patrón Try/Catch profesional",
    "Webhooks seguros en Make.com: Validación de firmas HMAC",
    "Conectar OpenAI Assistant API con WhatsApp vía n8n",
    "Automatizar facturas: Stripe a Google Sheets y Slack en tiempo real",
    "Extraer datos de PDFs y convertirlos a JSON con IA y Make",

    // IA & LLMs (Technical)
    "Fine-tuning vs RAG: Guía de decisión para arquitectos de software",
    "Function Calling en OpenAI: Cómo conectar GPT-4 a tu base de datos SQL",
    "Embeddings locales con Ollama: Búsqueda semántica privada",
    "Reducir latencia en LLMs: Streaming y caché semántico (Redis)",
    "Costos de API: GPT-4o vs Claude 3.5 Sonnet vs Llama 3 (Análisis real)",

    // SEO Técnico / GEO
    "Schema Markup para artículos de blog: JSON-LD avanzado para Google",
    "Core Web Vitals 2026: Cómo pasar el INP (Interaction to Next Paint)",
    "Sitemaps dinámicos en Next.js App Router: Guía de implementación",
    "Indexación en tiempo real: Usando la Indexing API de Google programáticamente",
    "SEO para SPAs: Prerenderizado vs SSR vs Dynamic Rendering"
];

// ------------------------------------------------------------------
// 0. EL ESTRATEGA (Selector de Tema Sniper)
// ------------------------------------------------------------------

async function generateSniperTopic() {
    console.log(`🎯 Selección de Objetivo Sniper...`);

    // Seleccionar un tema al azar de la lista "Golden"
    // Esto asegura calidad y relevancia técnica inmediata
    const randomTopic = GOLDEN_TOPICS[Math.floor(Math.random() * GOLDEN_TOPICS.length)];

    console.log(`🔫 Objetivo fijado: "${randomTopic}"`);
    return randomTopic;
}

// ------------------------------------------------------------------
// 1. EL ARQUITECTO TÉCNICO (Estructura de Ingeniería)
// ------------------------------------------------------------------

async function generateOutline(topic: string) {
    console.log(`🏗️  Diseñando arquitectura técnica para: "${topic}"...`);

    const prompt = `
    Rol: Arquitecto de Software Senior y Especialista en Documentación Técnica.
    Tarea: Crear un esquema (outline) extremadamente detallado para un artículo técnico sobre: "${topic}".
    
    AUDIENCIA:
    - Desarrolladores Senior, CTOs, Ingenieros de Datos.
    - Odian el "fluff", las introducciones largas y las explicaciones básicas.
    - Quieren código, configuraciones exactas y soluciones a problemas difíciles.
    
    REQUISITOS OBLIGATORIOS DEL ESQUEMA:
    1. **NO Introducción Genérica:** Empieza directo con el problema técnico o el "End Result".
    2. **Prerrequisitos Técnicos:** Una sección breve de qué se necesita (ej: Node.js v20, cuenta de AWS).
    3. **"The Meat" (El Código):** Al menos 2 secciones deben estar dedicadas a implementación práctica (paso a paso con código).
    4. **Manejo de Errores / Edge Cases:** Una sección sobre "Qué puede salir mal".
    5. **Comparativa Técnica:** Si aplica, una tabla comparativa de rendimiento/costos (no de características subjetivas).
    
    FORMATO JSON STRICTO:
    {
        "title": "H1 Técnico y Directo",
        "slug": "slug-optimizado-seo",
        "excerpt": "Meta description técnica (max 155 chars). Enfócate en la solución.",
        "category": "tecnologia",
        "subcategory": "desarrollo-software | automatizacion | ia-educacion",
        "tags": ["tag1", "tag2", "tag3"],
        "sections": [
            { 
                "heading": "H2 Técnico", 
                "type": "code | text | table | warning", 
                "instruction": "Instrucción detallada para el redactor sobre qué cubrir técnicamente aquí." 
            }
        ]
    }
    `;

    try {
        const { text } = await generateText({
            model: openrouter(MODEL_ID),
            prompt: prompt,
            temperature: 0.3, // Baja temperatura para precisión técnica
        });

        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("❌ Error generando outline:", error);
        throw error;
    }
}

// ------------------------------------------------------------------
// 2. EL INGENIERO SENIOR (Generador de Contenido)
// ------------------------------------------------------------------

async function writeContent(outline: any) {
    console.log(`👨‍💻 Escribiendo contenido técnico (Modo Ingeniero)...`);

    const prompt = `
    Rol: Ingeniero de Software Principal (Principal Staff Engineer) con 15 años de experiencia.
    Misión: Escribir un artículo técnico riguroso basado en el siguiente esquema.
    
    ESQUEMA:
    ${JSON.stringify(outline, null, 2)}
    
    REGLAS DE ESTILO (CRÍTICAS):
    1. **Cero Fluff:** No uses frases como "En el mundo digital de hoy..." o "La IA ha revolucionado...". Borra eso.
    2. **Directo al Código:** Si puedes explicarlo con código, no uses texto.
    3. **Tono:** Pragmático, directo, "Dry". Como la documentación de Stripe o Vercel.
    4. **Formato:**
       - Usa bloques de código con lenguaje especificado (ej: \`\`\`typescript).
       - Usa "Callouts" para advertencias importantes (ej: > [!WARNING]).
       - Usa listas para pasos secuenciales.
    5. **Profundidad:** Explica el "Por qué" de las decisiones técnicas, no solo el "Cómo".
    
    Genera el artículo completo en Markdown ahora.
    `;

    const { text } = await generateText({
        model: openrouter(MODEL_ID),
        prompt: prompt,
        temperature: 0.2, // Muy baja para evitar alucinaciones creativas
    });

    return text;
}

// ------------------------------------------------------------------
// 3. EL EDITOR (Publicación)
// ------------------------------------------------------------------

function saveToCodebase(post: any) {
    console.log(`💾  Guardando en lib/blog-data.ts...`);

    const dataPath = path.join(process.cwd(), 'lib', 'blog-data.ts');
    let currentContent = fs.readFileSync(dataPath, 'utf-8');

    const arrayCloseMarker = '\n];';
    const helperMarker = '// Helper functions';

    let insertIndex = -1;
    const helperIndex = currentContent.indexOf(helperMarker);

    if (helperIndex !== -1) {
        insertIndex = currentContent.lastIndexOf(arrayCloseMarker, helperIndex);
    } else {
        insertIndex = currentContent.lastIndexOf(arrayCloseMarker);
    }

    if (insertIndex === -1) {
        console.error('❌ Error crítico: No se encontró el cierre del array blogPosts.');
        process.exit(1);
    }

    const { slug, title, excerpt, tags, content, category, subcategory } = post;

    // Selección de imagen basada en categoría (Placeholder de alta calidad)
    const imageMap: Record<string, string> = {
        'tecnologia': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1000', // Coding
        'productividad': 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=1000', // Checklist/Productivity
        'ia-educacion': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1000', // Research
        'negocios': 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1000' // Meeting/Business
    };

    const imageUrl = imageMap[category] || imageMap['tecnologia'];

    const newEntry = `
  {
    id: '${slug}',
    title: '${title.replace(/'/g, "\\'")}',
    excerpt: '${excerpt.replace(/'/g, "\\'")}',
    category: '${category}',
    subcategory: '${subcategory || ""}',
    author: 'selamu',
    publishedAt: '${new Date().toISOString().split('T')[0]}',
    readTime: '${Math.max(5, Math.ceil(content.length / 1500 * 5))} min',
    tags: ${JSON.stringify(tags)},
    featured: true,
    views: 0,
    image: '${imageUrl}',
    content: \`${content.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`,
    seoTitle: '${title.replace(/'/g, "\\'")}',
    seoDescription: '${excerpt.replace(/'/g, "\\'")}',
  },`;

    const updatedContent = currentContent.slice(0, insertIndex) + newEntry + currentContent.slice(insertIndex);
    fs.writeFileSync(dataPath, updatedContent);
    console.log(`✅  Publicado: /blog/${post.slug}`);
}

// ------------------------------------------------------------------
// MAIN
// ------------------------------------------------------------------

async function main() {
    console.log(`\n🤖  TURBO BLOG v2: SNIPER MODE INICIADO`);

    if (!process.env.OPENROUTER_API_KEY) {
        console.error("❌ Faltan credenciales (OPENROUTER_API_KEY).");
        process.exit(1);
    }

    // 1. Obtener Tema
    let topic = process.argv[2];

    if (!topic) {
        console.log("🔍  Modo Autónomo: Seleccionando objetivo de alto valor...");
        topic = await generateSniperTopic();
    } else {
        console.log(`🎯  Modo Manual: "${topic}"`);
    }

    try {
        // 2. Generar
        const outline = await generateOutline(topic);
        const content = await writeContent(outline);

        // 3. Guardar
        saveToCodebase({ ...outline, content });

    } catch (error) {
        console.error("💥  Fallo en la ejecución:", error);
        process.exit(1);
    }
}

main();
