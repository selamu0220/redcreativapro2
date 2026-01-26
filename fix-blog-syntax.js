const fs = require('fs');
const path = require('path');

const blogDir = path.join(process.cwd(), 'app', 'blog');
const dirs = fs.readdirSync(blogDir).filter(f => fs.statSync(path.join(blogDir, f)).isDirectory());

console.log(`Checking ${dirs.length} blog directories...`);

dirs.forEach(dir => {
    const pagePath = path.join(blogDir, dir, 'page.tsx');
    if (fs.existsSync(pagePath)) {
        let content = fs.readFileSync(pagePath, 'utf8');
        
        // Count <div and </div
        const openDivs = (content.match(/<div/g) || []).length;
        const closeDivs = (content.match(/<\/div/g) || []).length;
        
        if (openDivs !== closeDivs) {
            console.log(`Fixing ${dir}: ${openDivs} open, ${closeDivs} close`);
            
            // Find the last </article>
            const articleEndIndex = content.lastIndexOf('</article>');
            if (articleEndIndex !== -1) {
                const diff = openDivs - closeDivs;
                if (diff > 0) {
                    const extraClosings = '</div>\n'.repeat(diff);
                    content = content.slice(0, articleEndIndex) + extraClosings + content.slice(articleEndIndex);
                    fs.writeFileSync(pagePath, content);
                    console.log(`  Added ${diff} missing </div> tags.`);
                }
            }
        }
        
        // Also check for common "Expected </, got 'jsx text (" error pattern
        // This often happens if there's text after the last </div> before </article>
        // or if the structure is just broken at the end.
    }
});
