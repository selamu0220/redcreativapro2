
import fs from 'fs';
import path from 'path';
import { generateText } from 'ai';

// 1. Load Env BEFORE importing gateway
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const parseEnv = (content: string) => {
    const res: Record<string, string> = {};
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) res[match[1]] = match[2].trim();
    });
    return res;
};
const envs = parseEnv(envContent);
Object.assign(process.env, envs);

// 2. Import Gateway (now that env is loaded)
import { vercelProvider, googleProvider, MODEL_VERCEL, MODEL_GOOGLE } from '../app/lib/ai/gateway';

async function testFallback() {
    console.log("🧪 Testing Fallback Logic...");

    // 1. Try Primary
    try {
        console.log(`Attempting Primary (Vercel)...`);
        await generateText({
            model: vercelProvider(MODEL_VERCEL),
            prompt: 'Hi',
        });
        console.log("✅ Primary Worked!");
    } catch (e: any) {
        console.log(`❌ Primary Failed: ${e.message.split('\n')[0]}`);

        // 2. Try Backup
        try {
            console.log(`🔄 Attempting Backup (Google)...`);
            await generateText({
                model: googleProvider(MODEL_GOOGLE),
                prompt: 'Hi',
            });
            console.log("✅ Backup Worked!");
        } catch (e2: any) {
            console.log(`❌ Backup Failed: ${e2.message.split('\n')[0]}`);
            console.log("⚠️ This is EXPECTED if Google is 429.");
        }
    }
}

testFallback();
