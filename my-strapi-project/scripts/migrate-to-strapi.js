'use strict';

const fs = require('fs-extra');
const path = require('path');

// Root of the project (two levels up from my-strapi-project/scripts)
const rootPath = path.join(__dirname, '..', '..');
const blogPath = path.join(rootPath, 'app', 'blog');

async function migrateArticles() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  console.log('Starting Strapi to migrate articles...');
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

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
      console.log('Created category: IA y Marketing');
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

    console.log(`Found ${blogDirs.length} blog posts to migrate.`);

    for (const slug of blogDirs) {
      const pagePath = path.join(blogPath, slug, 'page.tsx');
      const content = await fs.readFile(pagePath, 'utf8');

      // Extract metadata
      const titleMatch = content.match(/title:\s*['"`]([^'"`]+)['"`]/);
      const title = titleMatch ? titleMatch[1].replace(' | Red Creativa Pro', '').replace(/ | Guía Completa 2025/g, '') : slug;

      const descMatch = content.match(/description:\s*['"`]([^'"`]+)['"`]/);
      const description = descMatch ? descMatch[1].substring(0, 80) : '';

      // Check if article already exists
      const existing = await strapi.documents('api::article.article').findFirst({
        where: { slug }
      });

      if (existing) {
        console.log(`Skipping ${slug} (already exists)`);
        continue;
      }

      // Prepare blocks (simple rich text for now)
      // In a real migration we'd parse the JSX, but for now we'll use a placeholder or the extracted description
      const blocks = [
        {
          __component: 'shared.rich-text',
          body: `## ${title}\n\n${descMatch ? descMatch[1] : 'Contenido en migración...'}\n\nEste artículo ha sido migrado automáticamente desde el sistema local.`
        }
      ];

      await strapi.documents('api::article.article').create({
        data: {
          title,
          slug,
          description,
          category: category.id,
          blocks,
          publishedAt: new Date(),
        }
      });

      console.log(`Migrated: ${title} (${slug})`);
    }

    // Set public permissions if they aren't set
    const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
      where: { type: 'public' },
    });

    const permissions = ['find', 'findMany', 'findOne'];
    for (const action of permissions) {
      const existingPermission = await strapi.query('plugin::users-permissions.permission').findOne({
        where: {
          action: `api::article.article.${action}`,
          role: publicRole.id,
        },
      });

      if (!existingPermission) {
        await strapi.query('plugin::users-permissions.permission').create({
          data: {
            action: `api::article.article.${action}`,
            role: publicRole.id,
          },
        });
      }
    }

    console.log('Permissions updated for public role.');
    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await app.destroy();
    process.exit(0);
  }
}

migrateArticles();
