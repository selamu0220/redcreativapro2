
const fs = require('fs');
const path = require('path');

async function testOpenRouterSurvival() {
    console.log("🔍 Starting OpenRouter Survival Check...");

    // 1. Load Keys
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
        console.error("❌ .env.local not found!");
        process.exit(1);
    }
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const apiKeyMatch = envContent.match(/OPEN_ROUTER_API_KEY=(sk-or-v1-[a-zA-Z0-9]+)/);

    if (!apiKeyMatch) {
        console.error("❌ OPEN_ROUTER_API_KEY not found!");
        process.exit(1);
    }

    const apiKey = apiKeyMatch[1];
    console.log("✅ Key Found:", apiKey.substring(0, 10) + "...");

    // 2. The Long List of Hope
    const models = [
        'microsoft/phi-3-mini-128k-instruct:free',
        'microsoft/phi-3-medium-128k-instruct:free',
        'huggingfaceh4/zephyr-7b-beta:free',
        'openchat/openchat-7b:free',
        'undi95/toppy-m-7b:free',
        'gryphe/mythomist-7b:free',
        'liquid/lfm-40b:free',
        'sophosympatheia/midnight-rose-70b:free',
        'meta-llama/llama-3-8b-instruct:free',
        'mistralai/mistral-7b-instruct:free'
    ];

    console.log(`\nTesting ${models.length} models for survival...`);

    for (const model of models) {
        process.stdout.write(`Testing ${model}... `);
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "Red Creativa Pro Debug"
                },
                body: JSON.stringify({
                    "model": model,
                    "messages": [
                        { "role": "user", "content": "Alive?" }
                    ],
                    "max_tokens": 5
                })
            });

            if (response.ok) {
                console.log(`✅ ALIVE! (200 OK)`);
                const data = await response.json();
                console.log(`   Response: ${data.choices[0].message.content}`);
                // Verify content isn't empty
                if (data.choices[0].message.content) {
                    console.log(`\n🎉 WE HAVE A WINNER: ${model}`);
                    // STOP at the first winner
                    process.exit(0);
                }
            } else {
                console.log(`❌ DEAD (${response.status})`);
            }
        } catch (e) {
            console.log(`❌ ERROR (${e.message})`);
        }
    }
    console.log("\n❌ ALL MODELS FAILED. Total blackout.");
}

testOpenRouterSurvival();
