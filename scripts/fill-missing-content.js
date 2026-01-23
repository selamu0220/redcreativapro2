
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.OPENROUTER_API_KEY;
const BLOG_PATH = path.join(__dirname, '..', 'lib', 'blog-data.ts');

async function generateContent(title, excerpt) {
    if (!API_KEY) {
        return `## ${title}\n\n${excerpt}\n\n(Contenido generado automáticamente no disponible sin API KEY).`;
    }

    console.log(`Generating content for: "${title}"...`);

    // Improved prompt for better quality
    const prompt = `Actúa como un experto redactor de contenido SEO y Marketing Digital. Escribe un artículo de blog completo en Español (España) para el título: "${title}".
    
    Contexto: "${excerpt}"
    
    Requisitos:
    - Formato Markdown estricto.
    - Tono profesional, autoritario pero accesible.
    - Estructura clara: Introducción, H2s, H3s, Listas, Conclusión.
    - Longitud: 800-1200 palabras.
    - NO incluyas el título H1 al principio.
    - Incluye consejos prácticos y accionables.
    - Optimizado para lectura en web (párrafos cortos).`;

    try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://redcreativa.pro',
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-001',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 8000,
            }),
        });

        if (!res.ok) {
            throw new Error(`API ${res.status}`);
        }

        const data = await res.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error generating content:", error);
        return null;
    }
}

async function main() {
    console.log('📖 Reading blog-data.ts...');
    let content = fs.readFileSync(BLOG_PATH, 'utf-8');

    // Regex to find the placeholder content
    // We search for this pattern to count initial tasks
    const placeholderRegex = /content:\s*['"](El contenido completo está en la página individual[^'"]+)['"]/g;

    // Count matches first
    const matchCount = (content.match(placeholderRegex) || []).length;
    console.log(`Found approximately ${matchCount} articles with placeholders.`);

    let remaining = matchCount;

    while (true) {
        // Re-read file to get fresh content and indices every time
        content = fs.readFileSync(BLOG_PATH, 'utf-8');

        // Find FIRST occurrence
        const freshMatch = /content:\s*['"](El contenido completo está en la página individual[^'"]+)['"]/.exec(content);

        if (!freshMatch) {
            console.log("No more placeholders found.");
            break;
        }

        const fullMatch = freshMatch[0];
        const index = freshMatch.index;

        // Find title for THIS occurrence by looking backwards
        const preceedingText = content.substring(0, index);
        const lastTitleIndex = preceedingText.lastIndexOf("title:");

        if (lastTitleIndex === -1) {
            console.log("Could not find title prefix, skipping...");
            break;
        }

        const titleLine = preceedingText.substring(lastTitleIndex).split('\n')[0];
        const titleValMatch = titleLine.match(/title:\s*['"]([^'"]+)['"]/);

        if (!titleValMatch) {
            console.log("Could not extract title value, skipping...");
            // Replace with error to avoid infinite loop
            content = content.replace(fullMatch, `content: "Error: Title not extracted"`);
            fs.writeFileSync(BLOG_PATH, content);
            continue;
        }

        const title = titleValMatch[1];

        // Find excerpt
        const lastExcerptIndex = preceedingText.lastIndexOf("excerpt:");
        let excerpt = "";
        if (lastExcerptIndex > lastTitleIndex) {
            const excerptLine = preceedingText.substring(lastExcerptIndex).split('\n')[0];
            const excerptValMatch = excerptLine.match(/excerpt:\s*['"]([^'"]+)['"]/);
            if (excerptValMatch) excerpt = excerptValMatch[1];
        }

        console.log(`\n[Remaining: ~${remaining}] ✍️ Generating content for: "${title.substring(0, 30)}..."`);
        const newContent = await generateContent(title, excerpt);

        if (newContent) {
            // Escape special chars for JS string
            const escapedContent = newContent
                .replace(/\\/g, '\\\\')
                .replace(/'/g, "\\'")
                .replace(/\n/g, '\\n');

            const replacement = `content: '${escapedContent}'`;

            // Replace ONLY this occurrence
            content = content.substring(0, index) +
                replacement +
                content.substring(index + fullMatch.length);

            fs.writeFileSync(BLOG_PATH, content);
            console.log("   ✅ Content replaced and saved in blog-data.ts");

            // Short delay
            await new Promise(r => setTimeout(r, 1000));
        } else {
            console.log("   ❌ Failed to generate. Marking as failed.");
            content = content.replace(fullMatch, `content: 'Error: Content generation failed'`);
            fs.writeFileSync(BLOG_PATH, content);
        }

        remaining = Math.max(0, remaining - 1);
    }

    console.log("\n✅ All jobs completed.");
}

main().catch(console.error);
