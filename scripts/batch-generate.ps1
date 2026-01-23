$topics = @(
    "Server Actions vs API Routes: Cuándo usar cuál en Next.js 15",
    "Optimización de imágenes en Next.js: `next/image` vs Cloudinary",
    "Reducir Bundle Size en React: Tree Shaking y Code Splitting avanzado",
    "Manejo de estados complejos: Zustand vs Context API benchmarks",
    "React Server Components: Patrones de diseño para evitar 'Client Waterfalls'",
    "Manejo de errores en n8n: Patrón Try/Catch profesional",
    "Webhooks seguros en Make.com: Validación de firmas HMAC",
    "Conectar OpenAI Assistant API con WhatsApp vía n8n",
    "Automatizar facturas: Stripe a Google Sheets y Slack en tiempo real",
    "Extraer datos de PDFs y convertirlos a JSON con IA y Make",
    "Fine-tuning vs RAG: Guía de decisión para arquitectos de software",
    "Function Calling en OpenAI: Cómo conectar GPT-4 a tu base de datos SQL",
    "Embeddings locales con Ollama: Búsqueda semántica privada",
    "Reducir latencia en LLMs: Streaming y caché semántico (Redis)",
    "Costos de API: GPT-4o vs Claude 3.5 Sonnet vs Llama 3 (Análisis real)",
    "Schema Markup para artículos de blog: JSON-LD avanzado para Google",
    "Core Web Vitals 2026: Cómo pasar el INP (Interaction to Next Paint)",
    "Sitemaps dinámicos en Next.js App Router: Guía de implementación",
    "Indexación en tiempo real: Usando la Indexing API de Google programáticamente",
    "SEO para SPAs: Prerenderizado vs SSR vs Dynamic Rendering"
)

foreach ($topic in $topics) {
    Write-Host "🚀 Generando: $topic" -ForegroundColor Green
    npx tsx scripts/turbo-blog.ts "$topic"
    Start-Sleep -Seconds 5
}
