const fs = require('fs')
const path = require('path')

function read(file) {
  return fs.readFileSync(file, 'utf8')
}

function parsePosts() {
  const file = path.join(process.cwd(), 'lib', 'blog-data.ts')
  const src = read(file)
  const blocks = src.split(/\},\s*\{/g)
  const posts = []
  const regex = {
    id: /id:\s*'([^']+)'/,
    title: /title:\s*'([^']+)'/,
    tags: /tags:\s*\[(.*?)\]/s,
    category: /category:\s*'([^']+)'/,
    seoDescription: /seoDescription:\s*'([^']+)'/
  }
  blocks.forEach(b => {
    const id = (b.match(regex.id) || [])[1]
    if (!id) return
    const title = (b.match(regex.title) || [])[1] || ''
    const category = (b.match(regex.category) || [])[1] || ''
    const seoDescription = (b.match(regex.seoDescription) || [])[1] || ''
    const tagsRaw = (b.match(regex.tags) || [])[1] || ''
    const tags = tagsRaw.split(',').map(s => s.replace(/['\s]/g, '')).filter(Boolean)
    posts.push({ id, title, category, tags, seoDescription })
  })
  return posts
}

function suggestTitle(p) {
  const t = p.tags.join(',').toLowerCase()
  const isEcomm = /ecommerce|moda|belleza|cabello|carrito/.test(t) || p.title.toLowerCase().includes('ecommerce')
  const isB2B = /saas|b2b|seguridad|ciso|secops/.test(t)
  const isEdu = p.category.includes('educacion') || /tesis|imryd|papers|universitario/.test(t)
  const base = p.title
  const titles = []
  if (isEcomm) {
    titles.push(base.replace(/\s*\[.*?\]\s*/,'') + ' [Guía Gratis]')
    titles.push('Cómo ' + base.toLowerCase().replace('cómo ','') + ' en español (paso a paso)')
    titles.push(base + ' (+ plantillas y ejemplos)')
  } else if (isB2B) {
    titles.push(base + ' (mejora apertura y reuniones)')
    titles.push('Playbook: ' + base + ' con IA [B2B]')
    titles.push(base + ' — casos y métricas en español')
  } else if (isEdu) {
    titles.push(base + ' [Plantilla y ejemplos]')
    titles.push('Guía ' + base + ' con IA (rigor y claridad)')
    titles.push(base + ' — evita errores y gana claridad')
  } else {
    titles.push(base)
    titles.push('Guía práctica: ' + base)
    titles.push(base + ' en español [Paso a paso]')
  }
  return titles
}

function suggestMeta(p) {
  const desc = p.seoDescription || p.title
  const metas = []
  metas.push((desc + ' en español. Beneficios claros y ejemplos listos.').slice(0,160))
  metas.push(('Aprende ' + desc.toLowerCase() + ' con IA. Mejora CTR y conversiones.').slice(0,160))
  metas.push(('Guía en español: ' + desc + '. Ver ejemplos y prompts.').slice(0,160))
  return metas
}

function run() {
  const posts = parsePosts()
  const out = []
  out.push('# Sugerencias de títulos y meta (CTR)')
  out.push('')
  posts.forEach(p => {
    out.push(`## ${p.id}`)
    out.push(`Título actual: ${p.title}`)
    const titles = suggestTitle(p)
    titles.forEach((t,i) => out.push(`- Title ${i+1}: ${t}`))
    const metas = suggestMeta(p)
    metas.forEach((m,i) => out.push(`- Meta ${i+1}: ${m}`))
    out.push('')
  })
  const file = path.join(process.cwd(), 'docs', 'seo', 'analytics', 'title-suggestions.md')
  fs.writeFileSync(file, out.join('\n'))
  console.log('Generado:', file)
}

run()

