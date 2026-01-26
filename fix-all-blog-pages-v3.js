const fs = require('fs');
const path = require('path');

const blogDir = path.join(process.cwd(), 'app', 'blog');
const wrapperImport = 'import ArticleWrapper from "@/app/components/ArticleWrapper";\n';

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    console.log(`Checking: ${filePath}`);

    // 1. Fix Breadcrumbs "Artículo no encontrado"
    if (content.includes('Artículo no encontrado')) {
        content = content.replace(
            /<span className="text-foreground font-medium">Artículo no encontrado<\/span>/g,
            '<span className="text-foreground font-medium">{metadata.title?.toString() || "Artículo"}</span>'
        );
        content = content.replace(
            /<span className="text-foreground font-medium">Workflows de Automatización ... \| Escritura Profesional 2025<\/span>/g,
            '<span className="text-foreground font-medium">{metadata.title?.toString() || "Artículo"}</span>'
        );
    }

    // 2. Fix nested H1 tags
    content = content.replace(/<h1[^>]*>([\s\S]*?)<h1[^>]*>[\s\S]*?<\/h1>\s*<\/h1>/g, '$1');

    // 3. Fix colors for dark mode
    content = content.replace(/text-gray-900/g, 'text-foreground');
    content = content.replace(/text-zinc-900/g, 'text-foreground');
    content = content.replace(/text-gray-800/g, 'text-zinc-300');
    content = content.replace(/text-zinc-800/g, 'text-zinc-300');
    content = content.replace(/bg-white/g, 'bg-zinc-900');
    content = content.replace(/bg-gray-50/g, 'bg-zinc-800/50');
    content = content.replace(/bg-zinc-50/g, 'bg-zinc-800/50');

    // 4. Ensure ArticleWrapper
    if (!content.includes('ArticleWrapper') && content.includes('<article')) {
        if (!content.includes('import ArticleWrapper')) {
            content = wrapperImport + content;
        }
        content = content.replace(
            /(<article[^>]*>)([\s\S]*?)(<\/article>)/,
            '<ArticleWrapper>\n        $1$2$3\n      </ArticleWrapper>'
        );
    }

    // 5. Fix Hydration issues in local RelatedArticles if any
    // Some pages might have copied the RelatedArticles code which has Math.random()
    if (content.includes('Math.random()')) {
        // If it's a local component definition, we need to add 'mounted' state
        if (content.includes('export default function RelatedArticles') || content.includes('const RelatedArticles =')) {
            if (!content.includes('useState(false)')) {
                content = content.replace(/export default function RelatedArticles\(\{/, 'export default function RelatedArticles({');
                content = content.replace(/export default function RelatedArticles\((.*?)\) \{/, (match, p1) => {
                    return `export default function RelatedArticles(${p1}) {\n  const [mounted, setMounted] = React.useState(false);\n  React.useEffect(() => { setMounted(true); }, []);`;
                });
                // Wrap the random elements
                content = content.replace(/{\[...Array\(getOptimizedParticleCount\(settings, 8\)\)\]\.map/g, '{mounted && [...Array(getOptimizedParticleCount(settings, 8))].map');
            }
        }
    }

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
        } else if (entry.name === 'page.tsx') {
            if (!fullPath.includes('[id]')) {
                if (fixFile(fullPath)) {
                    count++;
                }
            }
        }
    }
    return count;
}

console.log('Starting final comprehensive blog fix...');
const totalFixed = walk(blogDir);
console.log(`Finished. Total files fixed: ${totalFixed}`);
