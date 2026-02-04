require('dotenv').config({ path: '.env.local' });

async function listModels() {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        console.error("No API Key found");
        return;
    }

    console.log("Querying Google API for models...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", JSON.stringify(data.error, null, 2));
        } else {
            console.log("Available Models:");
            if (data.models) {
                data.models.forEach(m => {
                    if (m.name.includes('gemini')) {
                        console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
                    }
                });
            } else {
                console.log("No models returned (check if API is enabled?)");
                console.log(JSON.stringify(data, null, 2));
            }
        }
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

listModels();
