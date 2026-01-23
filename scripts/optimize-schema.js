/**
 * Script de Optimización de Esquema
 * 
 * Elimina atributos innecesarios para liberar espacio.
 * Ejecutar: node scripts/optimize-schema.js
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

async function optimizeSchema() {
    console.log('🧹 Optimizando esquema para liberar espacio...');

    // Atributos candidatos a borrar
    const toDelete = ['subcategory', 'relatedLinks', 'process', 'promptsSection', 'resourcesSection', 'faqJsonLd'];
    // Nota: Incluyo los que fallaron por si acaso alguno se creó parcialmente, aunque es improbable.

    for (const key of toDelete) {
        try {
            console.log(`🗑️ Borrando atributo: ${key}...`);
            await databases.deleteAttribute(DATABASE_ID, COLLECTION_ID, key);
            console.log(`   ✓ Borrado iniciado`);
        } catch (error) {
            console.log(`   ⏭ No existía o error: ${error.message}`);
        }
    }

    console.log('\n⏳ Esperando 10 segundos...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Ahora creamos UNA sola columna JSON para todo lo premium
    console.log('\n➕ Creando atributo consolidado: premiumData (JSON string)...');
    try {
        await databases.createStringAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            'premiumData',
            100000, // 100KB para meter todo
            false
        );
        console.log('✅ Atributo premiumData creado con éxito.');
    } catch (e) {
        console.error(`❌ Error creando premiumData: ${e.message}`);
    }
}

optimizeSchema().catch(console.error);
