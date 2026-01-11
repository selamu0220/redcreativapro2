const fetch = require('node-fetch');

const ENDPOINT = 'http://localhost:3000/api/improve-text-openrouter';

async function testImprovement(scenario, payload) {
    console.log(`\n🧪 Testing: ${scenario}`);
    console.log(`📦 Payload:`, JSON.stringify(payload, null, 2));

    try {
        const startTime = Date.now();
        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const duration = Date.now() - startTime;
        console.log(`⏱️ Duration: ${duration}ms`);
        console.log(`📊 Status: ${response.status}`);

        const text = await response.text();
        try {
            const data = JSON.parse(text);
            if (response.ok) {
                console.log(`✅ Success!`);
                console.log(`📝 Improved Content: "${data.improvedContent}"`);

                // Quality checks
                if (data.improvedContent.includes("Hola") && !data.improvedContent.includes("¡Hola! Todo bien")) {
                    console.log("✨ Quality Check: Chatbot behavior avoided [PASS]");
                } else {
                    console.log("⚠️ Quality Check: Check output manualy");
                }

                return true;
            } else {
                console.error(`❌ API Error:`, data);
                return false;
            }
        } catch (e) {
            console.error(`❌ JSON Parse Error:`, text);
            return false;
        }
    } catch (error) {
        console.error(`❌ Network Error:`, error.message);
        return false;
    }
}

async function runTests() {
    console.log("🚀 Starting AI Writer Verification Sequence...");

    // 1. Test Manual Button (Xiaomi - Free - Default)
    await testImprovement("Manual Button Click (Xiaomi)", {
        content: "hola que tal",
        creativity: 0.7,
        model: "xiaomi/mimo-v2-flash:free"
    });

    // 2. Test Auto Mode (Simulated same call)
    await testImprovement("Auto Mode Trigger", {
        content: "esto es una prueva de ortografia",
        creativity: 0.5,
        model: "xiaomi/mimo-v2-flash:free" // Auto mode uses selected model
    });

    // 3. Test Llama 3.3 (Alternative model)
    await testImprovement("Manual Button (Llama 3.3)", {
        content: "el perro corre rapido por el parque",
        creativity: 0.7,
        model: "meta-llama/llama-3.3-70b-instruct:free"
    });
}

runTests();
