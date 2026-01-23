/**
 * Batch Blog Translation Script
 * Uses OpenRouter API to translate all blog articles to English
 * 
 * Usage: node scripts/batch-translate.js
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const BLOG_DATA_PATH = path.join(__dirname, '..', 'lib', 'blog-data.ts');

if (!OPENROUTER_API_KEY) {
    console.error('❌ OPENROUTER_API_KEY not found in .env.local');
    process.exit(1);
}

async function translateText(text, type = 'content') {
    const systemPrompt = type === 'content'
        ? 'You are a professional translator. Translate the following Spanish text to English. Maintain all markdown formatting exactly. Do not add explanations or notes. Return ONLY the translated text.'
        : 'You are a professional translator. Translate the following Spanish text to English. Keep it concise and SEO-friendly. Return ONLY the translated text.';

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://redcreativa.pro',
        },
        body: JSON.stringify({
            model: 'anthropic/claude-3.5-sonnet',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: text }
            ],
            max_tokens: 8000,
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`API Error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
}

async function parseAndTranslateArticles() {
    console.log('📖 Reading blog-data.ts...');
    let content = fs.readFileSync(BLOG_DATA_PATH, 'utf-8');

    // Find all articles without translations
    const articleRegex = /{\s*id:\s*'([^']+)',\s*title:\s*'([^']+)',\s*excerpt:\s*'([^']+)',[^}]*content:\s*`([^`]*)`[^}]*seoTitle:\s*'([^']*)',[^}]*seoDescription:\s*'([^']*)'/gs;

    // Simpler approach: find articles that DON'T have translations field
    const articlesWithoutTranslations = [];

    // Extract article blocks
    const lines = content.split('\n');
    let currentArticle = null;
    let braceCount = 0;
    let articleStart = -1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.includes("id: '") && !currentArticle) {
            const match = line.match(/id:\s*'([^']+)'/);
            if (match) {
                currentArticle = { id: match[1], startLine: i };
                braceCount = 1;
                articleStart = i - 1; // Include opening brace
            }
        }

        if (currentArticle) {
            braceCount += (line.match(/{/g) || []).length;
            braceCount -= (line.match(/}/g) || []).length;

            if (braceCount === 0) {
                currentArticle.endLine = i;

                // Check if this article has translations
                const articleText = lines.slice(articleStart, i + 1).join('\n');
                if (!articleText.includes('translations:')) {
                    articlesWithoutTranslations.push(currentArticle);
                }
                currentArticle = null;
            }
        }
    }

    console.log(`\n📊 Found ${articlesWithoutTranslations.length} articles without translations`);

    // Process first 5 as a test batch
    const BATCH_SIZE = 5;
    const articlesToProcess = articlesWithoutTranslations.slice(0, BATCH_SIZE);

    console.log(`\n🔄 Processing first ${BATCH_SIZE} articles...\n`);

    for (const article of articlesToProcess) {
        console.log(`  📝 Translating: ${article.id}`);

        try {
            // Extract article data
            const articleLines = lines.slice(article.startLine - 1, article.endLine + 1);
            const articleText = articleLines.join('\n');

            // Extract fields
            const titleMatch = articleText.match(/title:\s*['"]([^'"]+)['"]/);
            const excerptMatch = articleText.match(/excerpt:\s*['"]([^'"]+)['"]/);
            const seoTitleMatch = articleText.match(/seoTitle:\s*['"]([^'"]*)['"]/);
            const seoDescMatch = articleText.match(/seoDescription:\s*['"]([^'"]*)['"]/);

            const title = titleMatch ? titleMatch[1] : '';
            const excerpt = excerptMatch ? excerptMatch[1] : '';
            const seoTitle = seoTitleMatch ? seoTitleMatch[1] : title;
            const seoDesc = seoDescMatch ? seoDescMatch[1] : excerpt;

            // Translate
            const enTitle = await translateText(title, 'title');
            const enExcerpt = await translateText(excerpt, 'excerpt');
            const enSeoTitle = await translateText(seoTitle, 'seo');
            const enSeoDesc = await translateText(seoDesc, 'seo');

            console.log(`     ✅ ${title} → ${enTitle}`);

            // Find insertion point (before closing brace of article)
            const insertLine = article.endLine;
            const translationBlock = `    translations: {
      en: {
        title: '${enTitle.replace(/'/g, "\\'")}',
        excerpt: '${enExcerpt.replace(/'/g, "\\'")}',
        seoTitle: '${enSeoTitle.replace(/'/g, "\\'")}',
        seoDescription: '${enSeoDesc.replace(/'/g, "\\'")}',
        content: '' // Content translation skipped for speed
      }
    },`;

            // Insert before closing brace
            lines.splice(insertLine, 0, translationBlock);

            // Wait to avoid rate limiting
            await new Promise(r => setTimeout(r, 1000));

        } catch (err) {
            console.error(`     ❌ Error: ${err.message}`);
        }
    }

    // Write updated file
    fs.writeFileSync(BLOG_DATA_PATH, lines.join('\n'));
    console.log('\n✅ Translations added to blog-data.ts');
    console.log(`\n⚠️  Run this script again to translate more articles (${articlesWithoutTranslations.length - BATCH_SIZE} remaining)`);
}

parseAndTranslateArticles().catch(console.error);
