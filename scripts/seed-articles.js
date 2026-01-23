const { ConvexHttpClient } = require("convex/browser");
const { api } = require("../convex/_generated/api");
require("dotenv").config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

const keywords = [
    // High Intent
    "escritor ia español", "herramienta ia escribir textos", "generador de contenido ia gratis", "software copywriting ia",
    "escritor de articulos ia automatico", "crear textos con inteligencia artificial", "redactor automatico online gratis",
    "generador textos marketing ia", "herramienta copywriting español", "plataforma escritura ia negocios",
    "automatizar redaccion contenido", "ia para crear posts redes sociales", "mejor ia para escribir en español",
    "aplicacion escribir textos ia", "software generar articulos blog", "herramienta ia email marketing",
    "generador descripciones producto ia", "copywriter virtual inteligencia artificial", "crear landing page copy con ia",
    "asistente escritura ia freelancers", "alternativa jasper español", "alternativa copy ai español",
    "writesonic en español alternativa", "rytr alternativa gratis", "mejor generador contenido seo ia",

    // Informational / Prompts
    "mejores prompts chatgpt escritura", "prompts ia marketing digital", "prompts copywriting español",
    "ejemplos prompts ia contenido", "como usar chatgpt para marketing", "prompts crear articulos blog ia",
    "prompts email marketing ia", "prompts redes sociales chatgpt", "prompts para tesis ia",
    "prompts landing page ia", "meta prompting ejemplos español", "prompts descripcion productos ecommerce",
    "prompts anuncios facebook ia", "prompts guiones video youtube", "prompts linkedin posts ia",
    "como escribir mejores prompts chatgpt", "prompts cold outreach emails", "prompts seo contenido blog",
    "prompts instagram captions ia", "prompts newsletter ia", "prompts redaccion persuasiva",
    "plantillas prompts ia marketing", "guia completa prompts chatgpt", "prompts creativos escritura ia",
    "prompts mejorar textos ventas",

    // Email Marketing
    "automatizacion email marketing ia", "plantillas correos electronicos ia", "generador emails marketing automatico",
    "escribir correos con ia", "email onboarding plantillas ia", "correos carrito abandonado ia",
    "secuencias email automaticas ia", "cold email ia generador", "asuntos email ia alta conversion",
    "email copywriting ia español", "automatizar respuestas email ia", "plantillas newsletter ia",
    "mejorar tasa apertura emails ia", "emails personalizados ia escala", "escribir emails ventas ia",
    "drip campaign ia automatizado", "emails bienvenida ia ecommerce", "seguimiento clientes email ia",
    "emails reactivacion clientes ia", "campañas email ia automatizadas",

    // E-commerce
    "descripciones producto ia ecommerce", "copy tienda online ia", "textos anuncios google ia",
    "copywriting amazon ia", "fichas producto ia seo", "contenido tienda shopify ia", "seo ecommerce ia español",
    "ia para agencias marketing", "herramientas ia freelancers copywriting", "escritor ia abogados legal",
    "escritor ia sector salud", "ia contenido inmobiliario", "ia redaccion academica",
    "escritor ia restaurantes hospitalidad", "ia para coaches consultores",

    // Technical SEO
    "seo ia español herramientas", "optimizar contenido seo ia", "core web vitals optimizar",
    "cumulative layout shift que es", "geo seo optimizacion ia", "schema markup automatico ia",
    "contenido ia para chatgpt busqueda", "optimizacion ia buscadores", "seo semantico ia español",
    "interlinking automatico ia blog", "ia mejorar posicionamiento google", "contenido optimizado perplexity ai",
    "rankear en chatgpt ia", "citation building ia", "eeat contenido ia"
];

function generateSlug(text) {
    return text
        .toString()
        .toLowerCase()
        .normalize("NFD") // Split accented characters
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");
}

function generateContent(keyword) {
    // Simple plantilla content
    const title = keyword.charAt(0).toUpperCase() + keyword.slice(1);
    return `
    <article>
      <h1>${title}: La Guía Definitiva 2025</h1>
      <p>Bienvenido a la guía más completa sobre <strong>${keyword}</strong>. En este artículo, exploraremos cómo la inteligencia artificial está revolucionando este campo.</p>
      
      <h2>¿Qué es ${keyword}?</h2>
      <p>Entender <strong>${keyword}</strong> es fundamental para cualquier profesional del marketing o dueño de negocio hoy en día. La tecnología avanza rápido y...</p>
      
      <h2>Beneficios de usar IA para ${keyword}</h2>
      <ul>
        <li>Ahorro de tiempo: Automatiza tareas repetitivas.</li>
        <li>Mejor calidad: Reduce errores humanos.</li>
        <li>Creatividad ilimitada: Genera ideas nuevas constantemente.</li>
      </ul>

      <h2>Mejores Prácticas</h2>
      <p>Para dominar <strong>${keyword}</strong>, necesitas seguir una estrategia clara...</p>

      <h2>Conclusión</h2>
      <p>Implementar soluciones relacionadas con <strong>${keyword}</strong> te pondrá por delante de la competencia.</p>
    </article>
  `;
}

async function seed() {
    console.log("🌱 Starting seed...");

    for (const keyword of keywords) {
        const slug = generateSlug(keyword);
        console.log(`Processing: ${keyword} -> ${slug}`);

        try {
            await client.mutation(api.articles.create, {
                title: keyword.charAt(0).toUpperCase() + keyword.slice(1),
                slug: slug,
                content: generateContent(keyword),
                category: "Blog",
                publishedAt: new Date().toISOString(),
                isPublished: true,
                keywords: [keyword, "ia", "marketing"],
                metaTitle: `${keyword} - Guía Completa IA 2025 | Red Creativa`,
                metaDescription: `Descubre todo sobre ${keyword}. Aprende a utilizar la inteligencia artificial para mejorar tus resultados. Guía actualizada 2025.`
            });
            console.log(`✅ Created: ${slug}`);
        } catch (error) {
            console.error(`❌ Error creating ${slug}:`, error);
        }
    }

    console.log("✨ Seed completed!");
}

seed();
