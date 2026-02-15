const fs = require('fs');
const path = require('path');

const blogsDir = path.join(process.cwd(), 'blogs');
const siteUrl = 'https://redcreativa.pro';

// Leer todas las carpetas de blogs
const blogFolders = fs.readdirSync(blogsDir)
  .filter(folder => fs.statSync(path.join(blogsDir, folder)).isDirectory());

console.log(`Encontrados ${blogFolders.length} blogs:`);

// Generar URLs
const urls = blogFolders.map(folder => {
  const postPath = path.join(blogsDir, folder, 'post.md');
  
  if (!fs.existsSync(postPath)) {
    console.log(`  - ${folder}: SIN post.md`);
    return null;
  }
  
  const content = fs.readFileSync(postPath, 'utf8');
  
  // Extraer slug
  const slugMatch = content.match(/\*\*Slug:\*\*\s*(.+)/);
  const slug = slugMatch ? slugMatch[1].trim() : folder;
  
  // Extraer fecha
  const dateMatch = content.match(/\*\*Fecha:\*\*\s*(.+)/);
  const date = dateMatch ? dateMatch[1].trim() : new Date().toISOString().split('T')[0];
  
  console.log(`  - ${folder}: /blog/${slug}`);
  
  return {
    loc: `${siteUrl}/blog/${slug}`,
    lastmod: date,
    changefreq: 'weekly',
    priority: '0.8',
  };
}).filter(Boolean);

// Generar XML
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

// Guardar
const outputPath = path.join(process.cwd(), 'public', 'sitemap-blogs.xml');
fs.writeFileSync(outputPath, xml);

console.log(`\n✅ Sitemap generado: ${outputPath}`);
console.log(`📊 Total URLs: ${urls.length}`);
