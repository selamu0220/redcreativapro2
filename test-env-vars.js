#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

console.log('🔍 TESTING ENVIRONMENT VARIABLES');
console.log('================================\n');

console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Found' : 'Not found');
console.log('GOOGLE_GENERATIVE_AI_API_KEY:', process.env.GOOGLE_GENERATIVE_AI_API_KEY ? 'Found' : 'Not found');

console.log('\nValues:');
console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length || 0);
console.log('GOOGLE_GENERATIVE_AI_API_KEY length:', process.env.GOOGLE_GENERATIVE_AI_API_KEY?.length || 0);

console.log('\nFirst 15 chars:');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY?.substring(0, 15) || 'N/A');
console.log('GOOGLE_GENERATIVE_AI_API_KEY:', process.env.GOOGLE_GENERATIVE_AI_API_KEY?.substring(0, 15) || 'N/A');