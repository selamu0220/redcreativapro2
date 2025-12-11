const fs = require('fs')
const path = require('path')

function loadFile(relPath) {
  const abs = path.join(process.cwd(), relPath)
  const content = fs.readFileSync(abs, 'utf8')
  return content
}

function extractCategories(source) {
  const catSectionMatch = source.match(/export const categories\s*=\s*\[([\s\S]*?)\];/)
  if (!catSectionMatch) return []
  const section = catSectionMatch[1]
  const cats = []
  const catRegex = /\{[\s\S]*?id:\s*'([^']+)'[\s\S]*?subcategories:\s*\[([\s\S]*?)\][\s\S]*?\}/g
  let m
  while ((m = catRegex.exec(section))) {
    const id = m[1]
    const subSec = m[2]
    const subs = []
    const subRegex = /\{\s*id:\s*'([^']+)'/g
    let sm
    while ((sm = subRegex.exec(subSec))) subs.push(sm[1])
    cats.push({ id, subcategories: subs })
  }
  return cats
}

function extractPosts(source) {
  const postsSectionMatch = source.match(/export const blogPosts\s*=\s*\[([\s\S]*?)\];/)
  if (!postsSectionMatch) return []
  const section = postsSectionMatch[1]
  const posts = []
  const postRegex = /\{[\s\S]*?id:\s*'([^']+)'[\s\S]*?title:\s*'([^']+)'[\s\S]*?publishedAt:\s*'([^']+)'[\s\S]*?category:\s*'([^']+)'[\s\S]*?(?:subcategory:\s*'([^']+)')?[\s\S]*?\}/g
  let m
  while ((m = postRegex.exec(section))) {
    posts.push({
      id: m[1],
      title: m[2],
      publishedAt: m[3],
      category: m[4],
      subcategory: m[5] || ''
    })
  }
  return posts
}

function main() {
  const blogData = loadFile('lib/blog-data.ts')
  const posts = extractPosts(blogData)
  const catsDef = extractCategories(blogData)
  const catIds = new Set(catsDef.map(c => c.id))
  const subIds = new Set(catsDef.flatMap(c => (c.subcategories || []).map(s => s.id)))

  const issues = []
  posts.forEach(p => {
    if (!catIds.has(p.category)) {
      issues.push(`Post ${p.id} usa categoría inexistente: ${p.category}`)
    }
    if (p.subcategory && !subIds.has(p.subcategory)) {
      issues.push(`Post ${p.id} usa subcategoría inexistente: ${p.subcategory}`)
    }
  })

  const outDir = path.join(process.cwd(), 'docs/seo/analytics')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const reportPath = path.join(outDir, 'taxonomy-report.md')

  const summary = `# Taxonomy Report\n\nTotal posts: ${posts.length}\n\nProblemas encontrados: ${issues.length}\n\n` + (issues.length ? issues.map(i => `- ${i}`).join('\n') : '- Sin problemas')
  fs.writeFileSync(reportPath, summary, 'utf8')
  console.log(`Taxonomy report written to ${reportPath}`)
}

main()
