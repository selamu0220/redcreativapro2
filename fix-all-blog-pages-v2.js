const fs = require('fs');
const path = require('path');

const blogDir = path.join(process.cwd(), 'app', 'blog');
const categories = [
  { id: 'ia-educacion', name: 'IA en Educación' },
  { id: 'productividad', name: 'Productividad' },
  { id: 'tecnologia', name: 'Tecnología' },
  { id: 'creatividad', name: 'Creatividad' },
  { id: 'negocios', name: 'Negocios' }
];

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // 1. Fix nested H1 tags
    content = content.replace(/<h1[^>]*>([\s\S]*?)<h1[^>]*>[\s\S]*?<\/h1>\s*<\/h1>/g, '$1');

    // 2. Fix Breadcrumbs "Artículo no encontrado"
    // Find the post title from the file
    const idMatch = filePath.match(/blog[\\/]([^\\/]+)[\\/]page\.tsx/);
    const id = idMatch ? idMatch[1] : '';
    
    // Replace the hardcoded breadcrumb span
    content = content.replace(
        /<span className="text-foreground font-medium">Artículo no encontrado<\/span>/g,
        '<span className="text-foreground font-medium">{post.title}</span>'
    );

    // Fix category link in breadcrumbs
    content = content.replace(
        /<Link href="\/blog\?category=General" className="hover:text-blue-600 transition-colors">\s*General\s*<\/Link>/g,
        `<Link href={\`/blog?category=\${post.category}\`} className="hover:text-blue-600 transition-colors">
              {categories.find(c => c.id === post.category)?.name || 'General'}
            </Link>`
    );

    // 3. Fix Content Rendering
    // Many files have a local 'content' variable that is much more detailed than post.content
    if (content.includes('const content = `') && content.includes('dangerouslySetInnerHTML={{ __html: post.content }}')) {
        content = content.replace(
            /dangerouslySetInnerHTML={{ __html: post.content }}/g,
            `dangerouslySetInnerHTML={{ 
                __html: content.split('\\n\\n').map(p => {
                  if (p.startsWith('# ')) return \`<h1 class="text-3xl font-bold text-white mt-10 mb-6">\${p.replace('# ', '')}</h1>\`;
                  if (p.startsWith('## ')) return \`<h2 class="text-2xl font-bold text-white mt-8 mb-4">\${p.replace('## ', '')}</h2>\`;
                  if (p.startsWith('### ')) return \`<h3 class="text-xl font-bold text-white mt-6 mb-3">\${p.replace('### ', '')}</h3>\`;
                  if (p.startsWith('- ')) return \`<ul class="list-disc list-inside space-y-2 my-4">\${p.split('\\n').map(li => \`<li>\${li.replace('- ', '')}</li>\`).join('')}</ul>\`;
                  if (p.startsWith('**')) return \`<p class="font-bold my-4">\${p}</p>\`;
                  if (p.startsWith('\`\`\`')) return \`<pre class="bg-zinc-800 p-4 rounded-lg my-4 overflow-x-auto"><code>\${p.replace(/\`\`\`/g, '')}</code></pre>\`;
                  return \`<p class="mb-4">\${p.trim()}</p>\`;
                }).join('')
              }}`
        );
    }

    // 4. Wrap with ArticleWrapper if not already wrapped
    if (!content.includes('ArticleWrapper') && content.includes('dangerouslySetInnerHTML')) {
        // Add import
        if (!content.includes('import ArticleWrapper')) {
            content = 'import ArticleWrapper from "@/app/components/ArticleWrapper";\n' + content;
        }
        
        // Wrap the content div
        content = content.replace(
            /(<div className="prose[^>]*>[\s\S]*?)(<div\s+dangerouslySetInnerHTML[\s\S]*?<\/div>)([\s\S]*?<\/div>)/,
            '$1<ArticleWrapper>\n            $2\n          </ArticleWrapper>$3'
        );
    }

    // 5. Fix common styling issues
    content = content.replace(/text-gray-900/g, 'text-foreground');
    content = content.replace(/text-zinc-900/g, 'text-foreground');
    content = content.replace(/bg-white/g, 'bg-zinc-900');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        return true;
    }
    return false;
}

function walk(dir) {
    let count = 0;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            count += walk(fullPath);
        } else if (file === 'page.tsx' && fullPath.includes('app' + path.sep + 'blog') && !fullPath.includes('[id]')) {
            if (fixFile(fullPath)) {
                console.log(`Fixed: ${fullPath}`);
                count++;
            }
        }
    }
    return count;
}

console.log('Starting comprehensive blog fix...');
const totalFixed = walk(blogDir);
console.log(`Finished. Total files fixed: ${totalFixed}`);
