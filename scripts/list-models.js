require('dotenv').config({ path: '.env.local' });

async function listModels() {
    const apiKey = process.env.OPEN_ROUTER_API_KEY;
    if (!apiKey) {
        console.error('❌ OPEN_ROUTER_API_KEY not found');
        return;
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/models", {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Found ${data.data.length} models.`);

            // Filter for free or popular models
            const freeModels = data.data.filter(m => m.id.includes('free') || m.id.includes('flash') || m.id.includes('llama-3'));

            console.log('\n--- Relevant Models ---');
            freeModels.forEach(m => {
                console.log(`ID: ${m.id} | Name: ${m.name}`);
            });

        } else {
            console.error('❌ API Request Failed:', response.status);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

listModels();
