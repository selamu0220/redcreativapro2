import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

// 1. Primary: OpenRouter (Survey confirmed ALIVE)
const openrouter = createOpenRouter({
    apiKey: process.env.OPEN_ROUTER_API_KEY,
    headers: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Red Creativa Pro',
    }
});

// 2. Backup: Google Secondary (Survey confirmed ALIVE)
const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY, // Switched to the alive secondary key
});

// Exports
export const openRouterProvider = openrouter;
export const googleProvider = google;

// Models
export const MODEL_PRIMARY = 'google/gemini-2.0-flash-lite-001'; // Verified OpenRouter ID
export const MODEL_BACKUP = 'gemini-2.0-flash-lite-001'; // Verified Google ID

// Default
export const DEFAULT_MODEL = MODEL_PRIMARY;
export const gateway = openRouterProvider;
