const fs = require('fs')
const path = require('path')

function arg(k) {
  const a = process.argv.slice(2)
  for (const x of a) {
    const [key, val] = x.split('=')
    if (key === `--${k}`) return val
  }
  return null
}

function read(p) { return fs.readFileSync(p, 'utf8') }
function write(p, c) { fs.writeFileSync(p, c) }

function loadSuggestions() {
  const file = path.join(process.cwd(), 'docs', 'seo', 'analytics', 'title-suggestions.md')
  const src = read(file)
  const blocks = src.split(/\n##\s+/).slice(1)
  const map = {}
  blocks.forEach(b => {
    const lines = b.split('\n')
    const id = lines[0].trim()
    const titles = lines.filter(l => /^-\s*Title\s*\d+:/.test(l)).map(l => l.replace(/^-\s*Title\s*\d+:\s*/,''))
    const metas = lines.filter(l => /^-\s*Meta\s*\d+:/.test(l)).map(l => l.replace(/^-\s*Meta\s*\d+:\s*/,''))
    map[id] = { titles, metas }
  })
  return map
}

function updateMetadata(filePath, newTitle, newDesc) {
  let src = read(filePath)
  src = src.replace(/title:\s*'[^']*'\s*\|\s*Red Creativa Pro|title:\s*'[^']*'/, `title: '${newTitle} | Red Creativa Pro'`)
  src = src.replace(/description:\s*'[^']*'/, `description: '${newDesc}'`)
  src = src.replace(/openGraph:\s*\{[\s\S]*?title:\s*'[^']*'/, m => m.replace(/title:\s*'[^']*'/, `title: '${newTitle} | Red Creativa Pro'`))
  src = src.replace(/openGraph:\s*\{[\s\S]*?description:\s*'[^']*'/, m => m.replace(/description:\s*'[^']*'/, `description: '${newDesc}'`))
  src = src.replace(/twitter:\s*\{[\s\S]*?title:\s*'[^']*'/, m => m.replace(/title:\s*'[^']*'/, `title: '${newTitle}'`))
  src = src.replace(/twitter:\s*\{[\s\S]*?description:\s*'[^']*'/, m => m.replace(/description:\s*'[^']*'/, `description: '${newDesc}'`))
  write(filePath, src)
}

function run() {
  const id = arg('id')
  const tIdx = parseInt(arg('titleIndex') || '1', 10) - 1
  const mIdx = parseInt(arg('metaIndex') || '1', 10) - 1
  const apply = arg('apply') === 'true'
  if (!id) {
    console.log('Uso: npm run seo:apply:suggest -- --id=slug --titleIndex=1..3 --metaIndex=1..3 --apply=true')
    process.exit(1)
  }
  const sugg = loadSuggestions()
  const s = sugg[id]
  if (!s) { console.log('No hay sugerencias para', id); process.exit(1) }
  const newTitle = s.titles[tIdx] || s.titles[0]
  const newDesc = s.metas[mIdx] || s.metas[0]
  console.log('Seleccionado Title:', newTitle)
  console.log('Seleccionado Meta:', newDesc)
  const filePath = path.join(process.cwd(), 'app', 'blog', id, 'page.tsx')
  if (!fs.existsSync(filePath)) { console.log('No existe página:', filePath); process.exit(1) }
  if (!apply) {
    console.log('Vista previa. Añade --apply=true para aplicar cambios.')
    process.exit(0)
  }
  updateMetadata(filePath, newTitle, newDesc)
  console.log('Actualizado:', filePath)
}

run()

