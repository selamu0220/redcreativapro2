/**
 * SEO Fix Script - Remove Phantom Blog IDs
 * Removes blog post entries that don't have physical pages
 * Run: node scripts/fix-phantom-blog-ids.js
 */

const fs = require('fs');
const path = require('path');

// IDs to remove (no physical page exists)
const PHANTOM_IDS = [
    'selamu',
    'ia-educacion',
    'investigacion-academica',
    'colaboracion-equipos',
    'metodologias-ia',
    'productividad',
    'automatizacion',
    'herramientas-ia',
    'flujos-trabajo',
    'tecnologia',
    'desarrollo-software',
    'integraciones',
    'apis-ia',
    'creatividad',
    'contenido-creativo',
    'diseno-ia',
    'marketing-digital',
    'negocios',
    'estrategia-empresarial',
    'analisis-datos',
    'transformacion-digital',
    'automatizacion-flujos-trabajo-ia-productividad',
    'desarrollo-software-integraciones-apis-ia',
    'estrategia-empresarial-transformacion-digital-ia',
    'herramientas-escritura-ia-redaccion-profesional',
    'guia-agentes-ia-automatizacion',
    'integrar-agentes-ia-saas-2025'
];

// IDs of orphan pages to add (exist but not in data)
const ORPHAN_PAGES = [
    'escritor-ia-guia-herramientas-redaccion-2025',
    'ia-copywriting-ventas-conversion-2025',
    'ia-para-marketing-de-contenidos',
    'ia-para-redes-sociales',
    'parafrasear-con-inteligencia-artificial',
    'plantilla-para-solicitudes-creativas-brief-ia',
    'plantillas-correos-ia-ecommerce-espanol',
    'plantillas-de-prompts-para-ia',
    'prompts-de-ia-para-tesis',
    'resumir-textos-con-ia',
    'seo-con-inteligencia-artificial',
    'traducir-textos-con-ia'
];

function cleanBlogData() {
    console.log('🔧 SEO Fix - Cleaning Phantom Blog IDs\n');
    console.log('='.repeat(50));

    const blogDataPath = path.join(process.cwd(), 'lib', 'blog-data.ts');
    let content = fs.readFileSync(blogDataPath, 'utf8');

    // Create backup
    const backupPath = blogDataPath + '.backup-' + Date.now();
    fs.writeFileSync(backupPath, content);
    console.log(`📦 Backup created: ${backupPath}`);

    let removedCount = 0;

    // For each phantom ID, remove the entire blog post object
    PHANTOM_IDS.forEach(id => {
        // Match pattern:   { id: 'phantom-id', ... }, (including nested content)
        // This is tricky because content spans multiple lines
        // We'll use a simpler approach: find the id and remove from {id: to the next },{ or }];

        const idPattern = new RegExp(`\\s*\\{[\\s\\S]*?id:\\s*['"]${id}['"][\\s\\S]*?\\}(?=,\\s*\\{|\\s*\\])`, 'g');
        const matches = content.match(idPattern);

        if (matches && matches.length > 0) {
            content = content.replace(idPattern, '');
            removedCount += matches.length;
            console.log(`🗑️  Removed: ${id} (${matches.length} occurrence(s))`);
        }
    });

    // Clean up any double commas that might result from removal
    content = content.replace(/,\s*,/g, ',');
    content = content.replace(/\[\s*,/g, '[');
    content = content.replace(/,\s*\]/g, ']');

    // Write cleaned content
    fs.writeFileSync(blogDataPath, content);

    console.log(`\n${'='.repeat(50)}`);
    console.log(`✅ Cleaned ${removedCount} phantom entries`);
    console.log(`📄 Updated: ${blogDataPath}`);

    // Re-run audit
    console.log('\n🔍 Running verification audit...\n');
}

cleanBlogData();
