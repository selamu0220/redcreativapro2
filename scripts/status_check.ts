
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import fs from 'fs';
import path from 'path';

// Load Env
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

// Simple Regex Extraction
const googleMatch = envContent.match(/GOOGLE_GENERATIVE_AI_API_KEY=(AIza[a-zA-Z0-9\-_]+)/);
const googleKey = googleMatch ? googleMatch[1] : null;

const vercelMatch = envContent.match(/AI_GATEWAY_API_KEY=(vck_[a-zA-Z0-9\-_]+)/);
const vercelKey = vercelMatch ? vercelMatch[1] : null;

const envs = {
    GOOGLE_GENERATIVE_AI_API_KEY: googleKey,
    AI_GATEWAY_API_KEY: vercelKey
};

async function checkStatus() {
    console.log("🏥 STARTING DIAGNOSIS...");

    // 1. Check Google (Backup)
    const googleKey = envs.GOOGLE_GENERATIVE_AI_API_KEY;
    if (googleKey) {
        console.log(`\n🔍 Checking Google API Key (${googleKey.substring(0, 8)}...)...`);
        try {
            // List Models to check Quota and Model Name Validity
            const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${googleKey}`;
            const resp = await fetch(url);

            if (resp.status === 200) {
                const data = await resp.json();
                console.log("✅ Google Key: ALIVE");
                console.log("📋 Available Gemini Models:");
                const models = data.models || [];
                const geminiModels = models.filter((m: any) => m.name.includes('gemini'));
                geminiModels.forEach((m: any) => console.log(`   - ${m.name}`));
            } else if (resp.status === 429) {
                console.log("⛔ Google Key: QUOTA EXHAUSTED (429)");
                console.log("   (You must wait for the daily reset)");
            } else {
                console.log(`❌ Google Key: ERROR ${resp.status}`);
                console.log(await resp.text());
            }
        } catch (e: any) {
            console.log(`❌ Google Connection Error: ${e.message}`);
        }
    } else {
        console.log("⚪ Google Key: MISSING");
    }

    // 2. Check Vercel Gateway (Primary)
    const vercelKey = envs.AI_GATEWAY_API_KEY || envs.VERCEL_AI_GATEWAY_KEY;
    if (vercelKey) {
        console.log(`\n🔍 Checking Vercel Gateway Key (${vercelKey.substring(0, 8)}...)...`);
        try {
            const resp = await fetch('https://gateway.ai.vercel.com/openai/v1/models', {
                headers: {
                    'Authorization': `Bearer ${vercelKey}`,
                    'HTTP-Referer': 'http://localhost:3000',
                    'X-Title': 'Debug'
                }
            });
            if (resp.ok) console.log("✅ Vercel Gateway: CONNECTED");
            else {
                console.log(`❌ Vercel Gateway: FAILED (${resp.status})`);
                // console.log(await resp.text()); // Often HTML error page or empty
            }
        } catch (e: any) {
            console.log(`❌ Vercel Gateway Check: ${e.message} (Likely ECONNRESET)`);
        }
    } else {
        console.log("⚪ Vercel Key: MISSING");
    }
}

checkStatus();
