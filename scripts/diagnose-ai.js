const { createGoogleGenerativeAI } = require('@ai-sdk/google');
const { generateText } = require('ai');
require('dotenv').config({ path: '.env.local' });

async function diagnose() {
    console.log('--- DIAGNOSTIC START ---');

    const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!key) {
        console.error('❌ ERROR: GOOGLE_GENERATIVE_AI_API_KEY is missing in .env.local');
        return;
    }

    const google = createGoogleGenerativeAI({
        apiKey: key,
    });

    const modelsToTest = [
        'gemini-2.0-flash-lite-preview-02-05', // Try specific preview if needed, but let's stick to list
        'gemini-2.0-flash-lite-001',
        'gemini-flash-latest',
        'gemini-pro-latest'
    ];

    for (const modelId of modelsToTest) {
        console.log(`\nTesting connection to Google: ${modelId}...`);
        try {
            const result = await generateText({
                model: google(modelId),
                prompt: 'Hi',
            });
            console.log(`✅ SUCCESS with ${modelId}!`);
            console.log('Response:', result.text);
            console.log(`\n!!! FOUND WORKING MODEL: ${modelId} !!!`);
            return;
        } catch (error) {
            console.log(`❌ FAILED ${modelId}: ${error.message}`);
        }
    }

    console.log('\n❌ ALL TESTS FAILED.');
    console.log('--- DIAGNOSTIC END ---');
}

diagnose();
