require('dotenv').config({ path: '.env.local' });

console.log('Available Environment Variables:');
const keys = Object.keys(process.env).filter(key =>
    key.includes('SUPABASE') ||
    key.includes('POSTGRES') ||
    key.includes('DB') ||
    key.includes('DATABASE') ||
    key.includes('URL')
);

keys.forEach(key => {
    // Hide values for security, just show length or partial
    const val = process.env[key];
    const preview = val ? val.substring(0, 10) + '...' : 'undefined';
    console.log(`${key}: ${preview}`);
});
