/**
 * SEO Audit Script - Synchronization Check
 * Compares blog-data.ts IDs with physical blog directories
 * Run: node scripts/audit-seo-sync.js
 */

const fs = require('fs');
const path = require('path');

function audit() {
    console.log('🔍 SEO Audit - Blog Sync Check\n');
    console.log('='.repeat(50));

    // 1. Get physical blog directories
    const blogDir = path.join(process.cwd(), 'app', 'blog');
    const physicalDirs = fs.readdirSync(blogDir)
        .filter(f => {
            const stat = fs.statSync(path.join(blogDir, f));
            return stat.isDirectory() &&
                !f.startsWith('[') &&
                !f.startsWith('sitemap') &&
                f !== 'debug-page.tsx';
        });

    console.log(`📁 Physical blog directories: ${physicalDirs.length}`);

    // 2. Extract IDs from blog-data.ts
    const blogDataPath = path.join(process.cwd(), 'lib', 'blog-data.ts');
    const content = fs.readFileSync(blogDataPath, 'utf8');

    // Match id: 'xxx' or id: "xxx"
    const idRegex = /id:\s*['"]([^'"]+)['"]/g;
    const ids = [];
    let match;
    while ((match = idRegex.exec(content)) !== null) {
        ids.push(match[1]);
    }
    const uniqueIds = [...new Set(ids)];

    console.log(`📝 Blog IDs in blog-data.ts: ${uniqueIds.length}`);

    // 3. Find mismatches
    const missingDirs = uniqueIds.filter(id => !physicalDirs.includes(id));
    const orphanDirs = physicalDirs.filter(dir => !uniqueIds.includes(dir));

    // 4. Report
    console.log('\n' + '='.repeat(50));
    console.log('⚠️  PROBLEMS FOUND:');
    console.log('='.repeat(50));

    if (missingDirs.length > 0) {
        console.log(`\n🔴 IDs in data but NO physical page (${missingDirs.length}):`);
        console.log('   These will cause 404 errors!');
        missingDirs.forEach(id => console.log(`   - ${id}`));
    } else {
        console.log('\n✅ All IDs in blog-data.ts have physical pages');
    }

    if (orphanDirs.length > 0) {
        console.log(`\n🟡 Physical pages NOT in blog-data.ts (${orphanDirs.length}):`);
        console.log('   These won\'t appear in sitemap');
        orphanDirs.forEach(dir => console.log(`   - ${dir}`));
    } else {
        console.log('\n✅ All physical pages are registered in blog-data.ts');
    }

    // 5. Estimate sitemap size
    console.log('\n' + '='.repeat(50));
    console.log('📊 SITEMAP ANALYSIS:');
    console.log('='.repeat(50));

    const languages = ['es', 'en', 'de', 'fr', 'zh', 'pt'];
    const staticPages = 24;
    const prompts = 40; // approximate

    const totalUrls = (staticPages + uniqueIds.length + prompts) * languages.length;
    console.log(`\nEstimated total sitemap URLs: ${totalUrls}`);
    console.log(`  - Static pages: ${staticPages} × ${languages.length} = ${staticPages * languages.length}`);
    console.log(`  - Blog posts: ${uniqueIds.length} × ${languages.length} = ${uniqueIds.length * languages.length}`);
    console.log(`  - Prompts: ~${prompts} × ${languages.length} = ${prompts * languages.length}`);

    if (missingDirs.length > 0) {
        const phantom404s = missingDirs.length * languages.length;
        console.log(`\n🔴 PHANTOM 404s FROM MISSING DIRS: ${phantom404s} URLs`);
    }

    // 6. Create JSON report
    const report = {
        timestamp: new Date().toISOString(),
        physicalDirs: physicalDirs.length,
        blogDataIds: uniqueIds.length,
        missingPhysicalPages: missingDirs,
        orphanPages: orphanDirs,
        estimatedSitemapUrls: totalUrls,
        estimatedPhantom404s: missingDirs.length * languages.length
    };

    const reportPath = path.join(process.cwd(), 'seo-sync-audit.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n✅ Report saved to: ${reportPath}`);

    return report;
}

audit();
