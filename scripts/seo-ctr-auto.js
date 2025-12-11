const fs = require('fs')
const path = require('path')

function read(p) { return fs.readFileSync(p, 'utf8') }
function write(p, c) { fs.writeFileSync(p, c) }
function arg(k, def) { const a = process.argv.slice(2); for (const x of a) { const [key, val] = x.split('='); if (key === `--${k}`) return val } return def }

function parseCsvLine(line) { const out = []; let cur = ''; let inQ = false; for (let i=0;i<line.length;i++){const ch=line[i]; if(ch==='"'){inQ=!inQ;continue} if(ch===','&&!inQ){out.push(cur.trim()); cur=''; continue} cur+=ch} out.push(cur.trim()); return out }

function parseGaCsv(p) { const src = read(p).split(/\r?\n/).filter(Boolean); const header = parseCsvLine(src[0]); const pathIdx = header.findIndex(h=>/path|page/i.test(h)); const ctrIdx = header.findIndex(h=>/ctr/i.test(h)); const rows = src.slice(1).map(parseCsvLine); const map = new Map(); rows.forEach(cols=>{ const url = cols[pathIdx]||''; const ctr = (cols[ctrIdx]||'').replace('%','').trim(); const m = url.match(/\/blog\/([^/?#]+)/); if(m) map.set(m[1], parseFloat(ctr||'0')) }); return map }

function parsePosts() { const file = path.join(process.cwd(),'lib','blog-data.ts'); const src = read(file); const blocks = src.split(/\},\s*\{/g); const posts=[]; const regex={id:/id:\s*'([^']+)'/, title:/title:\s*'([^']+)'/, tags:/tags:\s*\[(.*?)\]/s, category:/category:\s*'([^']+)'/, seoDescription:/seoDescription:\s*'([^']+)'/, publishedAt:/publishedAt:\s*'([^']+)'/}; blocks.forEach(b=>{ const id=(b.match(regex.id)||[])[1]; if(!id) return; const title=(b.match(regex.title)||[])[1]||''; const category=(b.match(regex.category)||[])[1]||''; const seoDescription=(b.match(regex.seoDescription)||[])[1]||''; const publishedAt=(b.match(regex.publishedAt)||[])[1]||''; const tagsRaw=(b.match(regex.tags)||[])[1]||''; const tags=tagsRaw.split(',').map(s=>s.replace(/['\s]/g,'')).filter(Boolean); posts.push({id,title,category,tags,seoDescription,publishedAt}) }); return posts }

function suggestTitle(p) { const t=p.tags.join(',').toLowerCase(); const isE=/ecommerce|moda|belleza|cabello|carrito/.test(t)||p.title.toLowerCase().includes('ecommerce'); const isB=/saas|b2b|seguridad|ciso|secops/.test(t); const isEd=p.category.includes('educacion')||/tesis|imryd|papers|universitario/.test(p.title.toLowerCase()); const base=p.title; const titles=[]; if(isE){ titles.push(base.replace(/\s*\[.*?\]\s*/,'')+' [Guía Gratis]'); titles.push('Cómo '+base.toLowerCase().replace('cómo ','')+' en español (paso a paso)'); titles.push(base+' (+ plantillas y ejemplos)') } else if(isB){ titles.push(base+' (mejora apertura y reuniones)'); titles.push('Playbook: '+base+' con IA [B2B]'); titles.push(base+' — casos y métricas en español') } else if(isEd){ titles.push(base+' [Plantilla y ejemplos]'); titles.push('Guía '+base+' con IA (rigor y claridad)'); titles.push(base+' — evita errores y gana claridad') } else { titles.push(base); titles.push('Guía práctica: '+base); titles.push(base+' en español [Paso a paso]') } return titles }
function suggestMeta(p) { const desc=p.seoDescription||p.title; const metas=[]; metas.push((desc+' en español. Beneficios claros y ejemplos listos.').slice(0,160)); metas.push(('Aprende '+desc.toLowerCase()+' con IA. Mejora CTR y conversiones.').slice(0,160)); metas.push(('Guía en español: '+desc+'. Ver ejemplos y prompts.').slice(0,160)); return metas }

