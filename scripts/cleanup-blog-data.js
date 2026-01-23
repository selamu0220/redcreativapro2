/**
 * Blog Data Cleanup Script
 * 
 * Issues to fix:
 * 1. Remove duplicate article IDs (keep second occurrence which is usually more complete)
 * 2. Remove content wrapper: content: `\`\`\`markdown ... \`\`\``
 */

const fs = require('fs');
const path = require('path');

const blogDataPath = path.join(__dirname, '..', 'lib', 'blog-data.ts');

let content = fs.readFileSync(blogDataPath, 'utf-8');

// 1. Fix markdown wrapper in content
// Pattern: content: `\`\`\`markdown\n ... \n\`\`\``
// Replace with: content: ` ... `
// We need to find all instances where content starts with ```markdown and ends with ```

// This regex matches content: `\`\`\`markdown followed by content until closing \`\`\``
// We're using a simpler approach: replace the opening and closing markers

// Remove opening wrapper
content = content.replace(/content: `\\`\\`\\`markdown\n/g, 'content: `');

// Remove closing wrapper - this is trickier because we need to match the right closing
// The pattern is: \`\`\`` (three backticks followed by closing backtick of template literal)
content = content.replace(/\\`\\`\\``,/g, '`,');

// Also handle alternate escaping pattern if present
content = content.replace(/content: `\`\`\`markdown\n/g, 'content: `');
content = content.replace(/\`\`\``,/g, '`,');

// 2. Find and list duplicate IDs
const idMatches = [...content.matchAll(/id:\s*['"]([^'"]+)['"]/g)];
const idCounts = {};
const duplicates = [];

for (const match of idMatches) {
    const id = match[1];
    if (idCounts[id]) {
        duplicates.push(id);
    } else {
        idCounts[id] = true;
    }
}

console.log('=== DUPLICATE IDs FOUND ===');
console.log(duplicates.join('\n'));
console.log(`\nTotal duplicates: ${duplicates.length}`);

// 3. Write cleaned file
fs.writeFileSync(blogDataPath + '.backup', fs.readFileSync(blogDataPath)); // backup
fs.writeFileSync(blogDataPath, content);

console.log('\n✅ Cleanup complete. Backup saved as blog-data.ts.backup');
console.log('⚠️  MANUAL STEP REQUIRED: Remove duplicate articles from blog-data.ts');
