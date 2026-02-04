
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const keyMatch = envContent.match(/OPEN_ROUTER_API_KEY=(sk-[a-zA-Z0-9\-_]+)/);
const key = keyMatch ? keyMatch[1] : null;

async function listModels() {
    if (!key) {
        console.log("❌ No OpenRouter Key found");
        return;
    }

    console.log("🔍 Fetching OpenRouter Models...");
    try {
        const resp = await fetch('https://openrouter.ai/api/v1/models', {
            headers: { 'Authorization': `Bearer ${key}` }
        });

        if (!resp.ok) {
            console.log(`❌ Failed: ${resp.status}`);
            return;
        }

        const data = await resp.json();
        const models = data.data || [];

        console.log(`✅ Found ${models.length} models. Filtering for 'gemini' or 'free'...`);

        const candidates = models.filter((m: any) =>
            m.id.toLowerCase().includes('gemini') ||
            m.id.toLowerCase().includes('google')
        );

        candidates.forEach((m: any) => {
            console.log(`Id: ${m.id} | Name: ${m.name} | Context: ${m.context_length}`);
        });

    } catch (e: any) {
        console.log(`❌ Error: ${e.message}`);
    }
}

listModels();
