// Test script to check if environment variables are loaded
console.log('GEMINI_API_KEY from process.env:', process.env.GEMINI_API_KEY);
console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length);
console.log('All env keys:', Object.keys(process.env).filter(key => key.includes('GEMINI')));