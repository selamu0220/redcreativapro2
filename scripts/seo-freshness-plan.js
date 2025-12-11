const fs = require('fs')
const path = require('path')

function load(rel) {
  return fs.readFileSync(path.join(process.cwd(), rel), 'utf8')
}

function extractPosts(src) {
  const m = src.match(/export const blogPosts\s*=\s*\[([\s\S]*?)\];/)
  if (!m) return []
  const section = m[1]
  const posts = []
  const postRegex = /\{[\s\S]*?id:\s*'([^']+)'[\s\S]*?title:\s*'([^']+)'[\s\S]*?publishedAt:\s*'([^']+)'[\s\S]*?\}/g
  let pm
  while ((pm = postRegex.exec(section))) {
    posts.push({ id: pm[1], title: pm[2], publishedAt: pm[3] })
  }
  return posts
}

function daysSince(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - d.getTime()) / (1000*60*60*24))
}

function main() {
  const src = load('lib/blog-data.ts')
  const posts = extractPosts(src)
  const threshold = 90
  const candidates = posts
    .filter(p => p.publishedAt && daysSince(p.publishedAt) >= threshold)
    .sort((a,b) => daysSince(b.publishedAt) - daysSince(a.publishedAt))

  const lines = []
  lines.push(`# Freshness Plan`)
  lines.push('')
  lines.push(`Umbral: ${threshold} días`)
  lines.push('')
  if (candidates.length === 0) {
    lines.push('- No hay candidatos para actualización')
  } else {
    candidates.forEach(p => {
      lines.push(`- ${p.title} (${p.id}) — ${daysSince(p.publishedAt)} días`) 
      lines.push(`  - Acciones: actualizar ejemplos, añadir FAQ, mejorar enlaces internos, revisar metadatos`) 
    })
  }

  const outDir = path.join(process.cwd(), 'docs/seo/analytics')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'freshness-plan.md'), lines.join('\n'), 'utf8')
  console.log('Freshness plan written to docs/seo/analytics/freshness-plan.md')
}

main()