function updateMetadata(filePath, newTitle, newDesc) { let src=read(filePath); src=src.replace(/title:\s*'[^']*'\s*\|\s*Red Creativa Pro|title:\s*'[^']*'/, `title: '${newTitle} | Red Creativa Pro'`); src=src.replace(/description:\s*'[^']*'/, `description: '${newDesc}'`); src=src.replace(/openGraph:\s*\{[\s\S]*?title:\s*'[^']*'/, m=>m.replace(/title:\s*'[^']*'/, `title: '${newTitle} | Red Creativa Pro'`)); src=src.replace(/openGraph:\s*\{[\s\S]*?description:\s*'[^']*'/, m=>m.replace(/description:\s*'[^']*'/, `description: '${newDesc}'`)); src=src.replace(/twitter:\s*\{[\s\S]*?title:\s*'[^']*'/, m=>m.replace(/title:\s*'[^']*'/, `title: '${newTitle}'`)); src=src.replace(/twitter:\s*\{[\s\S]*?description:\s*'[^']*'/, m=>m.replace(/description:\s*'[^']*'/, `description: '${newDesc}'`)); write(filePath, src) }

function run(){
  const gaCsv=path.join(process.cwd(),'docs','seo','analytics','ga-pages.csv')
  if(!fs.existsSync(gaCsv)){ console.log('Falta docs/seo/analytics/ga-pages.csv'); process.exit(1) }
  const mode=arg('mode','fixed')
  const delta=parseFloat(arg('delta','0.2'))
  const fixedThreshold=parseFloat(arg('threshold','1.5'))
  const apply=arg('apply','false')==='true'
  const maxApply=parseInt(arg('maxApply','5'),10)
  const minAgeDays=parseInt(arg('minAgeDays','14'),10)
  const onlyCategory = arg('onlyCategory','')
  const excludeCategory = arg('excludeCategory','')
  const ctrMap=parseGaCsv(gaCsv)
  const posts=parsePosts()
  const ctrValues=[]
  posts.forEach(p=>{ const c=ctrMap.get(p.id); if(c!==undefined) ctrValues.push(c) })
  ctrValues.sort((a,b)=>a-b)
  const median=ctrValues.length? ctrValues[Math.floor(ctrValues.length/2)] : fixedThreshold
  const dynamicThreshold = mode==='median' ? median*(1-delta) : fixedThreshold
  const out=[]
  out.push('# Plan automático por CTR')
  out.push(`Modo: ${mode}`)
  out.push(`Mediana CTR: ${median}%`)
  out.push(`Umbral: ${dynamicThreshold}%`)
  out.push(`Máximo a aplicar: ${maxApply}`)
  out.push(`Edad mínima de publicación: ${minAgeDays} días`)
  out.push('')
  const targets=[]
  posts.forEach(p=>{ const ctr=ctrMap.get(p.id); if(ctr===undefined) return; if(onlyCategory && p.category !== onlyCategory) return; if(excludeCategory && p.category === excludeCategory) return; if(p.publishedAt){ const now=new Date(); const pub=new Date(p.publishedAt); const ageDays=Math.floor((now-pub)/86400000); if(ageDays<minAgeDays) return } if(ctr<dynamicThreshold){ targets.push({ id:p.id, ctr, post:p }) } })
  targets.sort((a,b)=>a.ctr-b.ctr)
  const toApply=targets.slice(0, maxApply)
  toApply.forEach(t=>{
    const titles=suggestTitle(t.post)
    const metas=suggestMeta(t.post)
    out.push(`## ${t.id}`)
    out.push(`CTR: ${t.ctr}%`)
    out.push(`Title*: ${titles[0]}`)
    out.push(`Meta*: ${metas[0]}`)
    out.push(`Comando: npm run seo:apply:suggest -- --id=${t.id} --titleIndex=1 --metaIndex=1 --apply=true`)
    out.push('')
    if(apply){ const filePath=path.join(process.cwd(),'app','blog',t.id,'page.tsx'); if(fs.existsSync(filePath)) updateMetadata(filePath, titles[0], metas[0]) }
  })
  const outPath=path.join(process.cwd(),'docs','seo','analytics','ctr-auto-plan.md')
  write(outPath, out.join('\n'))
  console.log('Generado:', outPath)
  if(!apply){
    const changeLines = []
    changeLines.push('# Plan de cambios pendientes por CTR')
    changeLines.push(`Umbral: ${dynamicThreshold}%`)
    changeLines.push('')
    toApply.forEach(t=>{
      const titles=suggestTitle(t.post)
      const metas=suggestMeta(t.post)
      changeLines.push(`## ${t.id}`)
      changeLines.push(`CTR: ${t.ctr}%`)
      changeLines.push(`Title sugerido: ${titles[0]}`)
      changeLines.push(`Meta sugerida: ${metas[0]}`)
      changeLines.push(`Comando: npm run seo:apply:suggest -- --id=${t.id} --titleIndex=1 --metaIndex=1 --apply=true`)
      changeLines.push('')
    })
    const changePath = path.join(process.cwd(),'docs','seo','analytics','ctr-change-plan.md')
    write(changePath, changeLines.join('\n'))
    console.log('Plan de cambios:', changePath)
  }
  if(apply){
    const d=new Date(); const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0')
    const summary=`# Resumen aplicación CTR (${y}-${m}-${day})\n\nUmbral: ${dynamicThreshold}%\nAplicados: ${toApply.length}\n\n${toApply.map(t=>`- ${t.id} (CTR ${t.ctr}%)`).join('\n')}`
    const sumPath=path.join(process.cwd(),'docs','seo','analytics',`ctr-auto-summary-${y}-${m}-${day}.md`)
    write(sumPath, summary)
    console.log('Resumen:', sumPath)
  }
}

run()
