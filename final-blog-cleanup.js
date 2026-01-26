const fs = require('fs');
const path = require('path');

const blogDir = path.join(process.cwd(), 'app', 'blog');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // 1. Fix Breadcrumbs
    content = content.replace(
        /<span className="text-foreground font-medium">Artículo no encontrado<\/span>/g,
        '<span className="text-foreground font-medium">{metadata.title?.toString()}</span>'
    );
    
    // Fix category link
    content = content.replace(
        /<Link href="\/blog\?category=General" className="hover:text-blue-600 transition-colors">\s*General\s*<\/Link>/g,
        `<Link href="/blog?category=ia" className="hover:text-primary transition-colors">
              Inteligencia Artificial
            </Link>`
    );

    // 2. Fix hydration in local components (if any)
    if (content.includes('Math.random()') && !content.includes('const [mounted')) {
        content = content.replace(
            /export default function (\w+)\((.*?)\) \{/,
            (match, name, params) => {
                if (content.includes('useState')) {
                    return `export default function ${name}(${params}) {\n  const [mounted, setMounted] = useState(false);\n  useEffect(() => { setMounted(true); }, []);`;
                }
                return match;
            }
        );
    }

    // 3. Cleanup redundant H1s
    content = content.replace(/<h1[^>]*>([\s\S]*?)<h1[^>]*>[\s\S]*?<\/h1>\s*<\/h1>/g, '$1');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        return true;
    }
    return false;
}

function walk(dir) {
    let count = 0;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            count += walk(fullPath);
        } else if (entry.name === 'page.tsx' && !fullPath.includes('[id]')) {
            if (fixFile(fullPath)) {
                count++;
            }
        }
    }
    return count;
}

console.log('Final cleanup of blog pages...');
const totalFixed = walk(blogDir);
console.log(`Finished. Total pages cleaned up: ${totalFixed}`);
