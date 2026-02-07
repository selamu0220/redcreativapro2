import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
    apiKey: process.env.OPEN_ROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1'
});

const MIN_CONTENT_LENGTH = 2000;
const TARGET_CONTENT_LENGTH = 5000;

interface BlogPost {
    id: string;
    slug: string;
    title: string;
    content: string;
    excerpt: string;
    category: string;
    tags: string[];
}

async function expandArticle(post: BlogPost): Promise<string> {
    const systemPrompt = `Eres un experto escritor de contenido SEO en español. Tu tarea es expandir artículos de blog para hacerlos más completos, informativos y valiosos para el lector.

REGLAS:
1. Mantén el tono y estilo del artículo original
2. Añade secciones relevantes como: ejemplos prácticos, consejos adicionales, FAQs, comparativas
3. Usa formato Markdown con headers (##, ###)
4. Incluye listas con viñetas donde sea apropiado
5. Añade una sección de "Preguntas Frecuentes" al final
6. El resultado debe tener entre 4000-6000 caracteres
7. NO incluyas metadatos, solo el contenido del artículo
8. Mantén un enfoque práctico y accionable`;

    const userPrompt = `Expande este artículo de blog para hacerlo más completo:

TÍTULO: ${post.title}
CATEGORÍA: ${post.category}
TAGS: ${post.tags?.join(', ') || 'ninguno'}

CONTENIDO ACTUAL (${post.content.length} caracteres):
${post.content}

Por favor, expande este artículo a aproximadamente ${TARGET_CONTENT_LENGTH} caracteres, añadiendo más valor, ejemplos y una sección de FAQs.`;

    try {
        const response = await openai.chat.completions.create({
            model: 'openai/gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 3000
        });

        return response.choices[0]?.message?.content || post.content;
    } catch (error) {
        console.error(`Error expandiendo ${post.slug}:`, error);
        return post.content;
    }
}

async function main() {
    console.log('🔍 Buscando artículos cortos...\n');

    // Get short articles
    const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('id, slug, title, content, excerpt, category, tags')
        .eq('language', 'es')
        .order('created_at', { ascending: false });

    if (error || !posts) {
        console.error('Error obteniendo posts:', error?.message);
        return;
    }

    const shortPosts = posts.filter(p => p.content && p.content.length < MIN_CONTENT_LENGTH);
    console.log(`📊 Total artículos: ${posts.length}`);
    console.log(`📝 Artículos cortos (<${MIN_CONTENT_LENGTH} chars): ${shortPosts.length}\n`);

    if (shortPosts.length === 0) {
        console.log('✅ No hay artículos cortos que expandir!');
        return;
    }

    // Process in batches of 5
    const BATCH_SIZE = 5;
    let processed = 0;
    let expanded = 0;

    for (let i = 0; i < shortPosts.length; i += BATCH_SIZE) {
        const batch = shortPosts.slice(i, i + BATCH_SIZE);
        console.log(`\n📦 Procesando lote ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(shortPosts.length / BATCH_SIZE)}...`);

        for (const post of batch) {
            console.log(`\n⏳ Expandiendo: ${post.title.substring(0, 50)}...`);
            console.log(`   Original: ${post.content.length} chars`);

            const expandedContent = await expandArticle(post);

            if (expandedContent.length > post.content.length) {
                // Update in database
                const { error: updateError } = await supabase
                    .from('blog_posts')
                    .update({ content: expandedContent })
                    .eq('id', post.id);

                if (updateError) {
                    console.log(`   ❌ Error actualizando: ${updateError.message}`);
                } else {
                    console.log(`   ✅ Expandido: ${expandedContent.length} chars (+${expandedContent.length - post.content.length})`);
                    expanded++;
                }
            } else {
                console.log(`   ⚠️ No se pudo expandir (resultado más corto)`);
            }

            processed++;
        }

        // Rate limiting - wait 2 seconds between batches
        if (i + BATCH_SIZE < shortPosts.length) {
            console.log('\n⏱️ Esperando 2 segundos...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    console.log(`\n\n🎉 Proceso completado!`);
    console.log(`📊 Procesados: ${processed}/${shortPosts.length}`);
    console.log(`✅ Expandidos: ${expanded}`);
}

main().catch(console.error);
