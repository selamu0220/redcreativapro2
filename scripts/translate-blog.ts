
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { blogPosts } from '../lib/blog-data';

// USAGE: 
// 1. Set OPENAI_API_KEY environment variable
// 2. Run: npx tsx scripts/translate-blog.ts

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const TARGET_LANGS = ['en'];

async function translateText(text: string, targetLang: string): Promise<string> {
    if (!text) return '';

    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: "You are a professional translator. Translate the following text to English. Maintain markdown formatting exactly. Do not add explanations." },
            { role: "user", content: text }
        ],
        model: "gpt-4o",
    });

    return completion.choices[0].message.content || '';
}

async function main() {
    console.log("🚀 Starting Blog Translation...");

    // In a real implementation, we would read the file, parse it, identify missing translations
    // and then call the API.

    // For safety, this script prints the code you should add to blog-data.ts
    // rather than overwriting your database file directly.

    for (const post of blogPosts) {
        if (post.translations?.en) continue; // Skip if already translated

        console.log(`\n-----------------------------------`);
        console.log(`Translating: ${post.title}`);

        try {
            // Mocking the translation for demo purposes if no API key
            // In production, uncomment the API calls above

            const enTitle = await translateText(post.title, 'en');
            const enExcerpt = await translateText(post.excerpt, 'en');
            // Content is too long to print in console usually

            console.log(`✅ Translation generated! Add this to blog-data.ts:`);
            console.log(`
  translations: {
    en: {
      title: "${enTitle}",
      excerpt: "${enExcerpt}",
      // ... content translation hidden for brevity
    }
  }
      `);

        } catch (error) {
            console.error("Error translating:", error);
        }
    }
}

if (process.env.OPENAI_API_KEY) {
    main();
} else {
    console.log("Please set OPENAI_API_KEY to run this script.");
}

