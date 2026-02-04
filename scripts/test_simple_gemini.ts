
const fs = require('fs');
const path = require('path');

async function testGeminiSimple() {
    console.log("🔍 Starting Gemini PRIMARY Check...");

    // 1. Load Keys
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
        console.error("❌ .env.local not found!");
        process.exit(1);
    }
    const envContent = fs.readFileSync(envPath, 'utf-8');
    // Look for GOOGLE_GENERATIVE_AI_API_KEY
    const apiKeyMatch = envContent.match(/GOOGLE_GENERATIVE_AI_API_KEY=(AIza[a-zA-Z0-9\-_]+)/);

    if (!apiKeyMatch) {
        console.error("❌ GOOGLE_GENERATIVE_AI_API_KEY not found!");
        process.exit(1);
    }

    const apiKey = apiKeyMatch[1];
    console.log("✅ Key Found:", apiKey.substring(0, 8) + "...");

    console.log(`\nListing Models...`);
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

        const response = await fetch(url, {
            method: "GET"
        });

        if (response.ok) {
            const data = await response.json();
            console.log("✅ Available Models:");
            data.models.forEach(m => {
                if (m.name.includes('gemini') || m.name.includes('flash')) {
                    console.log(` - ${m.name}`);
                }
            });

            // Auto-test logic
            const candidate = data.models.find(m =>
                (m.name.includes('gemini-1.5-flash') || m.name.includes('gemini-pro')) &&
                m.supportedGenerationMethods.includes('generateContent')
            );

            if (candidate) {
                const modelName = candidate.name;
                console.log(`\nAuto-testing candidate: ${modelName}...`);

                const genUrl = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;
                const genResponse = await fetch(genUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ "contents": [{ "parts": [{ "text": "Say 'Alive'" }] }] })
                });

                if (genResponse.ok) {
                    const genData = await genResponse.json();
                    const text = genData.candidates?.[0]?.content?.parts?.[0]?.text;
                    console.log("✅ Generation SUCCESS:", text || "No text but 200 OK");
                } else {
                    const err = await genResponse.text();
                    console.error("❌ Generation FAILED:", genResponse.status, err);
                }
            } else {
                console.error("❌ No suitable generation model found in list.");
            }

        } else {
            const err = await response.text();
            console.error(`❌ FAILED to list models:`, response.status, err);
        }
    } catch (e) {
        console.error(`❌ EXCEPTION:`, e.message);
    }
}

testGeminiSimple();
