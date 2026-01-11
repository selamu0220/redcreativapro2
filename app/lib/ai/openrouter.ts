import { createOpenRouter } from '@openrouter/ai-sdk-provider';

// Check if API key is present
if (!process.env.OPEN_ROUTER_API_KEY) {
    console.warn('⚠️ OPEN_ROUTER_API_KEY is not set in environment variables');
}

export const openrouter = createOpenRouter({
    apiKey: process.env.OPEN_ROUTER_API_KEY,
    headers: {
        'HTTP-Referer': 'https://redcreativapro.com', // Optional: for OpenRouter rankings
        'X-Title': 'Red Creativa Pro', // Optional: for OpenRouter rankings
    },
});
