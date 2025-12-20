const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(process.cwd(), '.env.local');

if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    console.log('Checking .env.local...');
    console.log('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY present:', !!envConfig.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
    console.log('CLERK_SECRET_KEY present:', !!envConfig.CLERK_SECRET_KEY);

    // Check lengths to ensure they aren't empty strings
    if (envConfig.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
        console.log('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY length:', envConfig.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.length);
    }
    if (envConfig.CLERK_SECRET_KEY) {
        console.log('CLERK_SECRET_KEY length:', envConfig.CLERK_SECRET_KEY.length);
    }

} else {
    console.log('.env.local file not found');
}
