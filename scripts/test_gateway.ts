
const fs = require('fs');
const path = require('path');

async function testVercelGateway() {
    console.log("🔍 Starting Vercel AI Gateway Check...");

    // 1. Load Keys
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
        console.error("❌ .env.local not found!");
        process.exit(1);
    }
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const apiKeyMatch = envContent.match(/VERCEL_AI_GATEWAY_KEY=(vck_[a-zA-Z0-9\-_]+)/);

    if (!apiKeyMatch) {
        console.error("❌ VERCEL_AI_GATEWAY_KEY not found in .env.local!");
        process.exit(1);
    }

    const apiKey = apiKeyMatch[1];
    console.log("✅ Key Found:", apiKey.substring(0, 10) + "...");

    // Model from user request
    const model = 'minimax/minimax-m2.1';

    console.log(`\nTesting Model: ${model}...`);
    try {
        // OpenAI Compatible Endpoint for Vercel AI Gateway
        const url = "https://gateway.ai.vercel.com/openai/v1/chat/completions";

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": model,
                "messages": [
                    { "role": "user", "content": "Say 'Minimax Alive' if you see this." }
                ],
                "max_tokens": 20
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`✅ SUCCESS (${model}):`, data.choices?.[0]?.message?.content);
        } else {
            const err = await response.text();
            console.error(`❌ FAILED (${model}):`, response.status, err);
        }
    } catch (e) {
        console.error(`❌ EXCEPTION (${model}):`, e.message);
    }
}

testVercelGateway();
