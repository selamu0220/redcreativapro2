const fs = require('fs');
const path = require('path');

const blogDir = path.join(process.cwd(), 'app', 'blog');
const wrapperImport = 'import ArticleWrapper from "@/app/components/ArticleWrapper";\n';

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // 1. Fix nested/redundant H1 tags
    // Matches the pattern found in the files: <h1 ...>Title <h1 ...>Title </h1></h1>
    content = content.replace(/<h1[^>]*>([\s\S]*?)<h1[^>]*>[\s\S]*?<\/h1>\s*<\/h1>/g, (match, p1) => {
        return `<h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">${p1.trim()}</h1>`;
    });

    // Also remove any remaining redundant H1s after the first one in the header
    const headerMatch = content.match(/<header[^>]*>([\s\S]*?)<\/header>/);
    if (headerMatch) {
        let headerContent = headerMatch[1];
        const h1s = headerContent.match(/<h1[^>]*>[\s\S]*?<\/h1>/g);
        if (h1s && h1s.length > 1) {
            // Keep only the first H1
            let firstH1 = h1s[0];
            headerContent = headerContent.replace(/<h1[^>]*>[\s\S]*?<\/h1>/g, '');
            headerContent = headerContent + '\n              ' + firstH1;
            content = content.replace(headerMatch[0], `<header className="mb-8">${headerContent}</header>`);
        }
    }

    // 2. Wrap with ArticleWrapper
    if (!content.includes('ArticleWrapper')) {
        // Add import
        if (content.includes('import')) {
            content = content.replace(/import/, wrapperImport + 'import');
        } else {
            content = wrapperImport + content;
        }

        // Wrap the main article content
        content = content.replace(/<article[^>]*>([\s\S]*?)<\/article>/, (match, p1) => {
            return `<ArticleWrapper>\n        <article className="max-w-4xl mx-auto px-4 py-8">\n          ${p1}\n        </article>\n      </ArticleWrapper>`;
        });
    }

    // 3. Fix colors
    content = content.replace(/text-gray-900/g, 'text-foreground');
    content = content.replace(/text-gray-800/g, 'text-foreground');
    content = content.replace(/text-zinc-900/g, 'text-foreground');
    content = content.replace(/text-zinc-800/g, 'text-foreground');
    content = content.replace(/bg-white/g, 'bg-card');
    content = content.replace(/bg-gray-50/g, 'bg-muted');
    content = content.replace(/bg-zinc-50/g, 'bg-muted');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed: ${filePath}`);
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file === 'page.tsx' && fullPath.includes('app' + path.sep + 'blog')) {
            // Skip [id]/page.tsx as we fixed it manually
            if (!fullPath.includes('[id]')) {
                fixFile(fullPath);
            }
        }
    }
}

console.log('Starting blog fix...');
walk(blogDir);
console.log('Finished blog fix.');
