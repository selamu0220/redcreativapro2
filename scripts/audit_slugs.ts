import { blogPosts } from '../lib/blog-data';
import * as fs from 'fs';
import * as path from 'path';

// Extract the manual list from sitemap.ts content (since we can't easily import the file due to Next.js specific imports like MetadataRoute)
const sitemapPath = path.join(process.cwd(), 'app', 'sitemap.ts');
const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

const match = sitemapContent.match(/const VALID_BLOG_SLUGS = new Set\(\[([\s\S]*?)\]\);/);

if (!match) {
    console.error("Could not find VALID_BLOG_SLUGS in sitemap.ts");
    process.exit(1);
}

const rawList = match[1];
// Parse the list items
const sitemapSlugs = rawList
    .split(',')
    .map(s => s.trim().replace(/['"]/g, ''))
    .filter(s => s.length > 0);

const blogDataSlugs = blogPosts.map(p => p.id);

console.log(`Total posts in blog-data.ts: ${blogDataSlugs.length}`);
console.log(`Total slugs in sitemap.ts whitelist: ${sitemapSlugs.length}`);

// Find slugs in Sitemap but NOT in Data (These cause 404s if sitemap links them but data doesn't exist)
const inSitemapNotInData = sitemapSlugs.filter(s => !blogDataSlugs.includes(s));
console.log(`\n[CRITICAL] Slugs in Sitemap Whitelist but MISSING in Blog Data (${inSitemapNotInData.length}):`);
inSitemapNotInData.forEach(s => console.log(` - ${s}`));

// Find slugs in Data but NOT in Sitemap (These are not indexed pages)
const inDataNotInSitemap = blogDataSlugs.filter(s => !sitemapSlugs.includes(s));
console.log(`\n[INFO] Slugs in Blog Data but EXCLUDED from Sitemap (${inDataNotInSitemap.length}):`);
inDataNotInSitemap.forEach(s => console.log(` - ${s}`));

// Check for duplicates in data
const duplicates = blogDataSlugs.filter((item, index) => blogDataSlugs.indexOf(item) !== index);
console.log(`\n[WARNING] Duplicate IDs in blog-data.ts (${duplicates.length}):`);
duplicates.forEach(s => console.log(` - ${s}`));
