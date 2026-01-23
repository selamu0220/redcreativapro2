/**
 * Simple Blog Translator v2
 * Translates Spanish blog articles to English using OpenRouter
 * 
 * Usage: node scripts/translate-all.js
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.OPENROUTER_API_KEY;
const BLOG_PATH = path.join(__dirname, '..', 'lib', 'blog-data.ts');

async function translate(text) {
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
                    content: `Translate this Spanish text to English. Return ONLY the translation, no explanations:\n\n${text}`
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
}

async function main() {
    console.log('📖 Reading blog-data.ts...');
    let content = fs.readFileSync(BLOG_PATH, 'utf-8');

    // Find articles without translations using simple pattern
    // Look for id: 'xxx', then check if translations: exists before next }
    const articles = [];
    const idMatches = content.matchAll(/id:\s*'([^']+)'/g);

    for (const match of idMatches) {
        const id = match[1];
        const startIdx = match.index;

        // Find the end of this article object
        let braceCount = 0;
        let endIdx = startIdx;
        let inString = false;
        let stringChar = null;

        for (let i = startIdx; i < content.length; i++) {
            const char = content[i];

            if (inString) {
                if (char === stringChar) {
                    let backslashCount = 0;
                    let p = i - 1;
                    while (p >= 0 && content[p] === '\\') { backslashCount++; p--; }
                    if (backslashCount % 2 === 0) { inString = false; stringChar = null; }
                }
                continue;
            }

            // Check for comments
            if (!inString && char === '/' && content[i + 1] === '/') {
                while (i < content.length && content[i] !== '\n') i++;
                continue;
            }

            if (char === "'" || char === '"' || char === '`') {
                inString = true;
                stringChar = char;
                continue;
            }

            if (char === '{') {
                braceCount++;
            } else if (char === '}') {
                braceCount--;
                if (braceCount < 0) {
                    endIdx = i;
                    break;
                }
            }
        }

        const articleBlock = content.slice(startIdx, endIdx);

        // Skip if already has translations
        if (articleBlock.includes('translations:')) {
            continue;
        }

        // Extract title and excerpt
        const titleMatch = articleBlock.match(/title:\s*['"]([^'"]+)['"]/);
        const excerptMatch = articleBlock.match(/excerpt:\s*['"]([^'"]+)['"]/);

        // Check if it's a blog post (has publishedAt)
        if (!articleBlock.includes('publishedAt')) {
            continue;
        }

        if (titleMatch && excerptMatch) {
            articles.push({
                id,
                title: titleMatch[1],
                excerpt: excerptMatch[1],
                startIdx,
                endIdx
            });
        }
    }

    console.log(`📊 Found ${articles.length} articles without translations\n`);

    // Process all articles
    let successCount = 0;
    // Load cache
    const CACHE_PATH = path.join(__dirname, 'translations-cache.json');
    let cache = {};
    if (fs.existsSync(CACHE_PATH)) {
        try {
            cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
            console.log(`📦 Loaded ${Object.keys(cache).length} cached translations.`);
        } catch (e) {
            console.log('⚠️ Could not load cache, starting fresh.');
        }
    }

    // Process all articles
    const translations = [];

    for (let i = 0; i < articles.length; i++) {
        const article = articles[i];
        const articleBlock = content.slice(article.startIdx, article.endIdx);

        // Check cache
        let cached = cache[article.id];
        let enTitle = cached?.enTitle;
        let enExcerpt = cached?.enExcerpt;
        let enContent = cached?.enContent;

        // Extract content from article block
        // content: `...` or "..." or '...'
        // We need to parse it properly.
        const contentStartMatch = articleBlock.match(/content:\s*/);
        let articleContent = "";

        if (contentStartMatch) {
            const cStart = contentStartMatch.index + contentStartMatch[0].length;
            const quoteChar = articleBlock[cStart];
            let cEnd = -1;

            if (quoteChar === '`' || quoteChar === "'" || quoteChar === '"') {
                for (let k = cStart + 1; k < articleBlock.length; k++) {
                    if (articleBlock[k] === quoteChar && articleBlock[k - 1] !== '\\') {
                        cEnd = k;
                        break;
                    }
                }
                if (cEnd !== -1) {
                    articleContent = articleBlock.substring(cStart + 1, cEnd);
                }
            }
        }

        if (enTitle && enExcerpt && enContent) {
            console.log(`[${i + 1}/${articles.length}] Using full cache for: ${article.id}`);
            translations.push({
                id: article.id,
                enTitle,
                enExcerpt,
                enContent
            });
            successCount++;
            continue;
        }

        console.log(`[${i + 1}/${articles.length}] Translating (${enContent ? 'PARTIAL' : 'FULL'}): ${article.id.substring(0, 30)}...`);

        try {
            if (!enTitle) {
                enTitle = await translate(article.title);
                await new Promise(r => setTimeout(r, 100));
            }
            if (!enExcerpt) {
                enExcerpt = await translate(article.excerpt);
                await new Promise(r => setTimeout(r, 100));
            }
            if (!enContent && articleContent) {
                // If content is huge, we might hit limits. But let's try.
                // If content is just a placeholder (short), it's fast.
                if (articleContent.length > 20000) {
                    console.log('   ⚠️ Content too long, truncating or skipping...');
                    enContent = "Content too long for auto-translation.";
                } else {
                    enContent = await translate(articleContent);
                }
                await new Promise(r => setTimeout(r, 500)); // More wait for content
            } else if (!enContent) {
                enContent = "";
            }

            const tData = {
                id: article.id,
                enTitle: enTitle.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' '),
                enExcerpt: enExcerpt.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' '),
                enContent: enContent // Store raw, we format on inject
            };

            translations.push(tData);
            cache[article.id] = tData;

            // Save cache incrementally
            fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));

            successCount++;
            console.log(`   ✅ "${enTitle.substring(0, 50)}..."`);

        } catch (err) {
            console.log(`   ❌ Error: ${err.message}`);
        }
    }

    console.log(`\n📝 Injecting ${translations.length} translations into blog-data.ts...`);

    // Reload content to be sure (though we haven't touched it yet)
    content = fs.readFileSync(BLOG_PATH, 'utf-8');

    // Sort translations by reverse order of appearance in file to avoid index shift?
    // Or just iterate and find again.

    // Better: Iterate reversed so we inject from bottom up.
    // We need to know where each article ends.
    // It's expensive to search every time.

    // Let's iterate content once to find all IDs and their closing braces.
    const articleMap = [];
    const idRegex = /id:\s*['"]([^'"]+)['"]/g;
    let match;
    while ((match = idRegex.exec(content)) !== null) {
        const id = match[1];
        const startIdx = match.index;
        // Find closing brace
        let braceCount = 0;
        let inString = false;
        let stringChar = null;
        let endIdx = -1;

        for (let k = startIdx; k < content.length; k++) {
            const char = content[k];

            if (inString) {
                if (char === stringChar) {
                    let backslashCount = 0;
                    let p = k - 1;
                    while (p >= 0 && content[p] === '\\') {
                        backslashCount++;
                        p--;
                    }
                    if (backslashCount % 2 === 0) {
                        inString = false;
                        stringChar = null;
                    }
                }
                continue;
            }

            // Check for comments
            if (!inString && char === '/' && content[i + 1] === '/') {
                while (i < content.length && content[i] !== '\n') i++;
                continue;
            }

            if (char === "'" || char === '"' || char === '`') {
                inString = true;
                stringChar = char;
                continue;
            }

            if (char === '{') {
                braceCount++;
            } else if (char === '}') {
                braceCount--;
                if (braceCount < 0) {
                    endIdx = k;
                    break;
                }
            }
        }
        if (endIdx !== -1) {
            articleMap.push({ id, endIdx });
        }
    }

    // Sort articleMap by endIdx descending
    articleMap.sort((a, b) => b.endIdx - a.endIdx);

    // Inject
    let injectedCount = 0;

    for (const item of articleMap) {
        // Find if we have a translation for this ID
        const t = translations.find(x => x.id === item.id);
        if (t) {
            // Smart comma detection
            let p = item.endIdx - 1;
            while (p >= 0 && /\s/.test(content[p])) p--;
            const needComma = content[p] !== ',';

            const translationBlock = `${needComma ? ',' : ''}
    translations: {
      en: {
        title: '${t.enTitle}',
        excerpt: '${t.enExcerpt}',
        content: ${JSON.stringify(t.enContent || "")}
      }
    },`;
            // Insert at item.endIdx
            content = content.slice(0, item.endIdx) + translationBlock + content.slice(item.endIdx);
            injectedCount++;
        }
    }

    fs.writeFileSync(BLOG_PATH, content);
    console.log(`\n✅ Done! Injected ${injectedCount} translations.`);
}

main().catch(console.error);
