import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load .env.local first (overrides .env)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
// Load .env as fallback
dotenv.config();
// USAGE: 
// npx tsx scripts/translate-locales.ts

const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY || process.env.OPEN_ROUTER_API_KEY;
const baseURL = (process.env.OPENROUTER_API_KEY || process.env.OPEN_ROUTER_API_KEY) ? "https://openrouter.ai/api/v1" : undefined;

console.log("Debug: API Key present:", !!apiKey);
console.log("Debug: Base URL:", baseURL);

if (!apiKey) {
    console.error("❌ No API Key found. Set OPENAI_API_KEY or OPEN_ROUTER_API_KEY in .env");
    process.exit(1);
}

const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
});

const MESSAGES_DIR = path.join(process.cwd(), 'messages');
const SOURCE_LANG = 'en';
const TARGET_LANGS = ['es', 'fr', 'de', 'it', 'pt'];
const CONCURRENCY_LIMIT = 5;

// Helper to read JSON
function readJson(lang: string): Record<string, string> {
    const filePath = path.join(MESSAGES_DIR, `${lang}.json`);
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// Helper to write JSON
function writeJson(lang: string, data: Record<string, string>) {
    const filePath = path.join(MESSAGES_DIR, `${lang}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
}

async function translateText(text: string, targetLang: string): Promise<string> {
    if (!text) return '';

    try {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: `You are a professional translator for a marketing platform. Translate the following text from English to ${targetLang}. Maintain tone (professional but accessible). Do not translate variable placeholders like {name}. Return ONLY the translated string.` },
                { role: "user", content: text }
            ],
            model: "gpt-4o",
        });

        return completion.choices[0].message.content?.trim() || text;
    } catch (e) {
        console.error(`Error translating "${text}" to ${targetLang}:`, e);
        return text; // Fallback to original
    }
}

async function processLanguage(lang: string, sourceMessages: Record<string, string>) {
    console.log(`\nProcessing language: ${lang.toUpperCase()}`);
    const targetMessages = readJson(lang);
    const sourceKeys = Object.keys(sourceMessages);
    let updated = false;
    let missingKeys: string[] = [];

    for (const key of sourceKeys) {
        if (!targetMessages[key]) {
            missingKeys.push(key);
        }
    }

    if (missingKeys.length === 0) {
        console.log(`All keys present for ${lang}.`);
        return;
    }

    console.log(`Found ${missingKeys.length} missing keys for ${lang}. Starting translation...`);

    // Process in batches/concurrency
    for (let i = 0; i < missingKeys.length; i += CONCURRENCY_LIMIT) {
        const batch = missingKeys.slice(i, i + CONCURRENCY_LIMIT);
        await Promise.all(batch.map(async (key) => {
            const translation = await translateText(sourceMessages[key], lang);
            targetMessages[key] = translation;
            process.stdout.write('.');
        }));
        updated = true;
    }

    console.log(`\nWriting updates to ${lang}.json`);
    writeJson(lang, targetMessages);
}

async function main() {
    console.log("🚀 Starting Locale Translation...");

    const sourceMessages = readJson(SOURCE_LANG);

    for (const lang of TARGET_LANGS) {
        await processLanguage(lang, sourceMessages);
    }

    console.log("\n✨ Translation complete!");
}

main().catch(console.error);
