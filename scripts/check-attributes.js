const { Client, Databases } = require('node-appwrite');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function checkAttributes() {
    const dbId = process.env.APPWRITE_DATABASE_ID || 'main-db';
    const colId = process.env.APPWRITE_BLOG_COLLECTION_ID || 'blog_posts';

    console.log(`Checking attributes for ${colId}...`);
    try {
        const attrs = await databases.listAttributes(dbId, colId);
        console.log('Existing attributes:');
        attrs.attributes.forEach(a => console.log(`- ${a.key} (${a.type}) status: ${a.status}`));
    } catch (e) {
        console.error(e);
    }
}

checkAttributes();
