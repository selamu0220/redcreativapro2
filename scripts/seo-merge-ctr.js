const fs = require('fs')
const path = require('path')

function read(p) { return fs.readFileSync(p, 'utf8') }

function parseCsvLine(line) {
  const out = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') { inQuotes = !inQuotes; continue }
    if (ch === ',' && !inQuotes) { out.push(cur.trim()); cur = ''; continue }
    cur += ch
  }
  out.push(cur.trim())
  return out
}

function parseGaCsv(p) {
  const src = read(p).split(/\r?\n/).filter(Boolean)
  const header = parseCsvLine(src[0])
  const pathIdx = header.findIndex(h => /path|page/i.test(h))
  const ctrIdx = header.findIndex(h => /ctr/i.test(h))
  const rows = src.slice(1).map(line => parseCsvLine(line))
  const map = new Map()
  rows.forEach(cols => {
    const url = cols[pathIdx] || ''
    const ctr = (cols[ctrIdx] || '').replace('%','').trim()
    const m = url.match(/\/blog\/([^/?#]+)/)
    if (m) map.set(m[1], ctr)
  })
  return map
}

function parseSuggestions(p) {
  const src = read(p)
  const blocks = src.split(/\n##\s+/).slice(1)
  const data = {}
  blocks.forEach(b => {
    const lines = b.split('\n')
    const id = lines[0].trim()
    const titles = lines.filter(l => /^-\s*Title\s*\d+:/.test(l)).map(l => l.replace(/^-\s*Title\s*\d+:\s*/,''))
    const metas = lines.filter(l => /^-\s*Meta\s*\d+:/.test(l)).map(l => l.replace(/^-\s*Meta\s*\d+:\s*/,''))
    data[id] = { titles, metas }
  })
  return data
}

function run() {
  const root = process.cwd()
  const gaCsv = path.join(root, 'docs', 'seo', 'analytics', 'ga-pages.csv')
  const suggFile = path.join(root, 'docs', 'seo', 'analytics', 'title-suggestions.md')
  if (!fs.existsSync(gaCsv) || !fs.existsSync(suggFile)) {
    console.log('Faltan archivos: ga-pages.csv o title-suggestions.md')
    process.exit(1)
  }
  const ctrMap = parseGaCsv(gaCsv)
  const sugg = parseSuggestions(suggFile)
  const out = []
  out.push('# Sugerencias con CTR (GA)')
  out.push('')
  Object.keys(sugg).forEach(id => {
    const ctr = ctrMap.get(id) || 'N/A'
    out.push(`## ${id}`)
    out.push(`CTR: ${ctr}%`)
    sugg[id].titles.forEach((t,i) => out.push(`- Title ${i+1}: ${t}`))
    sugg[id].metas.forEach((m,i) => out.push(`- Meta ${i+1}: ${m}`))
    out.push('')
  })
  const outPath = path.join(root, 'docs', 'seo', 'analytics', 'title-suggestions-with-ctr.md')
  fs.writeFileSync(outPath, out.join('\n'))
  console.log('Generado:', outPath)
}

run()

