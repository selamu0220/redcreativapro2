const fs = require('fs');
const path = require('path');

const blogDir = path.join(process.cwd(), 'app', 'blog');
const blogDataPath = path.join(process.cwd(), 'lib', 'blog-data.ts');

let blogData = fs.readFileSync(blogDataPath, 'utf8');

function extractContent(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Try to find the 'content' variable
    const contentMatch = fileContent.match(/const content = `([\s\S]*?)`;/);
    if (contentMatch) {
        return contentMatch[1].trim();
    }
    
    // Try to find what's inside <article> or similar if no 'content' variable
    const articleMatch = fileContent.match(/<article[^>]*>([\s\S]*?)<\/article>/);
    if (articleMatch) {
        // This is HTML, we might need to convert or just store it
        return articleMatch[1].trim();
    }
    
    return null;
}

const entries = fs.readdirSync(blogDir, { withFileTypes: true });
let updateCount = 0;

for (const entry of entries) {
    if (entry.isDirectory() && entry.name !== '[id]') {
        const pagePath = path.join(blogDir, entry.name, 'page.tsx');
        if (fs.existsSync(pagePath)) {
            const realContent = extractContent(pagePath);
            if (realContent && realContent.length > 200) {
                // Find the entry in blog-data.ts and replace its content
                const id = entry.name;
                const regex = new RegExp(`id: '${id}',[\\s\\S]*?content: (['"\`])[\\s\\S]*?\\1`, 'g');
                
                if (blogData.match(regex)) {
                    // Escape backticks in realContent for the template literal
                    const escapedContent = realContent.replace(/`/g, '\\`').replace(/\$/g, '\\$');
                    blogData = blogData.replace(regex, (match) => {
                        return match.replace(/content: (['"\`])[\\s\\S]*?\1/, `content: \`${escapedContent}\``);
                    });
                    console.log(`Updated content for: ${id}`);
                    updateCount++;
                }
            }
        }
    }
}

if (updateCount > 0) {
    fs.writeFileSync(blogDataPath, blogData);
    console.log(`Finished. Total articles updated in lib/blog-data.ts: ${updateCount}`);
} else {
    console.log('No articles were updated.');
}
