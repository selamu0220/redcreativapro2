/**
 * Script de Reparación de Esquema
 * 
 * Crea los atributos faltantes en la colección blog_posts
 * Ejecutar: node scripts/repair-schema.js
 */

const { Client, Databases } = require('node-appwrite');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'main-db';
const COLLECTION_ID = process.env.APPWRITE_BLOG_COLLECTION_ID || 'blog_posts';

async function repairSchema() {
    console.log('🔧 Reparando esquema de Appwrite...');

    const missingAttributes = [
        { key: 'process', type: 'string', size: 10000, required: false },
        { key: 'promptsSection', type: 'string', size: 10000, required: false },
        { key: 'resourcesSection', type: 'string', size: 10000, required: false },
        { key: 'faqJsonLd', type: 'string', size: 10000, required: false },
    ];

    for (const attr of missingAttributes) {
        try {
            console.log(`➕ Creando atributo: ${attr.key}...`);
            await databases.createStringAttribute(
                DATABASE_ID,
                COLLECTION_ID,
                attr.key,
                attr.size,
                attr.required
            );
            console.log(`   ✓ Creado`);
        } catch (error) {
            if (error.code === 409) {
                console.log(`   ⏭ Ya existe`);
            } else {
                console.error(`   ❌ Error: ${error.message}`);
            }
        }
    }

    console.log('\n⏳ Esperando 20 segundos para que Appwrite procese los índices...');
    await new Promise(resolve => setTimeout(resolve, 20000));
    console.log('✅ Esquema reparado. Ahora puedes ejecutar seed-golden-article.js');
}

repairSchema().catch(console.error);
