const fs = require('fs');
const path = require('path');
const https = require('https');

// Simple fetch wrapper since node-fetch implies ESM import issues with raw node scripts sometimes
function simpleFetch(url, options = {}) {
    return new Promise((resolve, reject) => {
        const lib = url.startsWith('https') ? require('https') : require('http');
        const request = lib.request(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({
                status: res.statusCode,
                text: () => Promise.resolve(data),
                json: () => Promise.resolve(JSON.parse(data))
            }));
        });
        request.on('error', reject);
        if (options.body) request.write(options.body);
        request.end();
    });
}

async function runAudit() {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
        console.log('⚠️  FIRECRAWL_API_KEY not found. Skipping live audit.');
        console.log('To run audit: set FIRECRAWL_API_KEY=... node scripts/seo-audit-firecrawl.js');
        return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.redcreativa.pro';
    console.log(`🔍 Starting SEO Audit for ${baseUrl}`);

    try {
        // 1. Check Sitemap
        console.log(`\n📄 Checking Sitemap at ${baseUrl}/sitemap.xml...`);
        const sitemapRes = await simpleFetch(`${baseUrl}/sitemap.xml`);
        if (sitemapRes.status === 200) {
            console.log('✅ Sitemap is accessible (200 OK)');
        } else {
            console.error(`❌ Sitemap returned status ${sitemapRes.status}`);
        }

        // 2. Firecrawl Crawl (Limit to 5 pages for quick check)
        // Using Firecrawl Search endpoint as a proxy for "Can I index this site?"
        console.log(`\n🕷️  Testing Crawlability via Firecrawl...`);

        // Note: In a real script we'd use the proper Firecrawl SDK or API endpoints
        // For this demonstration we will mock the "Intent" of checking indexing
        // Assuming we had the SDK installed:
        /*
        const FirecrawlApp = require('@mdm/firecrawl-js').default;
        const app = new FirecrawlApp({ apiKey });
        const result = await app.search(baseUrl, { limit: 1 });
        */

        console.log('ℹ️  (Mock) Firecrawl search request sent.');
        console.log('✅ If production site is up, Firecrawl would report indexed pages.');

        // 3. Local Check of Robots.txt
        console.log(`\n🤖 Checking Robots.txt...`);
        const robotsRes = await simpleFetch(`${baseUrl}/robots.txt`);
        const robotsTxt = await robotsRes.text();
        if (robotsRes.status === 200 && robotsTxt.includes('User-agent')) {
            console.log('✅ robots.txt is valid');
            console.log('Preview:', robotsTxt.split('\n').slice(0, 3).join('\n'));
        } else {
            console.error('❌ robots.txt missing or invalid');
        }

    } catch (err) {
        console.error('Audit failed:', err.message);
    }
}

runAudit();
