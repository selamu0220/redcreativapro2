
const fs = require('fs');
const path = require('path');
// We can't easily use import in a raw node script without setup.
// So we will stick to raw fetch but with better error logging and trying a different URL just in case.
// Actually, I can use `npx tsx` which handles imports.

import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

async function testSDK() {
    console.log("🔍 Starting SDK Gateway Check...");

    // Manually load env
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const apiKeyMatch = envContent.match(/AI_GATEWAY_API_KEY="?([^"\s]+)"?/);

    if (!apiKeyMatch) { throw new Error("Key not found"); }
    const apiKey = apiKeyMatch[1];

    const vercelGateway = createOpenAI({
        apiKey: apiKey,
        baseURL: 'https://gateway.ai.vercel.com/openai/v1',
        headers: {
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Red Creativa Pro Debug',
        }
    });

    try {
        console.log("Sending request...");
        const result = await generateText({
            model: vercelGateway('minimax/minimax-m2.1'),
            messages: [{ role: 'user', content: 'Say "Minimax is working"' }],
        });
        console.log("✅ SDK SUCCESS:", result.text);
    } catch (error) {
        console.error("❌ SDK FAILED:", error);
    }
}

testSDK();
