const fs = require('fs-extra');
const path = require('path');

const STRAPI_URL = 'http://127.0.0.1:1337';
const STRAPI_API_TOKEN = 'a6445b348b15afdbc6e3979fe9533c8b0b60f6049c20b5862c5931bdb2c94946617acb81d67bc7c49bc3c53c5e5612007be7be6fbd43ea2078d2156915097b00a5954bae9e9a5d6eae6756f5b50882a2fa82bad11c31614735ca6a2833853e1d15463124934a8239f62b11b45db33351793ab554f023e3194a96d67ce52b2110';

const blogPath = path.join(__dirname, '..', '..', 'app', 'blog');

async function sync() {
  try {
    // 1. Get or create category
    let categoryId;
    const catRes = await fetch(`${STRAPI_URL}/api/categories?filters[slug][$eq]=ia-marketing`, {
      headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
    });
    const catData = await catRes.json();

    if (catData.data && catData.data.length > 0) {
      categoryId = catData.data[0].id;
    } else {
      const newCatRes = await fetch(`${STRAPI_URL}/api/categories`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            name: 'IA y Marketing',
            slug: 'ia-marketing',
            publishedAt: new Date()
          }
        })
      });
      const newCatData = await newCatRes.json();
      categoryId = newCatData.data.id;
    }

    // 2. Scan blog dirs
    const items = await fs.readdir(blogPath);
    for (const slug of items) {
      const pagePath = path.join(blogPath, slug, 'page.tsx');
      if (fs.existsSync(pagePath)) {
        const content = await fs.readFile(pagePath, 'utf8');
        
        const titleMatch = content.match(/title:\s*['"`]([^'"`]+)['"`]/);
        const title = titleMatch ? titleMatch[1].replace(' | Red Creativa Pro', '') : slug;
        
        const descMatch = content.match(/description:\s*['"`]([^'"`]+)['"`]/);
        const description = descMatch ? descMatch[1] : '';

        const articleContent = `## ${title}\n\n${description}\n\nEste contenido ha sido sincronizado desde los archivos locales.`;

        // Check if exists
        const existingRes = await fetch(`${STRAPI_URL}/api/articles?filters[slug][$eq]=${slug}`, {
          headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
        });
        const existingData = await existingRes.json();

        if (existingData.data && existingData.data.length === 0) {
          await fetch(`${STRAPI_URL}/api/articles`, {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              data: {
                title,
                slug,
                description,
                content: articleContent,
                category: categoryId,
                publishedAt: new Date()
              }
            })
          });
          console.log(`Created: ${slug}`);
        } else {
          console.log(`Skipped (exists): ${slug}`);
        }
      }
    }
    console.log('Sync finished');
  } catch (e) {
    console.error('Error syncing:', e);
  }
}

sync();
