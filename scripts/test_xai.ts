
const fs = require('fs');
const path = require('path');

async function testXAI() {
    console.log("🔍 Starting xAI (Grok) Sanity Check...");

    // 1. Load Keys
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
        console.error("❌ .env.local not found!");
        process.exit(1);
    }
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const apiKeyMatch = envContent.match(/XAI_API_KEY=([a-zA-Z0-9\-_]+)/);

    if (!apiKeyMatch) {
        console.error("❌ XAI_API_KEY not found in .env.local!");
        console.log("Content preview:", envContent.substring(0, 200) + "...");
        process.exit(1);
    }

    const apiKey = apiKeyMatch[1];
    console.log("✅ Key Found:", apiKey.substring(0, 10) + "...");

    const model = 'grok-beta'; // or grok-2-1212

    console.log(`\nTesting Model: ${model}...`);
    try {
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": model,
                "messages": [
                    { "role": "system", "content": "You are a test bot." },
                    { "role": "user", "content": "Say 'Grok is alive' if you see this." }
                ],
                "stream": false
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`✅ SUCCESS (${model}):`, data.choices[0].message.content);
        } else {
            const err = await response.text();
            console.error(`❌ FAILED (${model}):`, response.status, err);
        }
    } catch (e) {
        console.error(`❌ EXCEPTION (${model}):`, e.message);
    }
}

testXAI();
