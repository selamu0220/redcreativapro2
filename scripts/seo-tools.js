const fs = require('fs')
const path = require('path')

function getProjectRoot() {
  return process.cwd()
}

function readFile(p) {
  return fs.readFileSync(p, 'utf8')
}

function listBlogIds() {
  const root = getProjectRoot()
  const file = path.join(root, 'lib', 'blog-data.ts')
  const content = readFile(file)
  const ids = Array.from(content.matchAll(/id:\s*'([^']+)'/g)).map(m => m[1])
  return Array.from(new Set(ids))
}

function outputList() {
  const ids = listBlogIds()
  const domain = 'https://redcreativa.pro'
  const local = 'http://localhost:3002'
  console.log('Total:', ids.length)
  console.log('URLs:')
  ids.forEach(id => {
    console.log(`${domain}/blog/${id}`)
  })
  console.log('Local preview:')
  ids.forEach(id => {
    console.log(`${local}/blog/${id}`)
  })
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  let files = []
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) {
      files = files.concat(walk(p))
    } else {
      files.push(p)
    }
  }
  return files
}

function outputPromote() {
  const root = getProjectRoot()
  const socialDir = path.join(root, 'docs', 'seo', 'social')
  const pinsDir = path.join(root, 'docs', 'seo', 'pins')
  const socialFiles = walk(socialDir).filter(f => f.endsWith('.md'))
  const pinFiles = walk(pinsDir).filter(f => f.endsWith('.md'))
  console.log('Social threads:')
  socialFiles.forEach(f => console.log(f))
  console.log('Pinterest pins:')
  pinFiles.forEach(f => console.log(f))
}

function generateUrlsDoc() {
  const ids = listBlogIds()
  const domain = 'https://redcreativa.pro'
  const lines = ['# URLs generadas para Search Console', '']
  ids.forEach(id => {
    lines.push(`${domain}/blog/${id}`)
  })
  const root = getProjectRoot()
  const out = path.join(root, 'docs', 'seo', 'search-console', 'generated-urls.md')
  fs.writeFileSync(out, lines.join('\n'))
  console.log('Generado:', out)
}

const cmd = process.argv[2]
if (cmd === 'list') {
  outputList()
} else if (cmd === 'promote') {
  outputPromote()
} else if (cmd === 'gen') {
  generateUrlsDoc()
} else {
  console.log('Uso: node scripts/seo-tools.js [list|promote|gen]')
}

