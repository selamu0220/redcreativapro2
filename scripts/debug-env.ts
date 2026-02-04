import dotenv from 'dotenv';
import path from 'path';

// Load .env.local first (overrides .env)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
// Load .env as fallback
dotenv.config();

console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');
console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? 'Present' : 'Missing');
console.log('All Environment Keys:', Object.keys(process.env).filter(k => k.includes('API') || k.includes('KEY')));
