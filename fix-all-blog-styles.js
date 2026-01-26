const fs = require('fs');
const path = require('path');

const blogDir = path.join(process.cwd(), 'app/blog');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('page.tsx')) results.push(file);
    }
  });
  return results;
}

const files = walk(blogDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace problematic background classes
  content = content.replace(/bg-(blue|zinc|gray|slate|amber|emerald|indigo|purple|red|orange)-50/g, 'bg-black/5');
  content = content.replace(/text-(zinc|gray|slate)-(400|500|600|700|800|900)/g, 'text-foreground');
  content = content.replace(/text-foreground\/[0-9]{2}/g, 'text-foreground');
  
  // Ensure blog-article class is present
  if (content.includes('<article') && !content.includes('blog-article')) {
    content = content.replace('<article', '<article className="blog-article"');
  } else if (content.includes('className="max-w-4xl mx-auto') && !content.includes('blog-article')) {
    content = content.replace('className="max-w-4xl mx-auto', 'className="blog-article max-w-4xl mx-auto');
  }

  // Standardize callouts if they look like the old ones
  content = content.replace(/bg-white shadow-sm border border-zinc-100/g, 'bg-zinc-900 shadow-lg');
  
  fs.writeFileSync(file, content);
});

console.log(`Processed ${files.length} blog files.`);
