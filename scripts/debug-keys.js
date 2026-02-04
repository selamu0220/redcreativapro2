require('dotenv').config({ path: '.env.local' });

console.log('Searching for API Keys...');
const keys = Object.keys(process.env).filter(key =>
    key.toUpperCase().includes('OPEN') ||
    key.toUpperCase().includes('ROUTER') ||
    key.toUpperCase().includes('KEY') ||
    key.toUpperCase().includes('AI')
);

keys.forEach(key => {
    const val = process.env[key];
    const preview = val ? val.substring(0, 5) + '...' : 'undefined';
    console.log(`${key}: ${preview}`);
});
