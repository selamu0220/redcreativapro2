import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const OPENROUTER_API_KEY = process.env.OPEN_ROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    tags: string[];
}

export async function POST(request: NextRequest) {
    try {
        const { query } = await request.json();

        if (!query || query.length < 2) {
            return NextResponse.json({ results: [], aiPowered: false });
        }

        // Get all posts for semantic search
        const { data: posts, error } = await supabase
            .from('blog_posts')
            .select('id, slug, title, excerpt, content, category, tags, image, read_time, published_at, language')
            .eq('language', 'es')
            .order('published_at', { ascending: false })
            .limit(200);

        if (error || !posts || posts.length === 0) {
            return NextResponse.json({ results: [], aiPowered: false, error: error?.message });
        }

        // If no OpenRouter key, fallback to simple search
        if (!OPENROUTER_API_KEY) {
            const lowerQuery = query.toLowerCase();
            const simpleResults = posts.filter(p =>
                p.title.toLowerCase().includes(lowerQuery) ||
                p.excerpt?.toLowerCase().includes(lowerQuery) ||
                p.tags?.some((t: string) => t.toLowerCase().includes(lowerQuery))
            ).slice(0, 20);

            return NextResponse.json({ results: simpleResults, aiPowered: false });
        }

        // Create a summary of all posts for the AI
        const postSummaries = posts.map((p, i) =>
            `[${i}] "${p.title}" - ${p.category} - Tags: ${p.tags?.join(', ') || 'ninguno'}`
        ).join('\n');

        // Use AI to find semantically relevant posts
        const systemPrompt = `Eres un asistente de búsqueda de artículos. El usuario busca información y debes identificar los artículos más relevantes.

Aquí está la lista de artículos disponibles:
${postSummaries}

IMPORTANTE: Responde SOLO con los números de los artículos más relevantes (máximo 10), separados por comas. Por ejemplo: "0, 5, 12, 3"
Si ningún artículo es relevante, responde: "NONE"`;

        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://redcreativa.pro',
                'X-Title': 'Red Creativa Pro Blog Search'
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Buscar artículos sobre: "${query}"` }
                ],
                temperature: 0.3,
                max_tokens: 100
            })
        });

        if (!response.ok) {
            // Fallback to simple search
            const lowerQuery = query.toLowerCase();
            const simpleResults = posts.filter(p =>
                p.title.toLowerCase().includes(lowerQuery) ||
                p.excerpt?.toLowerCase().includes(lowerQuery)
            ).slice(0, 20);

            return NextResponse.json({ results: simpleResults, aiPowered: false });
        }

        const aiResponse = await response.json();
        const aiContent = aiResponse.choices?.[0]?.message?.content || '';

        if (aiContent === 'NONE' || !aiContent.trim()) {
            return NextResponse.json({ results: [], aiPowered: true, message: 'No se encontraron artículos relevantes' });
        }

        // Parse the indices from AI response
        const indices = aiContent
            .split(/[,\s]+/)
            .map((s: string) => parseInt(s.trim()))
            .filter((n: number) => !isNaN(n) && n >= 0 && n < posts.length);

        // Get the relevant posts in order
        const aiResults = indices.map((i: number) => posts[i]).filter(Boolean);

        return NextResponse.json({
            results: aiResults,
            aiPowered: true,
            totalSearched: posts.length
        });

    } catch (error) {
        console.error('AI Search error:', error);
        return NextResponse.json({
            results: [],
            aiPowered: false,
            error: 'Error en la búsqueda'
        }, { status: 500 });
    }
}
