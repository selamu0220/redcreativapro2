import { algoliasearch } from 'algoliasearch';
import dotenv from 'dotenv';
import { blogPosts } from '../lib/blog-data.ts';

dotenv.config();

const APP_ID = process.env.ALGOLIA_APP_ID;
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_API_KEY;

if (!APP_ID || !ADMIN_KEY) {
  console.error('Missing Algolia environment variables');
  process.exit(1);
}

const client = algoliasearch(APP_ID, ADMIN_KEY);

const indexName = 'blog_posts';

async function indexData() {
  try {
    const objects = blogPosts.map((post) => ({
      objectID: post.id,
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      subcategory: post.subcategory,
      author: post.author,
      publishedAt: post.publishedAt,
      tags: post.tags,
      image: post.image,
      slug: post.id,
    }));

    console.log(`Indexing ${objects.length} posts to Algolia index "${indexName}"...`);
    
    await client.saveObjects({
      indexName,
      objects,
    });

    console.log('Successfully indexed data to Algolia!');
  } catch (error) {
    console.error('Error indexing data:', error);
    process.exit(1);
  }
}

indexData();
