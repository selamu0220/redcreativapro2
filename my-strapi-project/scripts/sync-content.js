'use strict';

const fs = require('fs-extra');
const path = require('path');

// Root of the project (two levels up from my-strapi-project/scripts)
const rootPath = path.join(__dirname, '..', '..');
const blogPath = path.join(rootPath, 'app', 'blog');

async function migrateArticles() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  console.log('Starting Strapi to sync content field...');
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  try {
    // 1. Get or create a default category
    let category = await strapi.documents('api::category.category').findFirst({
      where: { slug: 'ia-marketing' }
    });

    if (!category) {
      category = await strapi.documents('api::category.category').create({
        data: {
          name: 'IA y Marketing',
          slug: 'ia-marketing',
          description: 'Artículos sobre IA y Marketing Digital',
          publishedAt: new Date(),
        }
      });
    }

    // 2. Scan blog directory
    const items = await fs.readdir(blogPath);
    const blogDirs = [];

    for (const item of items) {
      const itemPath = path.join(blogPath, item);
      if (fs.statSync(itemPath).isDirectory() && fs.existsSync(path.join(itemPath, 'page.tsx'))) {
        blogDirs.push(item);
      }
    }

    console.log(`Found ${blogDirs.length} blog posts to sync.`);

    for (const slug of blogDirs) {
      const pagePath = path.join(blogPath, slug, 'page.tsx');
      const fileContent = await fs.readFile(pagePath, 'utf8');

      // Extract metadata
      const titleMatch = fileContent.match(/title:\s*['"`]([^'"`]+)['"`]/);
      const title = titleMatch ? titleMatch[1].replace(' | Red Creativa Pro', '').replace(/ | Guía Completa 2025/g, '') : slug;

      const descMatch = fileContent.match(/description:\s*['"`]([^'"`]+)['"`]/);
      const description = descMatch ? descMatch[1].substring(0, 80) : '';

      // Prepare text content
      const contentText = `## ${title}\n\n${descMatch ? descMatch[1] : 'Contenido en migración...'}\n\nEste artículo ha sido migrado para ser servido desde Strapi.`;

      // Check if article already exists
      const existing = await strapi.documents('api::article.article').findFirst({
        where: { slug }
      });

      if (existing) {
        // Update existing article with content field
        await strapi.documents('api::article.article').update({
          documentId: existing.documentId,
          data: {
            content: contentText,
            // Also ensure blocks are there
            blocks: [
              {
                __component: 'shared.rich-text',
                body: contentText
              }
            ]
          }
        });
        console.log(`Updated: ${slug}`);
      } else {
        // Create new
        await strapi.documents('api::article.article').create({
          data: {
            title,
            slug,
            description,
            category: category.id,
            content: contentText,
            blocks: [
              {
                __component: 'shared.rich-text',
                body: contentText
              }
            ],
            publishedAt: new Date(),
          }
        });
        console.log(`Created: ${slug}`);
      }
    }

    console.log('Sync completed successfully!');

  } catch (error) {
    console.error('Sync failed:', error);
  } finally {
    await app.destroy();
    process.exit(0);
  }
}

migrateArticles();
