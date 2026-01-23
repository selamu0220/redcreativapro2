/**
 * Script de Diagnóstico de Contenido del Blog en Appwrite
 * 
 * Analiza la calidad y longitud del contenido de los artículos migrados.
 * Ejecutar: node scripts/analyze-blog-content.js
 */

const { Client, Databases, Query } = require('node-appwrite');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Configuration
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'main-db';
const COLLECTION_ID = process.env.APPWRITE_BLOG_COLLECTION_ID || 'blog_posts';

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);

async function analyzeContent() {
    console.log('🔍 Analizando contenido del blog en Appwrite...');

    let allDocuments = [];
    let offset = 0;
    const limit = 100;

    // Fetch all documents
    while (true) {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [
                Query.limit(limit),
                Query.offset(offset),
                Query.select(['$id', 'title', 'content', 'slug'])
            ]
        );

        allDocuments = [...allDocuments, ...response.documents];

        if (response.documents.length < limit) break;
        offset += limit;
    }

    console.log(`📊 Total de artículos encontrados: ${allDocuments.length}\n`);

    const stats = {
        placeholder: 0,
        veryShort: 0, // < 500 chars
        short: 0,     // 500 - 2000 chars
        medium: 0,    // 2000 - 5000 chars
        long: 0       // > 5000 chars
    };

    const placeholderText = 'Contenido migrado desde archivo estático.';
    const poorContentIds = [];

    console.log('--- Análisis de Calidad ---');

    allDocuments.forEach(doc => {
        const contentLen = doc.content ? doc.content.length : 0;

        if (!doc.content || doc.content.includes(placeholderText) || contentLen < 100) {
            stats.placeholder++;
            poorContentIds.push(doc.$id);
        } else if (contentLen < 500) {
            stats.veryShort++;
            poorContentIds.push(doc.$id); // Consideramos muy cortos como "pobres" también
        } else if (contentLen < 2000) {
            stats.short++;
        } else if (contentLen < 5000) {
            stats.medium++;
        } else {
            stats.long++;
        }
    });

    console.log(`🔴 Contenido Placeholder/Vacío: ${stats.placeholder}`);
    console.log(`🟠 Contenido Muy Corto (<500):  ${stats.veryShort}`);
    console.log(`🟡 Contenido Corto (500-2k):    ${stats.short}`);
    console.log(`🟢 Contenido Medio (2k-5k):     ${stats.medium}`);
    console.log(`🔵 Contenido Largo (>5k):       ${stats.long}`);

    console.log('\n--- Recomendación ---');
    console.log(`Se detectaron ${stats.placeholder + stats.veryShort} artículos de baja calidad.`);

    if (stats.placeholder > 0) {
        console.log('💡 La mayoría son placeholders generados por la migración automática.');
    }

    // Save IDs to a file for potential deletion
    const fs = require('fs');
    fs.writeFileSync(
        path.join(__dirname, 'poor-content-ids.json'),
        JSON.stringify(poorContentIds, null, 2)
    );
    console.log(`\n💾 IDs de artículos 'pobres' guardados en scripts/poor-content-ids.json (${poorContentIds.length} artículos)`);
}

analyzeContent().catch(console.error);
