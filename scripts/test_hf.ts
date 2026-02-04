
const fs = require('fs');
const path = require('path');

async function testHF() {
    console.log("🔍 Starting Hugging Face Sanity Check...");

    // 1. Load Keys
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
        console.error("❌ .env.local not found!");
        process.exit(1);
    }
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const apiKeyMatch = envContent.match(/HUGGINGFACE_API_KEY=(hf_[a-zA-Z0-9]+)/);

    if (!apiKeyMatch) {
        console.error("❌ HUGGINGFACE_API_KEY not found in .env.local!");
        process.exit(1);
    }

    const apiKey = apiKeyMatch[1];
    console.log("✅ Key Found:", apiKey.substring(0, 8) + "...");

    // HF OpenAI Compatible Endpoint
    // We'll test a small reliable model
    const model = 'meta-llama/Meta-Llama-3-8B-Instruct';

    console.log(`\nTesting Model: ${model}...`);
    try {
        // Try the generic OpenAI-compatible router endpoint
        const response = await fetch("https://router.huggingface.co/hf-inference/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": model,
                "messages": [
                    { "role": "user", "content": "Say 'HF Works' if you see this." }
                ],
                "max_tokens": 20
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

testHF();
