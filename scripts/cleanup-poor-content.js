/**
 * Script de Limpieza Selectiva de Appwrite
 * 
 * Elimina SOLAMENTE los artículos identificados como "basura/placeholder".
 * Preserva cualquier artículo que parezca tener contenido real.
 * 
 * Ejecutar: node scripts/cleanup-poor-content.js
 */

const { Client, Databases, Query } = require('node-appwrite');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

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

async function cleanupContent() {
    console.log('🧹 Iniciando Limpieza Selectiva...');

    // Criterios de eliminación estricta
    const PLACEHOLDER_TEXT = 'Contenido migrado desde archivo estático.';
    const MIN_LENGTH = 100; // Si tiene menos de esto, es basura seguro

    let allDocuments = [];
    let offset = 0;
    const limit = 100;

    // 1. Fetch all documents
    console.log('📥 Descargando catálogo de artículos...');
    try {
        while (true) {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID,
                [
                    Query.limit(limit),
                    Query.offset(offset),
                    Query.select(['$id', 'title', 'content']) // Traemos solo lo necesario
                ]
            );

            allDocuments = [...allDocuments, ...response.documents];
            if (response.documents.length < limit) break;
            offset += limit;
        }
    } catch (error) {
        console.error('❌ Error al listar documentos:', error.message);
        process.exit(1);
    }

    console.log(`📊 Total analizados: ${allDocuments.length}`);

    // 2. Identify candidates for deletion
    const toDelete = [];
    const toKeep = [];

    for (const doc of allDocuments) {
        const content = doc.content || '';
        const isPlaceholder = content.includes(PLACEHOLDER_TEXT);
        const isTooShort = content.length < MIN_LENGTH;

        if (isPlaceholder || isTooShort) {
            toDelete.push({
                id: doc.$id,
                title: doc.title,
                reason: isPlaceholder ? 'Placeholder detectado' : `Muy corto (${content.length} chars)`
            });
        } else {
            toKeep.push({
                id: doc.$id,
                title: doc.title,
                length: content.length
            });
        }
    }

    console.log('\n--- Resumen de Acción ---');
    console.log(`✅ A PRESERVAR: ${toKeep.length} artículos (parecen tener contenido real)`);
    console.log(`🗑️ A ELIMINAR:  ${toDelete.length} artículos (placeholders o vacíos)`);

    if (toDelete.length === 0) {
        console.log('\n✨ Nada que limpiar. Todo parece correcto.');
        return;
    }

    // 3. Execute Deletion
    console.log('\n🚀 Ejecutando eliminación...');

    let deletedCount = 0;
    let errors = 0;

    for (const item of toDelete) {
        try {
            process.stdout.write(`   [${deletedCount + 1}/${toDelete.length}] Borrando ${item.id.substring(0, 20)}... `);
            await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, item.id);
            console.log('✓');
            deletedCount++;
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
            errors++;
        }
        // Pequeña pausa para no saturar la API
        await new Promise(r => setTimeout(r, 50));
    }

    console.log('\n=============================');
    console.log(`✨ Limpieza Completada`);
    console.log(`   Eliminados: ${deletedCount}`);
    console.log(`   Errores:    ${errors}`);
    console.log(`   Preservados: ${toKeep.length}`);
    console.log('=============================');
}

cleanupContent().catch(console.error);
